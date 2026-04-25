import { describe, it, expect, vi } from 'vitest'
import { apiRequest } from '@/lib/api'

global.fetch = vi.fn()

describe('API Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Network Errors', () => {
    it('handles connection timeout', async () => {
      vi.mocked(global.fetch).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 100)
        )
      )

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })

    it('handles connection refused', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Connection refused'))

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })

    it('handles DNS resolution failure', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('DNS resolution failed'))

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })
  })

  describe('HTTP Errors', () => {
    it('handles 400 Bad Request', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { code: 'BAD_REQUEST', message: 'Bad request' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BAD_REQUEST')
    })

    it('handles 401 Unauthorized', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_REFRESH_FAILED')
    })

    it('handles 403 Forbidden', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: { code: 'FORBIDDEN', message: 'Forbidden' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })

    it('handles 404 Not Found', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { code: 'NOT_FOUND', message: 'Not found' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NOT_FOUND')
    })

    it('handles 429 Too Many Requests', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('TOO_MANY_REQUESTS')
    })

    it('handles 500 Internal Server Error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INTERNAL_ERROR')
    })

    it('handles 502 Bad Gateway', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ error: { code: 'BAD_GATEWAY', message: 'Bad gateway' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BAD_GATEWAY')
    })

    it('handles 503 Service Unavailable', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE')
    })

    it('handles 504 Gateway Timeout', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 504,
        json: async () => ({ error: { code: 'GATEWAY_TIMEOUT', message: 'Gateway timeout' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('GATEWAY_TIMEOUT')
    })
  })

  describe('Data Errors', () => {
    it('handles invalid JSON response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BUSINESS_ERROR')
    })

    it('handles empty response body', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BUSINESS_ERROR')
    })

    it('handles null response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => null
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BUSINESS_ERROR')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long request URL', async () => {
      const longUrl = '/'.repeat(1000) + 'test'
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      } as Response)

      const result = await apiRequest(longUrl)

      expect(result.success).toBe(true)
    })

    it('handles very large request payload', async () => {
      const largePayload = { data: 'x'.repeat(1000000) }
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      } as Response)

      const result = await apiRequest('/test', {
        method: 'POST',
        body: JSON.stringify(largePayload)
      })

      expect(result.success).toBe(true)
    })

    it('handles special characters in request', async () => {
      const specialPayload = { data: '!@#$%^&*()_+-=[]{}|;:\'"<>?/~`' }
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      } as Response)

      const result = await apiRequest('/test', {
        method: 'POST',
        body: JSON.stringify(specialPayload)
      })

      expect(result.success).toBe(true)
    })

    it('handles unicode characters in request', async () => {
      const unicodePayload = { data: '测试数据🎉🔒🌟' }
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      } as Response)

      const result = await apiRequest('/test', {
        method: 'POST',
        body: JSON.stringify(unicodePayload)
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Authorization', () => {
    it('includes token in headers when available', async () => {
      localStorage.setItem('token', 'test-token')
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
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

    it('does not include token when not available', async () => {
      localStorage.removeItem('token')
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      } as Response)

      await apiRequest('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      )
    })

    it('handles expired token', async () => {
      localStorage.setItem('token', 'expired-token')
      
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } })
      } as Response)

      const result = await apiRequest('/test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_REFRESH_FAILED')
    })
  })
})
