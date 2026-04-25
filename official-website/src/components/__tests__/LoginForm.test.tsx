import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/store/auth'
import LoginForm from '@/components/auth/LoginForm'

vi.mock('@/lib/api', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn()
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn()
  })
}))

import { login, getCurrentUser } from '@/lib/api'

describe('LoginForm', () => {
  const mockLogin = vi.mocked(login)
  const mockGetCurrentUser = vi.mocked(getCurrentUser)
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

  it('renders login form with email and password fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByPlaceholderText('请输入邮箱')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument()
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('请输入邮箱') as HTMLInputElement
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('required')
  })

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('请输入邮箱') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    expect(emailInput.value).toBe('invalid-email')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('shows validation error for empty password', async () => {
    render(<LoginForm />)
    
    const passwordInput = screen.getByPlaceholderText('请输入密码') as HTMLInputElement
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('required')
  })

  it('calls login API with correct credentials', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          nickname: 'Test User',
          avatar: '/avatar.jpg',
          role: 'user',
          isVip: false,
          createdAt: '2024-01-01'
        },
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      }
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('stores user data and token on successful login', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          nickname: 'Test User',
          avatar: '/avatar.jpg',
          role: 'user',
          isVip: false,
          createdAt: '2024-01-01'
        },
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      }
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockAuthStore.login).toHaveBeenCalledWith(
        {
          id: 1,
          email: 'test@example.com',
          nickname: 'Test User',
          avatar: '/avatar.jpg',
          role: 'user',
          isVip: false,
          createdAt: '2024-01-01'
        },
        'test-token',
        ''
      )
    })
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误'
      }
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    
    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('邮箱或密码错误')).toBeInTheDocument()
    })
  })

  it('redirects to admin web for admin users', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'admin@example.com',
          nickname: 'Admin',
          avatar: '/avatar.jpg',
          role: 'admin',
          isVip: false,
          createdAt: '2024-01-01'
        },
        token: 'admin-token',
        refreshToken: 'admin-refresh-token'
      }
    })

    global.window = Object.create(window)
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/login'
      },
      writable: true
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')
    
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    
    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(window.location.href).toContain('localhost:5173')
    })
  })
})
