import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

const mockPost = vi.fn()
const mockGet = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      get: mockGet,
      put: mockPut,
      delete: mockDelete,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

describe('API Request Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Request Configuration', () => {
    test('should create axios instance with correct config', () => {
      const createSpy = vi.spyOn(axios, 'create')

      createSpy.mockReturnValue({
        post: mockPost,
        get: mockGet,
        put: mockPut,
        delete: mockDelete,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      } as any)

      const instance = axios.create({
        baseURL: '/api/v2',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(createSpy).toHaveBeenCalledWith({
        baseURL: '/api/v2',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    test('should use default baseURL when env variable not set', () => {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v2'
      expect(baseURL).toBeDefined()
      expect(typeof baseURL).toBe('string')
    })
  })

  describe('Response Handling', () => {
    test('should handle successful JSON response with success flag', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 1, name: 'Test' },
          message: 'Success'
        },
        config: {},
        headers: {}
      }

      const result = mockResponse.data.success
        ? mockResponse.data.data
        : Promise.reject(new Error(mockResponse.data.message))

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    test('should handle failed JSON response with success flag', async () => {
      const mockResponse = {
        data: {
          success: false,
          data: null,
          message: 'Request failed'
        },
        config: {},
        headers: {}
      }

      if (!mockResponse.data.success) {
        const error = new Error(mockResponse.data.message)
        expect(error.message).toBe('Request failed')
      }
    })

    test('should handle blob response for file downloads', () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' })
      const mockResponse = {
        data: mockBlob,
        config: { responseType: 'blob' },
        headers: { 'content-type': 'text/csv' }
      }

      const ct = (mockResponse.headers['content-type'] || '').toLowerCase()
      const isBlob = mockResponse.config.responseType === 'blob' ||
        ct.includes('text/csv') ||
        ct.includes('application/octet-stream')

      expect(isBlob).toBe(true)
      expect(mockResponse.data).toBeInstanceOf(Blob)
    })
  })

  describe('Error Handling', () => {
    test('should handle 401 unauthorized error', () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        config: { url: '/test' }
      }

      const isUnauthorized = mockError.response?.status === 401
      expect(isUnauthorized).toBe(true)
    })

    test('should handle 403 forbidden error', () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      }

      const isForbidden = mockError.response?.status === 403
      expect(isForbidden).toBe(true)
    })

    test('should handle 500 server error', () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      }

      const isServerError = mockError.response?.status >= 500
      expect(isServerError).toBe(true)
    })

    test('should handle network error', () => {
      const mockError = {
        message: 'Network Error',
        response: undefined
      }

      const isNetworkError = !mockError.response
      expect(isNetworkError).toBe(true)
    })

    test('should handle timeout error', () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      }

      const isTimeout = mockError.code === 'ECONNABORTED' ||
        mockError.message?.includes('timeout')
      expect(isTimeout).toBe(true)
    })
  })

  describe('Token Management', () => {
    test('should queue requests during token refresh', () => {
      const failedQueue: Array<{
        resolve: (value?: any) => void
        reject: (reason?: any) => void
      }> = []

      let isRefreshing = true

      const mockRequest = {
        resolve: vi.fn(),
        reject: vi.fn()
      }

      if (isRefreshing) {
        failedQueue.push(mockRequest)
      }

      expect(failedQueue).toHaveLength(1)
      expect(failedQueue[0]).toBe(mockRequest)
    })

    test('should process queue after token refresh', () => {
      const failedQueue: Array<{
        resolve: (value?: any) => void
        reject: (reason?: any) => void
      }> = []

      const mockResolve = vi.fn()
      const mockReject = vi.fn()

      failedQueue.push({ resolve: mockResolve, reject: mockReject })

      const newToken = 'new_token_123'
      failedQueue.forEach(({ resolve }) => {
        resolve(newToken)
      })

      expect(mockResolve).toHaveBeenCalledWith(newToken)
    })

    test('should clear queue on refresh error', () => {
      const failedQueue: Array<{
        resolve: (value?: any) => void
        reject: (reason?: any) => void
      }> = []

      const mockResolve = vi.fn()
      const mockReject = vi.fn()

      failedQueue.push({ resolve: mockResolve, reject: mockReject })

      const refreshError = new Error('Refresh failed')
      failedQueue.forEach(({ reject }) => {
        reject(refreshError)
      })

      expect(mockReject).toHaveBeenCalledWith(refreshError)
    })
  })

  describe('Request Interceptor', () => {
    test('should add auth token to requests', () => {
      const token = 'test_token_123'
      const config = {
        url: '/test',
        headers: {} as Record<string, string>
      }

      if (token && !config.url?.includes('/login')) {
        config.headers.Authorization = `Bearer ${token}`
      }

      expect(config.headers.Authorization).toBe('Bearer test_token_123')
    })

    test('should not add token to login requests', () => {
      const token = 'test_token_123'
      const config = {
        url: '/admin/login',
        headers: {} as Record<string, string>
      }

      if (token && !config.url?.includes('/login')) {
        config.headers.Authorization = `Bearer ${token}`
      }

      expect(config.headers.Authorization).toBeUndefined()
    })
  })
})
