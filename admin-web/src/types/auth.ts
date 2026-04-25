// Authentication types
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  remember?: boolean
}

// 后端返回结构: { success: true, data: { token, user, permissions, expiresIn, refreshToken } }
// 经过 request.ts 拦截器处理后，前端接收到的结构
export interface LoginResponse {
  token: string
  refreshToken?: string
  user: UserInfo
  permissions: string[]
  expiresIn: number
}

export interface TokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

// 匹配后端 adminController 返回的 user 结构
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  // 后端返回 role 字符串: 'super_admin' | 'operation_admin'
  role: string
  // 后端返回 status 字符串: 'active' | 'disabled'
  status: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: number
  name: string
  code: string
  type: PermissionType
  parentId?: number
  children?: Permission[]
  description?: string
}

// Enums
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATION_ADMIN = 'operation_admin',
  FINANCE_ADMIN = 'finance_admin',
  CUSTOMER_SERVICE = 'customer_service'
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  LOCKED = 'locked'
}

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api'
}

// Auth state interface
export interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserInfo | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean
}

// Auth error types
export interface AuthError {
  code: string
  message: string
  details?: any
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  ACCOUNT_DISABLED = 'AUTH_004',
  ACCOUNT_LOCKED = 'AUTH_005',
  NETWORK_ERROR = 'AUTH_006',
  UNKNOWN_ERROR = 'AUTH_999'
}