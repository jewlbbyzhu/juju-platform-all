import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/modules/auth'
import { handleError } from '@/utils/errorHandler'
import router from '@/router'

// Create axios instance
// 使用生产环境API地址
const PROD_API_URL = 'https://api.hfparty.asia/api/v2'

// 根据环境选择API地址
// 优先使用环境变量配置的API地址，如果没有配置则使用默认生产环境地址
const baseURL = import.meta.env.VITE_API_BASE_URL || PROD_API_URL

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token refresh flag to prevent multiple refresh requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    
    // Add auth token
    if (authStore.token && !config.url?.includes('/login')) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, config, headers } = response
    
    console.log('[Response Interceptor] URL:', config.url, 'Data:', data)
    
    // Bypass for binary responses (export/download)
    const ct = (headers['content-type'] || '').toLowerCase()
    if (config.responseType === 'blob' || ct.includes('text/csv') || ct.includes('application/octet-stream')) {
      return data
    }

    // Handle successful JSON response
    if (data && typeof data === 'object' && 'success' in data) {
      if (data.success) {
        // 后端返回的数据结构有两种可能：
        // 1. {success: true, total: 16, page: 1, pageSize: 20, data: [...]}
        // 2. {success: true, data: {total: 31, page: 1, limit: 20, data: [...]}}
        
        let result: any
        
        // 判断是哪种结构：如果 data.data 是数组，则是结构1；如果是对象，则是结构2
        if (data.data !== undefined && Array.isArray(data.data)) {
          // 结构1：数据直接在 data.data 中，其他字段在根级别
          result = { ...data }
          delete result.success
          // 将 data 字段映射为 list
          result.list = result.data
          delete result.data
        } else if (data.data !== undefined && typeof data.data === 'object' && !Array.isArray(data.data)) {
          // 结构2：数据在 data.data.data 中，分页信息在 data.data 中
          result = { ...data.data }
          // 将 data 字段映射为 list
          if ('data' in result && !('list' in result)) {
            result.list = result.data
            delete result.data
          }
        } else {
          // 直接返回整个响应（排除 success 字段）
          result = { ...data }
          delete result.success
        }
        
        // 统一字段名：将 limit 映射为 pageSize
        if (result && typeof result === 'object' && 'limit' in result && !('pageSize' in result)) {
          result.pageSize = result.limit
        }
        
        console.log('[Response Interceptor] Returning result:', result)
        return result
      }
      const error = new Error(data.message || '请求失败')
      handleError(error)
      return Promise.reject(error)
    }

    // Fallback: return raw data
    console.log('[Response Interceptor] Returning raw data:', data)
    return data
  },
  async (error) => {
    const { response, config } = error
    const authStore = useAuthStore()

    // Handle blob response errors (e.g., export failures)
    if (response && config?.responseType === 'blob') {
      const ct = (response.headers?.['content-type'] || '').toLowerCase()
      // If the blob response is actually JSON error, parse it
      if (ct.includes('application/json')) {
        try {
          const text = await response.data.text()
          const jsonData = JSON.parse(text)
          error.response.data = jsonData
        } catch (e) {
          // Failed to parse blob as JSON, keep original error
        }
      }
    }

    if (response) {
      const { status } = response

      // Handle 401 - Token expired
      if (status === 401) {
        // Token expired, try to refresh
        if (authStore.refreshToken && !config.url?.includes('/auth/refresh')) {
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then((newToken) => {
              if (newToken) {
                config.headers = config.headers || {}
                config.headers.Authorization = `Bearer ${newToken}`
              }
              return request(config)
            })
          }
          
          isRefreshing = true
          
          try {
            const tokenResponse = await authStore.refreshAuthToken()
            processQueue(null, tokenResponse.token)
            
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${tokenResponse.token}`
            return request(config)
          } catch (refreshError) {
            processQueue(refreshError, null)
            authStore.logout()
            router.push('/login')
            handleError(refreshError)
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          // No refresh token or refresh failed
          authStore.logout()
          router.push('/login')
          handleError(error)
        }
      } else {
        // Handle other errors through global error handler
        handleError(error)
      }
    } else {
      // Network error
      handleError(error)
    }
    
    return Promise.reject(error)
  }
)

export default request
