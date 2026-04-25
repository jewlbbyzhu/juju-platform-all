// API 基础配置
// 本地开发后端API地址
const LOCAL_API_URL = 'http://localhost:3000/api'  // 本地后端API

// 服务器后端API地址
const SERVER_API_URL = 'http://122.51.255.13:3010/api'  // 服务器后端API

// 环境切换: 开发环境使用本地后端，生产环境使用服务器后端
const isDev = process.env.NODE_ENV === 'development' || true // 默认使用开发环境

// 使用本地后端 (开发环境)
export const API_BASE_URL = isDev ? LOCAL_API_URL : SERVER_API_URL

// 请求配置
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  header?: Record<string, string>
  timeout?: number
}

// 响应结构
interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 请求拦截器
const requestInterceptor = (config: RequestConfig): RequestConfig => {
  // 添加 token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加基础 header
  config.header = {
    'Content-Type': 'application/json',
    ...config.header
  }
  
  return config
}

// 响应拦截器
const responseInterceptor = <T>(response: any): ApiResponse<T> => {
  const { statusCode, data } = response
  
  // 处理 HTTP 错误
  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`HTTP ${statusCode}: 请求失败`)
  }
  
  // 处理业务错误
  if (data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || '请求失败')
  }
  
  return data
}

// 错误处理
const errorHandler = (error: any) => {
  console.error('API Error:', error)
  
  // 统一错误提示
  uni.showToast({
    title: error.message || '网络错误',
    icon: 'none',
    duration: 2000
  })
  
  // 处理 token 过期
  if (error.message?.includes('token') || error.message?.includes('未登录')) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 跳转到登录页
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }, 1500)
  }
  
  throw error
}

// 基础请求方法
export const request = <T = any>(config: RequestConfig): Promise<T> => {
  return new Promise((resolve, reject) => {
    // 应用拦截器
    const finalConfig = requestInterceptor(config)
    
    uni.request({
      url: `${API_BASE_URL}${finalConfig.url}`,
      method: finalConfig.method || 'GET',
      data: finalConfig.data,
      header: finalConfig.header,
      timeout: finalConfig.timeout || 30000,
      success: (res) => {
        try {
          const data = responseInterceptor<T>(res)
          resolve(data.data)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        errorHandler(err)
        reject(err)
      }
    })
  })
}

// 快捷请求方法
export const get = <T = any>(url: string, params?: any): Promise<T> => {
  return request<T>({ url, method: 'GET', params })
}

export const post = <T = any>(url: string, data?: any): Promise<T> => {
  return request<T>({ url, method: 'POST', data })
}

export const put = <T = any>(url: string, data?: any): Promise<T> => {
  return request<T>({ url, method: 'PUT', data })
}

export const del = <T = any>(url: string, params?: any): Promise<T> => {
  return request<T>({ url, method: 'DELETE', params })
}

export const patch = <T = any>(url: string, data?: any): Promise<T> => {
  return request<T>({ url, method: 'PATCH', data })
}

// 上传文件
export const upload = <T = any>(url: string, filePath: string, name: string = 'file'): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.uploadFile({
      url: `${API_BASE_URL}${url}`,
      filePath,
      name,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code !== 0 && data.code !== 200) {
            throw new Error(data.message || '上传失败')
          }
          resolve(data.data)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        errorHandler(err)
        reject(err)
      }
    })
  })
}

export default {
  request,
  get,
  post,
  put,
  del,
  patch,
  upload
}
