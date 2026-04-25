const TOKEN_KEY = 'admin_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'
const USER_KEY = 'admin_user'
const PERMISSIONS_KEY = 'admin_permissions'

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// Refresh token management
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const setRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// User info management
export const getStoredUser = (): any | null => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const setStoredUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_KEY)
}

// Permissions management
export const getStoredPermissions = (): string[] => {
  const permissions = localStorage.getItem(PERMISSIONS_KEY)
  return permissions ? JSON.parse(permissions) : []
}

export const setStoredPermissions = (permissions: string[]): void => {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
}

export const removeStoredPermissions = (): void => {
  localStorage.removeItem(PERMISSIONS_KEY)
}

// JWT token validation
export const isValidToken = (token: string): boolean => {
  if (!token) return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(decodeJwtPayload(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    return payload.exp > currentTime
  } catch {
    return false
  }
}

// Get token expiration time
export const getTokenExpiration = (token: string): number | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(decodeJwtPayload(parts[1]))
    return payload.exp * 1000 // Convert to milliseconds
  } catch {
    return null
  }
}

// Check if token is about to expire (within 5 minutes)
export const isTokenExpiringSoon = (token: string): boolean => {
  const expiration = getTokenExpiration(token)
  if (!expiration) return true
  
  const fiveMinutes = 5 * 60 * 1000
  return Date.now() + fiveMinutes >= expiration
}

function decodeJwtPayload(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  return atob(padded)
}

// Clear all auth data
export const clearAuthData = (): void => {
  removeToken()
  removeRefreshToken()
  removeStoredUser()
  removeStoredPermissions()
}

// Permission checking
export const hasPermission = (permission: string, userPermissions: string[]): boolean => {
  // Super admin with '*' has all permissions
  if (userPermissions.includes('*')) return true
  return userPermissions.includes(permission)
}

export const hasAnyPermission = (permissions: string[], userPermissions: string[]): boolean => {
  // Super admin with '*' has all permissions
  if (userPermissions.includes('*')) return true
  return permissions.some(permission => userPermissions.includes(permission))
}

export const hasAllPermissions = (permissions: string[], userPermissions: string[]): boolean => {
  // Super admin with '*' has all permissions
  if (userPermissions.includes('*')) return true
  return permissions.every(permission => userPermissions.includes(permission))
}

// Check if user is super admin
export const isSuperAdmin = (userRole: string): boolean => {
  return userRole === 'super_admin'
}

// Check if user can manage admins (only super admin)
export const canManageAdmins = (userRole: string): boolean => {
  return isSuperAdmin(userRole)
}
