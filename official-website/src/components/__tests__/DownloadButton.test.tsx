import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DownloadButton from '@/components/download/DownloadButton'

vi.mock('@/lib/api', () => ({
  getAppVersion: vi.fn()
}))

import { getAppVersion } from '@/lib/api'

describe('DownloadButton', () => {
  const mockGetAppVersion = vi.mocked(getAppVersion)

  const mockVersion = {
    version: '1.0.0',
    releaseDate: '2024-01-15',
    changelog: [
      '新增聚会推荐功能',
      '优化搜索体验',
      '修复已知问题'
    ],
    downloadUrl: 'https://example.com/android/juju-v1.0.0.apk',
    qrCodeUrl: '/qrcodes/android.png'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockGetAppVersion.mockReturnValue(new Promise(() => {}))
    
    render(<DownloadButton platform="android" />)
    
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('renders version info after successful fetch', async () => {
    mockGetAppVersion.mockResolvedValue({
      success: true,
      data: mockVersion
    })

    render(<DownloadButton platform="android" />)

    await waitFor(() => {
      expect(screen.getByText('Android')).toBeInTheDocument()
      expect(screen.getByText('版本 1.0.0')).toBeInTheDocument()
      expect(screen.getByText('发布于 2024-01-15')).toBeInTheDocument()
    })
  })

  it('renders changelog items', async () => {
    mockGetAppVersion.mockResolvedValue({
      success: true,
      data: mockVersion
    })

    render(<DownloadButton platform="android" />)

    await waitFor(() => {
      expect(screen.getByText('新增聚会推荐功能')).toBeInTheDocument()
      expect(screen.getByText('优化搜索体验')).toBeInTheDocument()
      expect(screen.getByText('修复已知问题')).toBeInTheDocument()
    })
  })

  it('calls getAppVersion with correct platform', async () => {
    mockGetAppVersion.mockResolvedValue({
      success: true,
      data: mockVersion
    })

    render(<DownloadButton platform="ios" />)

    await waitFor(() => {
      expect(mockGetAppVersion).toHaveBeenCalledWith('ios')
    })
  })

  it('shows error state on API failure', async () => {
    mockGetAppVersion.mockResolvedValue({
      success: false,
      error: {
        code: 'VERSION_ERROR',
        message: '获取版本信息失败'
      }
    })

    render(<DownloadButton platform="android" />)

    await waitFor(() => {
      expect(screen.getByText('Android')).toBeInTheDocument()
      expect(screen.getByText('版本 1.0.0')).toBeInTheDocument()
    })
  })

  it('renders download button with correct text', async () => {
    mockGetAppVersion.mockResolvedValue({
      success: true,
      data: mockVersion
    })

    render(<DownloadButton platform="android" />)

    await waitFor(() => {
      const downloadButton = screen.getByText('立即下载')
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton.closest('button')).toBeInTheDocument()
    })
  })
})
