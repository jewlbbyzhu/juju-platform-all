import { BACKEND_API_URL_V1, BACKEND_API_URL_V2 } from './constants'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  const directToken = window.localStorage.getItem('token')
  if (directToken) return directToken

  const persisted = window.localStorage.getItem('auth-storage')
  if (!persisted) return null

  try {
    const parsed = JSON.parse(persisted)
    const token = parsed?.state?.token ?? parsed?.token
    return typeof token === 'string' && token ? token : null
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null

  const directToken = window.localStorage.getItem('refreshToken')
  if (directToken) return directToken

  const persisted = window.localStorage.getItem('auth-storage')
  if (!persisted) return null

  try {
    const parsed = JSON.parse(persisted)
    const token = parsed?.state?.refreshToken ?? parsed?.refreshToken
    return typeof token === 'string' && token ? token : null
  } catch {
    return null
  }
}

function setAuthToken(token: string, refreshToken: string): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem('token', token)
  window.localStorage.setItem('refreshToken', refreshToken)

  const persisted = window.localStorage.getItem('auth-storage')
  if (persisted) {
    try {
      const parsed = JSON.parse(persisted)
      if (parsed.state) {
        parsed.state.token = token
        parsed.state.refreshToken = refreshToken
        window.localStorage.setItem('auth-storage', JSON.stringify(parsed))
      } else {
        parsed.token = token
        parsed.refreshToken = refreshToken
        window.localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }
    } catch {
    }
  }
}

function clearAuthToken(): void {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem('token')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('auth-storage')
}

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

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
  }

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    const error = new Error('No refresh token available')
    processQueue(error, null)
    throw error
  }

  isRefreshing = true

  try {
    const response = await fetch(`${BACKEND_API_URL_V2}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    const data = await response.json()

    if (!response.ok || !data.success || !data.data?.token) {
      const error = new Error(data.message || 'Token refresh failed')
      clearAuthToken()
      processQueue(error, null)
      throw error
    }

    const newToken = data.data.token
    const newRefreshToken = data.data.refreshToken || refreshToken

    setAuthToken(newToken, newRefreshToken)

    if (typeof window !== 'undefined') {
      const persisted = window.localStorage.getItem('auth-storage')
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted)
          if (parsed.state) {
            parsed.state.token = newToken
            parsed.state.refreshToken = newRefreshToken
            window.localStorage.setItem('auth-storage', JSON.stringify(parsed))
          } else {
            parsed.token = newToken
            parsed.refreshToken = newRefreshToken
            window.localStorage.setItem('auth-storage', JSON.stringify(parsed))
          }
        } catch {
        }
      }
    }

    processQueue(null, newToken)

    return newToken
  } catch (error) {
    clearAuthToken()
    processQueue(error, null)
    throw error
  } finally {
    isRefreshing = false
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    email: string
    nickname: string
    avatar: string
    role: 'user' | 'admin'
    isVip: boolean
    createdAt: string
  }
  token: string
  refreshToken: string
}

export interface Party {
  id: number
  title: string
  description: string
  category: number
  images: string[]
  startTime: string
  endTime: string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  minPrice: number
  maxParticipants: number
  currentParticipants: number
  status: string
  coverImage: string
}

export interface PartyListResponse {
  parties: Party[]
  total: number
  limit: number
  offset: number
}

export interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface VersionInfo {
  version: string
  releaseDate: string
  changelog: string[]
  downloadUrl: string
  qrCodeUrl: string
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl =
    endpoint.startsWith('/admin') || endpoint.startsWith('/auth') || endpoint.startsWith('/system')
      ? BACKEND_API_URL_V2
      : BACKEND_API_URL_V1
  const url = `${baseUrl}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>)
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      try {
        const newToken = await refreshAccessToken()
        headers['Authorization'] = `Bearer ${newToken}`
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        const data = await retryResponse.json().catch(() => null)

        if (!retryResponse.ok) {
          return {
            success: false,
            error: {
              code: data?.code || data?.error?.code || 'UNKNOWN_ERROR',
              message: data?.message || data?.error?.message || '请求失败'
            }
          }
        }

        if (!data || !data.success) {
          return {
            success: false,
            error: {
              code: data?.code || data?.error?.code || 'BUSINESS_ERROR',
              message: data?.message || data?.error?.message || '业务处理失败'
            }
          }
        }

        return {
          success: true,
          data: data.data
        }
      } catch (refreshError) {
        return {
          success: false,
          error: {
            code: 'AUTH_REFRESH_FAILED',
            message: '认证失败，请重新登录'
          }
        }
      }
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data?.code || data?.error?.code || 'UNKNOWN_ERROR',
          message: data?.message || data?.error?.message || '请求失败'
        }
      }
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: {
          code: data?.code || data?.error?.code || 'BUSINESS_ERROR',
          message: data?.message || data?.error?.message || '业务处理失败'
        }
      }
    }

    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    clearTimeout(timeoutId)
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络设置'
      }
    }
  }
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiRequest<LoginResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })

  if (response.success && response.data) {
    setAuthToken(response.data.token, response.data.refreshToken)
  }

  return response
}

