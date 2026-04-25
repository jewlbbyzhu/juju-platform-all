import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/modules/auth'
import { authAPI } from '@/api/modules/auth'
import { 
  isValidToken,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
} from '@/utils/auth'

// Mock API responses
const mockLoginResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature',
  refreshToken: 'refresh_token_123',
  user: {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    role: 'super_admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  permissions: ['dashboard:view', 'user:view', 'user:edit', 'admin:manage'],
  expiresIn: 3600
}

// Mock authAPI
vi.mock('@/api/modules/auth', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn(),
    getUserInfo: vi.fn(),
    refreshToken: vi.fn(),
    getPermissions: vi.fn(),
  }
}))

describe('Authentication System Integration Tests', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup default mock implementations
    vi.mocked(authAPI.login).mockResolvedValue(mockLoginResponse)
    vi.mocked(authAPI.logout).mockResolvedValue(undefined)
    vi.mocked(authAPI.getUserInfo).mockResolvedValue(mockLoginResponse.user)
    vi.mocked(authAPI.refreshToken).mockResolvedValue({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature',
      refreshToken: 'new_refresh_token',
      expiresIn: 3600
    })
  })

  describe('Login Flow Integration', () => {
    test('should complete full login flow successfully', async () => {
      // Test login process
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })

      // Verify API was called
      expect(authAPI.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123'
      })

      // Verify store state
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.userInfo).toEqual(mockLoginResponse.user)
      expect(authStore.permissions).toEqual(mockLoginResponse.permissions)
      expect(authStore.token).toBe(mockLoginResponse.token)
    })

    test('should handle login failure correctly', async () => {
      const loginError = new Error('Invalid credentials')
      loginError.code = 'AUTH_001'
      vi.mocked(authAPI.login).mockRejectedValue(loginError)

      await expect(authStore.login({
        username: 'admin',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid credentials')

      // Verify store state remains unauthenticated
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.userInfo).toBe(null)
      expect(authStore.token).toBeFalsy() // Could be null or undefined
      expect(authStore.lastError).toEqual({
        code: 'AUTH_001',
        message: 'Invalid credentials',
        details: loginError
      })
    })

    test('should handle token expiration and refresh', async () => {
      // Set up initial authenticated state
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })

      // Simulate token refresh
      const newTokenResponse = await authStore.refreshAuthToken()

      expect(authAPI.refreshToken).toHaveBeenCalledWith(mockLoginResponse.refreshToken)
      expect(authStore.token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature')
      expect(newTokenResponse.token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature')
    })

    test('should logout and clear all data', async () => {
      // Set up authenticated state
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })

      // Logout
      await authStore.logout()

      expect(authAPI.logout).toHaveBeenCalled()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.userInfo).toBe(null)
      expect(authStore.token).toBe(null)
      expect(authStore.permissions).toEqual([])
    })
  })

  describe('Permission System Integration', () => {
    beforeEach(async () => {
      // Set up authenticated state
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })
    })

    test('should check permissions correctly', () => {
      expect(authStore.hasPermission('dashboard:view')).toBe(true)
      expect(authStore.hasPermission('user:view')).toBe(true)
      expect(authStore.hasPermission('nonexistent:permission')).toBe(false)
    })

    test('should check any permissions correctly', () => {
      expect(authStore.hasAnyPermission(['dashboard:view', 'user:view'])).toBe(true)
      expect(authStore.hasAnyPermission(['nonexistent:permission', 'user:view'])).toBe(true)
      expect(authStore.hasAnyPermission(['nonexistent:permission', 'another:nonexistent'])).toBe(false)
    })

    test('should check all permissions correctly', () => {
      expect(authStore.hasAllPermissions(['dashboard:view', 'user:view'])).toBe(true)
      expect(authStore.hasAllPermissions(['dashboard:view', 'nonexistent:permission'])).toBe(false)
    })

    test('should use utility permission functions correctly', () => {
      const userPermissions = ['dashboard:view', 'user:view', 'user:edit']
      
      expect(hasPermission('dashboard:view', userPermissions)).toBe(true)
      expect(hasPermission('nonexistent:permission', userPermissions)).toBe(false)
      
      expect(hasAnyPermission(['dashboard:view', 'user:view'], userPermissions)).toBe(true)
      expect(hasAnyPermission(['nonexistent:permission', 'user:view'], userPermissions)).toBe(true)
      expect(hasAnyPermission(['nonexistent:permission', 'another:nonexistent'], userPermissions)).toBe(false)
      
      expect(hasAllPermissions(['dashboard:view', 'user:view'], userPermissions)).toBe(true)
      expect(hasAllPermissions(['dashboard:view', 'nonexistent:permission'], userPermissions)).toBe(false)
    })
  })

  describe('Token Management Integration', () => {
    test('should validate tokens correctly', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature'
      const invalidToken = 'invalid.token'
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.signature'

      expect(isValidToken(validToken)).toBe(true)
      expect(isValidToken(invalidToken)).toBe(false)
      expect(isValidToken(expiredToken)).toBe(false)
    })

    test('should handle authentication state correctly', async () => {
      // Initially not authenticated
      expect(authStore.isAuthenticated).toBe(false)
      
      // Login
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })
      
      expect(authStore.isAuthenticated).toBe(true)
      
      // Logout
      await authStore.logout()
      
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle network errors during login', async () => {
      const networkError = new Error('Network Error')
      networkError.code = 'AUTH_006'
      vi.mocked(authAPI.login).mockRejectedValue(networkError)

      await expect(authStore.login({
        username: 'admin',
        password: 'password123'
      })).rejects.toThrow('Network Error')

      expect(authStore.lastError).toEqual({
        code: 'AUTH_006',
        message: 'Network Error',
        details: networkError
      })
    })

    test('should handle token refresh failure', async () => {
      // Set up authenticated state
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })

      // Mock refresh failure
      vi.mocked(authAPI.refreshToken).mockRejectedValue(new Error('Refresh failed'))

      await expect(authStore.refreshAuthToken()).rejects.toThrow('Refresh failed')

      // Should logout user after refresh failure
      expect(authStore.isAuthenticated).toBe(false)
    })

    test('should handle API errors gracefully', async () => {
      const apiError = new Error('Server Error')
      apiError.code = 'SERVER_ERROR'
      vi.mocked(authAPI.getUserInfo).mockRejectedValue(apiError)

      await expect(authStore.getUserInfo()).rejects.toThrow('Server Error')
      
      // Store should handle error without crashing
      expect(authStore.isLoading).toBe(false)
    })
  })

  describe('Authentication Flow Completeness', () => {
    test('should complete full authentication cycle', async () => {
      // 1. Login
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })
      
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.hasPermission('dashboard:view')).toBe(true)
      
      // 2. Refresh token
      await authStore.refreshAuthToken()
      
      expect(authStore.token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature')
      expect(authStore.isAuthenticated).toBe(true)
      
      // 3. Get user info
      await authStore.getUserInfo()
      
      expect(authAPI.getUserInfo).toHaveBeenCalled()
      
      // 4. Logout
      await authStore.logout()
      
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.userInfo).toBe(null)
      expect(authStore.permissions).toEqual([])
    })

    test('should maintain permission consistency throughout session', async () => {
      await authStore.login({
        username: 'admin',
        password: 'password123'
      })
      
      // Check permissions are available
      expect(authStore.permissions).toEqual(mockLoginResponse.permissions)
      expect(authStore.hasPermission('dashboard:view')).toBe(true)
      expect(authStore.hasAnyPermission(['user:view', 'user:edit'])).toBe(true)
      expect(authStore.hasAllPermissions(['dashboard:view', 'user:view'])).toBe(true)
      
      // Refresh token should maintain permissions
      await authStore.refreshAuthToken()
      
      expect(authStore.permissions).toEqual(mockLoginResponse.permissions)
      expect(authStore.hasPermission('dashboard:view')).toBe(true)
    })
  })
})