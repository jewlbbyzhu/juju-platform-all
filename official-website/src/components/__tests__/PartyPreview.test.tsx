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

describe('PartyPreview', () => {
  const mockGetPublishedParties = vi.mocked(getPublishedParties)

  const mockParties = [
    {
      id: 1,
      title: '周末音乐派对',
      description: '一起享受美妙的音乐时光',
      category: 0,
      images: ['https://example.com/party1.jpg'],
      startTime: '2024-01-20T19:00:00',
      endTime: '2024-01-20T23:00:00',
      location: {
        address: '北京市朝阳区三里屯',
        latitude: 39.9343,
        longitude: 116.4553
      },
      minPrice: 9900,
      maxParticipants: 50,
      currentParticipants: 32,
      status: 'ongoing',
      coverImage: 'https://example.com/party1.jpg'
    },
    {
      id: 2,
      title: '户外徒步探险',
      description: '探索自然，挑战自我',
      category: 1,
      images: ['https://example.com/party2.jpg'],
      startTime: '2024-01-21T08:00:00',
      endTime: '2024-01-21T18:00:00',
      location: {
        address: '北京市海淀区香山',
        latitude: 39.9926,
        longitude: 116.1876
      },
      minPrice: 12800,
      maxParticipants: 30,
      currentParticipants: 18,
      status: 'ongoing',
      coverImage: 'https://example.com/party2.jpg'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockGetPublishedParties.mockReturnValue(new Promise(() => {}))
    
    render(<PartyPreview />)
    
    expect(screen.getByText('热门聚会')).toBeInTheDocument()
    expect(screen.getByText('发现身边正在进行的精彩活动')).toBeInTheDocument()
  })

  it('renders party cards after successful fetch', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: mockParties
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('周末音乐派对')).toBeInTheDocument()
      expect(screen.getByText('户外徒步探险')).toBeInTheDocument()
    })
  })

  it('displays party information correctly', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: mockParties
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('周末音乐派对')).toBeInTheDocument()
      expect(screen.getByText('一起享受美妙的音乐时光')).toBeInTheDocument()
      expect(screen.getByText('北京市朝阳区三里屯')).toBeInTheDocument()
      expect(screen.getAllByText((content, element) => {
        return element?.textContent?.includes('32') && element?.textContent?.includes('50')
      })[0]).toBeInTheDocument()
      expect(screen.getByText('¥99.00 起')).toBeInTheDocument()
    })
  })

  it('handles party with no participants', async () => {
    const partyWithNoParticipants = [
      {
        ...mockParties[0],
        currentParticipants: 0
      }
    ]

    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: partyWithNoParticipants
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getAllByText((content, element) => {
        return element?.textContent?.includes('0') && element?.textContent?.includes('50')
      })[0]).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '网络错误，请稍后重试'
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('网络错误，请稍后重试')).toBeInTheDocument()
      expect(screen.getByText('重试')).toBeInTheDocument()
    })
  })

  it('reloads page on retry button click', async () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    })

    mockGetPublishedParties.mockResolvedValue({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '网络错误，请稍后重试'
      }
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(screen.getByText('重试')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('重试')
    fireEvent.click(retryButton)

    expect(reloadSpy).toHaveBeenCalled()
  })

  it('calls getPublishedParties with correct parameters', async () => {
    mockGetPublishedParties.mockResolvedValue({
      success: true,
      data: mockParties
    })

    render(<PartyPreview />)

    await waitFor(() => {
      expect(mockGetPublishedParties).toHaveBeenCalledWith({
        page: 1,
        pageSize: 3
      })
    })
  })
})
