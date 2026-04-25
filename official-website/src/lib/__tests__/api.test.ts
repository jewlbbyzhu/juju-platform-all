import { describe, it, expect, vi } from 'vitest'
import { apiRequest, login, logout, getCurrentUser, getParties, getAppVersion } from '@/lib/api'

global.fetch = vi.fn()

describe('API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('apiRequest', () => {
    it('makes successful request', async () => {
      const mockResponse = { success: true, data: { id: 1 } }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await apiRequest('/test')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('handles failed request', async () => {
      const mockResponse = { error: { code: 'ERROR', message: 'Error message' } }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => mockResponse
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('includes authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token')
      const mockResponse = { success: true, data: {} }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await apiRequest('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('handles network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })
  })

  describe('login', () => {
    it('sends login request with credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com', nickname: 'Test', role: 'user', avatar: '', isVip: false, createdAt: '' },
          token: 'test-token',
          refreshToken: 'test-refresh-token'
        }
      }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await login({ email: 'test@example.com', password: 'password' })

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' })
        })
      )
    })
  })

  describe('logout', () => {
    it('sends logout request', async () => {
      const mockResponse = { success: true }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await logout()

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('getCurrentUser', () => {
    it('fetches current user data', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, email: 'test@example.com', nickname: 'Test' }
      }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.data)
    })
  })

  describe('getParties', () => {
    it('fetches parties with default parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          parties: [],
          total: 0,
          limit: 10,
          offset: 0
        }
      }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await getParties()

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/parties?page=1&pageSize=20'),
        expect.any(Object)
      )
    })

    it('fetches parties with custom parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          parties: [],
          total: 0,
          limit: 5,
          offset: 10
        }
      }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await getParties({ page: 2, pageSize: 5, category: 1, status: 'ongoing' })

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/parties?page=2&pageSize=5&category=1&status=ongoing'),
        expect.any(Object)
      )
    })
  })

  describe('getAppVersion', () => {
    it('fetches app version for platform', async () => {
      const mockResponse = {
        success: true,
        data: {
          version: '1.0.0',
          releaseDate: '2024-01-15',
          changelog: [],
          downloadUrl: 'https://example.com/app.apk',
          qrCodeUrl: '/qrcodes/app.png'
        }
      }
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await getAppVersion('android')

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/appversion/android'),
        expect.any(Object)
      )
    })
  })
})
