import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  LoginRequest, 
  UserInfo, 
  AuthState, 
  TokenResponse,
  AuthError,
  AuthErrorCode 
} from '@/types/auth'
import { authAPI } from '@/api/modules/auth'
import { 
  getToken, 
  setToken, 
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  getStoredPermissions,
  setStoredPermissions,
  removeStoredPermissions,
  isValidToken,
  clearAuthData,
  hasPermission as utilHasPermission,
  hasAnyPermission as utilHasAnyPermission,
  hasAllPermissions as utilHasAllPermissions
} from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(getToken())
  const refreshToken = ref<string | null>(getRefreshToken())
  const userInfo = ref<UserInfo | null>(getStoredUser())
  const permissions = ref<string[]>(getStoredPermissions())
  const isLoading = ref<boolean>(false)
  const lastError = ref<AuthError | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!token.value && isValidToken(token.value)
  })
  
  const hasUserInfo = computed(() => !!userInfo.value)
  
  const authState = computed((): AuthState => ({
    token: token.value,
    refreshToken: refreshToken.value,
    user: userInfo.value,
    permissions: permissions.value,
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value
  }))

  // Actions
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      isLoading.value = true
      lastError.value = null
      
      const response = await authAPI.login(credentials)
      const { 
        token: authToken, 
        refreshToken: authRefreshToken,
        user, 
        permissions: userPermissions,
        expiresIn
      } = response
      
      // Update state
      token.value = authToken
      refreshToken.value = authRefreshToken
      userInfo.value = user
      permissions.value = userPermissions
      
      // Persist to localStorage
      setToken(authToken)
      setRefreshToken(authRefreshToken)
      setStoredUser(user)
      setStoredPermissions(userPermissions)
      
      // Set up token refresh timer if needed
      if (expiresIn) {
        setupTokenRefresh(expiresIn)
      }
    } catch (error: any) {
      lastError.value = {
        code: error.code || AuthErrorCode.UNKNOWN_ERROR,
        message: error.message || '登录失败',
        details: error
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true
      
      if (token.value) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data
      token.value = null
      refreshToken.value = null
      userInfo.value = null
      permissions.value = []
      lastError.value = null
      
      clearAuthData()
      isLoading.value = false
    }
  }

  const refreshAuthToken = async (): Promise<TokenResponse> => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }
      
      const response = await authAPI.refreshToken(refreshToken.value)
      const { token: newToken, refreshToken: newRefreshToken, expiresIn } = response
      
      // Update tokens
      token.value = newToken
      refreshToken.value = newRefreshToken
      
      // Persist new tokens
      setToken(newToken)
      setRefreshToken(newRefreshToken)
      
      // Set up new refresh timer
      if (expiresIn) {
        setupTokenRefresh(expiresIn)
      }
      
      return response
    } catch (error: any) {
      // Refresh failed, logout user
      await logout()
      throw error
    }
  }

  const getUserInfo = async (): Promise<void> => {
    try {
      isLoading.value = true
      const user = await authAPI.getUserInfo()
      userInfo.value = user
      setStoredUser(user)
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getPermissions = async (): Promise<void> => {
    try {
      const userPermissions = await authAPI.getPermissions()
      permissions.value = userPermissions.map(p => p.code)
      setStoredPermissions(permissions.value)
    } catch (error) {
      throw error
    }
  }

  const initializeAuth = async (): Promise<void> => {
    const storedToken = getToken()
    
    if (storedToken && isValidToken(storedToken)) {
      token.value = storedToken
      refreshToken.value = getRefreshToken()
      userInfo.value = getStoredUser()
      permissions.value = getStoredPermissions()
      
      // Verify token with server and get fresh user info
      try {
        await getUserInfo()
        await getPermissions()
      } catch (error) {
        // Token might be invalid, clear auth data
        await logout()
      }
    } else {
      // Clear invalid auth data
      clearAuthData()
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      isLoading.value = true
      await authAPI.changePassword({ oldPassword, newPassword })
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    return utilHasPermission(permission, permissions.value)
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return utilHasAnyPermission(permissionList, permissions.value)
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return utilHasAllPermissions(permissionList, permissions.value)
  }

  // Token refresh timer
  let refreshTimer: NodeJS.Timeout | null = null

  const setupTokenRefresh = (expiresIn: number): void => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
    
    // Refresh token 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000
    
    if (refreshTime > 0) {
      refreshTimer = setTimeout(async () => {
        try {
          await refreshAuthToken()
        } catch (error) {
          console.error('Auto token refresh failed:', error)
        }
      }, refreshTime)
    }
  }

  const clearRefreshTimer = (): void => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    // State
    token,
    refreshToken,
    userInfo,
    permissions,
    isLoading,
    lastError,
    
    // Getters
    isAuthenticated,
    hasUserInfo,
    authState,
    
    // Actions
    login,
    logout,
    refreshAuthToken,
    getUserInfo,
    getPermissions,
    initializeAuth,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    clearRefreshTimer,
  }
})
