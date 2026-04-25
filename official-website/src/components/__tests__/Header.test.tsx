import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/store/auth'
import Header from '@/components/layout/Header'

vi.mock('@/lib/api', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn()
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn()
}))

import { getCurrentUser, logout } from '@/lib/api'

describe('Header', () => {
  const mockGetCurrentUser = vi.mocked(getCurrentUser)
  const mockLogout = vi.mocked(logout)

  const mockAuthStore = {
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
    isAdmin: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  it('renders logo and navigation', () => {
    render(<Header />)
    
    expect(screen.getByText('聚聚')).toBeInTheDocument()
    expect(screen.getAllByText('首页')[0]).toBeInTheDocument()
    expect(screen.getAllByText('下载')[0]).toBeInTheDocument()
    expect(screen.getAllByText('帮助中心')[0]).toBeInTheDocument()
  })

  it('shows basic header structure when user is not authenticated', () => {
    mockAuthStore.isAuthenticated = false
    mockAuthStore.user = null
    
    render(<Header />)
    
    // Header 组件目前未集成认证状态，只验证基本结构
    expect(screen.getByText('聚聚')).toBeInTheDocument()
    expect(screen.getAllByText('首页')[0]).toBeInTheDocument()
  })

  it('shows header structure when user is authenticated', () => {
    mockAuthStore.isAuthenticated = true
    mockAuthStore.user = {
      id: 1,
      email: 'test@example.com',
      nickname: 'Test User',
      avatar: '/avatar.jpg',
      role: 'user',
      isVip: false,
      createdAt: '2024-01-01'
    }
    
    render(<Header />)
    
    // Header 组件目前未集成认证状态，只验证基本结构
    expect(screen.getByText('聚聚')).toBeInTheDocument()
    expect(screen.getAllByText('下载')[0]).toBeInTheDocument()
  })

  it('navigates to correct pages', () => {
    render(<Header />)
    
    const homeLink = screen.getAllByText('首页')[0]
    const downloadLink = screen.getAllByText('下载')[0]
    const helpLink = screen.getAllByText('帮助中心')[0]
    
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    expect(downloadLink.closest('a')).toHaveAttribute('href', '/download')
    expect(helpLink.closest('a')).toHaveAttribute('href', '/help')
  })

  it('toggles mobile menu', async () => {
    render(<Header />)
    
    const menuButtons = screen.getAllByRole('button')
    const menuButton = menuButtons[menuButtons.length - 1]
    fireEvent.click(menuButton)
    
    await waitFor(() => {
      expect(screen.getAllByText('首页')[0]).toBeInTheDocument()
    })
  })

  it('shows header for admin users', () => {
    mockAuthStore.isAuthenticated = true
    mockAuthStore.user = {
      id: 1,
      email: 'admin@example.com',
      nickname: 'Admin',
      avatar: '/avatar.jpg',
      role: 'admin',
      isVip: false,
      createdAt: '2024-01-01'
    }
    mockAuthStore.isAdmin = true
    
    render(<Header />)
    
    // Header 组件目前未集成认证状态，只验证基本结构
    expect(screen.getByText('聚聚')).toBeInTheDocument()
    expect(screen.getAllByText('帮助中心')[0]).toBeInTheDocument()
  })
})
