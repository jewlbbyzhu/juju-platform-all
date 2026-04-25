import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PartyPreview from '@/components/marketing/PartyPreview'

vi.mock('@/lib/api', () => ({
  getPublishedParties: vi.fn()
}))

vi.mock('@/components/ui/OptimizedImage', () => ({
  default: (props: any) => {
    const { src, alt, className } = props
    return <img src={src} alt={alt} className={className} data-testid="optimized-image" />
  }
}))

import { getPublishedParties } from '@/lib/api'

describe('PartyPreview - Edge Cases', () => {
  const mockGetPublishedParties = vi.mocked(getPublishedParties)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles empty party list', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [],
        total: 0,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('热门聚会')).toBeInTheDocument()
      expect(screen.queryByText(/周末音乐派对/)).not.toBeInTheDocument()
    })
  })

  it('handles very large party list', async () => {
    const largePartyList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `聚会 ${i}`,
      description: `描述 ${i}`,
      category: 0,
      images: ['https://example.com/party.jpg'],
      startTime: '2024-01-20T19:00:00',
      location: {
        address: `地址 ${i}`,
        latitude: 39.9343,
        longitude: 116.4553
      },
      minPrice: 9900,
      maxParticipants: 50,
      currentParticipants: 32,
      status: 'ongoing'
    }))

    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: largePartyList,
        total: 100,
        limit: 100,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('聚会 0')).toBeInTheDocument()
      expect(screen.getByText('聚会 99')).toBeInTheDocument()
    })
  })

  it('handles party with missing images', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: '周末音乐派对',
          description: '一起享受美妙的音乐时光',
          category: 0,
          images: [],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 9900,
          maxParticipants: 50,
          currentParticipants: 32,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('周末音乐派对')).toBeInTheDocument()
    })
  })

  it('handles party with very long titles', async () => {
    const longTitle = '这是一个非常非常非常非常非常非常长的聚会标题，用来测试UI如何处理超长文本'
    
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: longTitle,
          description: '描述',
          category: 0,
          images: ['https://example.com/party.jpg'],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 9900,
          maxParticipants: 50,
          currentParticipants: 32,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })
  })

  it('handles party with special characters in description', async () => {
    const specialDescription = '这是一个包含特殊字符的描述：!@#$%^&*()_+-=[]{}|;:\'"<>?/~`'
    
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: '周末音乐派对',
          description: specialDescription,
          category: 0,
          images: ['https://example.com/party.jpg'],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 9900,
          maxParticipants: 50,
          currentParticipants: 32,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText(specialDescription)).toBeInTheDocument()
    })
  })

  it('handles party with zero price', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: '免费聚会',
          description: '完全免费的活动',
          category: 0,
          images: ['https://example.com/party.jpg'],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 0,
          maxParticipants: 50,
          currentParticipants: 32,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('¥0.00 起')).toBeInTheDocument()
    })
  })

  it('handles party with very high price', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: '豪华聚会',
          description: '非常昂贵的活动',
          category: 0,
          images: ['https://example.com/party.jpg'],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 999999,
          maxParticipants: 50,
          currentParticipants: 32,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('¥9999.99 起')).toBeInTheDocument()
    })
  })

  it('handles party with full capacity', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: '已满员聚会',
          description: '名额已满',
          category: 0,
          images: ['https://example.com/party.jpg'],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 9900,
          maxParticipants: 50,
          currentParticipants: 50,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('50/50 人')).toBeInTheDocument()
    })
  })

  it('handles party with no participants', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: {
        parties: [{
          id: 1,
          title: '新聚会',
          description: '暂无参与者',
          category: 0,
          images: ['https://example.com/party.jpg'],
          startTime: '2024-01-20T19:00:00',
          location: {
            address: '北京市朝阳区三里屯',
            latitude: 39.9343,
            longitude: 116.4553
          },
          minPrice: 9900,
          maxParticipants: 50,
          currentParticipants: 0,
          status: 'ongoing'
        }],
        total: 1,
        limit: 3,
        offset: 0
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('0/50 人')).toBeInTheDocument()
    })
  })
})
