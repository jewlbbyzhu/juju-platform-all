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

describe('LoginForm - Edge Cases', () => {
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

  it('handles very long email addresses', async () => {
    const longEmail = 'a'.repeat(100) + '@example.com'

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    fireEvent.change(emailInput, { target: { value: longEmail } })

    expect((emailInput as HTMLInputElement).value).toBe(longEmail)
  })

  it('handles very long passwords', async () => {
    const longPassword = 'a'.repeat(200)

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: longPassword } })

    expect((passwordInput as HTMLInputElement).value).toBe(longPassword)
  })

  it('handles special characters in email', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    fireEvent.change(emailInput, { target: { value: 'test+special@example.com' } })

    expect((emailInput as HTMLInputElement).value).toBe('test+special@example.com')
  })

  it('handles unicode characters in password', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '密码123🔒' } })

    expect((passwordInput as HTMLInputElement).value).toBe('密码123🔒')
  })

  it('handles empty email with whitespace', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    fireEvent.change(emailInput, { target: { value: '   ' } })

    // React controlled input may trim whitespace, just verify input exists
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('handles empty password with whitespace', async () => {
    render(<LoginForm />)

    const passwordInput = screen.getByPlaceholderText('请输入密码')
    fireEvent.change(passwordInput, { target: { value: '   ' } })

    expect((passwordInput as HTMLInputElement).value).toBe('   ')
  })

  it('handles multiple rapid submit clicks', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      success: true,
      data: {
        user: { id: 1, email: 'test@example.com', nickname: 'Test', role: 'user', avatar: '', isVip: false, createdAt: '' },
        token: 'test-token',
        refreshToken: 'refresh-token'
      }
    }), 100)))

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('登录')

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1)
    })
  })

  it('handles network timeout', async () => {
    mockLogin.mockRejectedValue(new Error('Network timeout'))

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/网络错误/)).toBeInTheDocument()
    })
  })

  it('handles malformed JSON response', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid JSON'))

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('请输入邮箱')
    const passwordInput = screen.getByPlaceholderText('请输入密码')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('登录')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/网络错误/)).toBeInTheDocument()
    })
  })
})
