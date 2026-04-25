import { computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import type { LoginRequest } from '@/types/auth'

export function useAuth() {
  const authStore = useAuthStore()

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.userInfo)
  const permissions = computed(() => authStore.permissions)
  const isLoading = computed(() => authStore.isLoading)
  const lastError = computed(() => authStore.lastError)

  // Auth methods
  const login = async (credentials: LoginRequest) => {
    return authStore.login(credentials)
  }

  const logout = async () => {
    return authStore.logout()
  }

  const refreshToken = async () => {
    return authStore.refreshAuthToken()
  }

  const getUserInfo = async () => {
    return authStore.getUserInfo()
  }

  const initAuth = async () => {
    return authStore.initializeAuth()
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    return authStore.changePassword(oldPassword, newPassword)
  }

  // Permission methods
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return authStore.hasAnyPermission(permissions)
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return authStore.hasAllPermissions(permissions)
  }

  // Role checking helpers
  const isSuperAdmin = computed(() => {
    return user.value?.role === 'super_admin'
  })

  const isOperationAdmin = computed(() => {
    return user.value?.role === 'operation_admin'
  })

  const isFinanceAdmin = computed(() => {
    return user.value?.role === 'finance_admin'
  })

  const isCustomerService = computed(() => {
    return user.value?.role === 'customer_service'
  })

  return {
    // State
    isAuthenticated,
    user,
    permissions,
    isLoading,
    lastError,

    // Role checks
    isSuperAdmin,
    isOperationAdmin,
    isFinanceAdmin,
    isCustomerService,

    // Methods
    login,
    logout,
    refreshToken,
    getUserInfo,
    initAuth,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}