export async function logout(): Promise<ApiResponse<void>> {
  const response = await apiRequest<void>('/auth/logout', {
    method: 'POST'
  })

  if (response.success) {
    clearAuthToken()
  }

  return response
}

export async function getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
  return apiRequest<LoginResponse['user']>('/auth/user')
}

export async function getParties(params?: {
  page?: number
  pageSize?: number
  category?: number
  status?: string
}): Promise<ApiResponse<PartyListResponse>> {
  const queryParams = new URLSearchParams()
  queryParams.append('page', (params?.page ?? 1).toString())
  queryParams.append('pageSize', (params?.pageSize ?? 20).toString())
  if (params?.category) queryParams.append('category', params.category.toString())
  if (params?.status) queryParams.append('status', params.status.toString())

  return apiRequest<PartyListResponse>(`/parties?${queryParams.toString()}`)
}

export async function getPartyById(id: number): Promise<ApiResponse<Party>> {
  return apiRequest<Party>(`/parties/${id}`)
}

export async function searchParties(query: string, params?: {
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PartyListResponse>> {
  const queryParams = new URLSearchParams({ keyword: query })
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  return apiRequest<PartyListResponse>(`/parties/search?${queryParams.toString()}`)
}

export interface HelpArticlesResponse {
  items: HelpArticle[]
  articles?: HelpArticle[]
  list?: HelpArticle[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export async function getHelpArticles(params?: {
  category?: string
  type?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<HelpArticlesResponse>> {
  const queryParams = new URLSearchParams()
  // 使用 category 参数查询帮助文档分类
  if (params?.category) queryParams.append('category', params.category)
  // 同时支持 type 参数
  if (params?.type) queryParams.append('type', params.type)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  return apiRequest<HelpArticlesResponse>(`/help/articles?${queryParams.toString()}`)
}

export async function getHelpArticleById(id: string): Promise<ApiResponse<HelpArticle>> {
  return apiRequest<HelpArticle>(`/help/articles/${id}`)
}

export async function searchHelpArticles(query: string): Promise<ApiResponse<HelpArticle[]>> {
  return apiRequest<HelpArticle[]>(`/help/search?keyword=${encodeURIComponent(query)}`)
}

export async function getAppVersion(platform: 'android' | 'ios' | 'wechat'): Promise<ApiResponse<VersionInfo>> {
  return apiRequest<VersionInfo>(`/appversion/${platform}`)
}

export async function getAppVersions(): Promise<ApiResponse<Record<string, VersionInfo>>> {
  return apiRequest<Record<string, VersionInfo>>('/appversion')
}

export async function getPublishedParties(params?: {
  page?: number
  pageSize?: number
  category?: number
  sortBy?: string
  minPrice?: number
  maxPrice?: number
  participantsMin?: number
  participantsMax?: number
}): Promise<ApiResponse<PartyListResponse>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  if (params?.category) queryParams.append('category', params.category.toString())
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString())
  if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString())
  if (params?.participantsMin !== undefined) queryParams.append('participantsMin', params.participantsMin.toString())
  if (params?.participantsMax !== undefined) queryParams.append('participantsMax', params.participantsMax.toString())

  return apiRequest<PartyListResponse>(`/parties/published?${queryParams.toString()}`)
}

export async function getUpcomingParties(params?: {
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PartyListResponse>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  return apiRequest<PartyListResponse>(`/parties/upcoming?${queryParams.toString()}`)
}

export async function getHotParties(params?: {
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PartyListResponse>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  return apiRequest<PartyListResponse>(`/parties/hot?${queryParams.toString()}`)
}
