import config from '../config'
import cache from './cache.js'
import { debounce } from './performance.js'

// 判断是否使用uni.request (App端) 或 axios (H5端)
const isApp = typeof uni !== 'undefined' && uni.request

// Base64 decode
function base64Decode(str) {
  if (typeof uni !== 'undefined' && uni.base64ToArrayBuffer) {
    try {
      const arrayBuffer = uni.base64ToArrayBuffer(str)
      const uint8Array = new Uint8Array(arrayBuffer)
      let result = ''
      for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i])
      }
      return result
    } catch (e) {}
  }
  
  if (typeof atob !== 'undefined') {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  }
  
  return str
}

// JWT decode
function decodeJWT(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid JWT')
    const payload = parts[1]
    return JSON.parse(base64Decode(payload))
  } catch (error) {
    return null
  }
}

function isTokenExpired(token) {
  if (!token) return true
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true
    return decoded.exp < Math.floor(Date.now() / 1000)
  } catch {
    return true
  }
}

// 使用uni.request (App端推荐使用)
function uniRequest(config) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json',
      ...config.headers
    }
    
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    uni.request({
      url: config.baseURL ? config.baseURL + config.url : config.url,
      method: config.method?.toUpperCase() || 'GET',
      data: config.data || config.params,
      header,
      timeout: config.timeout || 30000,
      success: (res) => {
        resolve({
          data: res.data,
          status: res.statusCode,
          headers: res.header
        })
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Request failed'))
      }
    })
  })
}

// 创建请求实例
const request = async (config) => {
  // App端使用uni.request
  if (isApp && !config.useAxios) {
    return uniRequest({ ...config, baseURL: config.baseURL || config.baseURL })
  }
  
  // H5端使用axios (需要动态导入)
  const axios = (await import('axios')).default
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || 30000,
    headers: config.headers
  })
  return instance(config)
}

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

async function refreshToken() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
  }
  
  isRefreshing = true
  
  try {
    const refreshToken = uni.getStorageSync('refreshToken')
    // 使用uni.request刷新token
    const res = await uniRequest({
      url: '/auth/refresh',
      method: 'POST',
      data: { refreshToken },
      baseURL: config.baseURL
    })
    
    if (res.data?.data?.token) {
      uni.setStorageSync('token', res.data.data.token)
      processQueue(null, res.data.data.token)
      return res.data.data.token
    }
    throw new Error('Refresh failed')
  } catch (error) {
    processQueue(error, null)
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.navigateTo({ url: '/pages/login/login' })
    throw error
  } finally {
    isRefreshing = false
  }
}

function normalizeResponse(data) {
  if (!data || typeof data !== 'object') {
    return { success: false, message: 'Invalid response', data }
  }
  if (typeof data.success === 'boolean') return data
  if (data.code !== undefined) {
    return { success: data.code === 0, code: data.code, message: data.message, data: data.data }
  }
  return { success: false, message: 'Unknown error', data }
}

// 请求拦截
async function requestWithInterceptor(config) {
  const token = uni.getStorageSync('token')
  
  if (token && !config.url?.includes('/auth/refresh')) {
    if (isTokenExpired(token)) {
      try {
        const newToken = await refreshToken()
        config.headers = { ...config.headers, 'Authorization': `Bearer ${newToken}` }
      } catch (e) {
        return Promise.reject(e)
      }
    } else {
      config.headers = { ...config.headers, 'Authorization': `Bearer ${token}` }
    }
  }
  
  try {
    const response = await uniRequest({
      ...config,
      baseURL: config.baseURL || config.baseURL
    })
    
    const res = normalizeResponse(response.data)
    
    if (!res.success) {
      uni.showToast({ title: res.message || '请求失败', icon: 'none' })
      return Promise.reject(res)
    }
    
    return res
  } catch (error) {
    if (error.message?.includes('401')) {
      try {
        await refreshToken()
        return requestWithInterceptor(config)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    uni.showToast({ title: error.message || '网络错误', icon: 'none' })
    return Promise.reject(error)
  }
}

// API方法
const apiRequest = (config) => requestWithInterceptor({ ...config, baseURL: config.baseURL })

apiRequest.get = (url, params = {}, config = {}) => {
  return apiRequest({ url, method: 'get', params, ...config })
}

apiRequest.post = (url, data = {}, config = {}) => {
  return apiRequest({ url, method: 'post', data, ...config })
}

apiRequest.put = (url, data = {}, config = {}) => {
  return apiRequest({ url, method: 'put', data, ...config })
}

apiRequest.delete = (url, params = {}, config = {}) => {
  return apiRequest({ url, method: 'delete', params, ...config })
}

export default apiRequest
