import request from '../request'
import type { 
  LoginRequest, 
  LoginResponse, 
  UserInfo, 
  TokenResponse, 
  Permission 
} from '@/types/auth'

export class AuthAPI {
  // Login
  static async login(data: LoginRequest): Promise<LoginResponse> {
    return request.post('/admin/login', data)
  }

  // Logout
  static async logout(): Promise<void> {
    return request.post('/auth/logout')
  }

  // Get user info
  static async getUserInfo(): Promise<UserInfo> {
    return request.get('/auth/user')
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return request.post('/auth/refresh', { refreshToken })
  }

  // Get user permissions
  static async getPermissions(): Promise<Permission[]> {
    return request.get('/auth/permissions')
  }

  // Verify token
  static async verifyToken(token: string): Promise<{ valid: boolean }> {
    return request.post('/auth/verify', { token })
  }

  // Change password
  static async changePassword(data: {
    oldPassword: string
    newPassword: string
  }): Promise<void> {
    return request.post('/auth/change-password', data)
  }

  // Get captcha
  static async getCaptcha(): Promise<{ captcha: string; key: string }> {
    return request.get('/auth/captcha')
  }
}

// Export for backward compatibility
export const authAPI = {
  login: AuthAPI.login,
  logout: AuthAPI.logout,
  getUserInfo: AuthAPI.getUserInfo,
  refreshToken: (refreshToken?: string) => 
    AuthAPI.refreshToken(refreshToken || ''),
  getPermissions: AuthAPI.getPermissions,
  verifyToken: AuthAPI.verifyToken,
  changePassword: AuthAPI.changePassword,
  getCaptcha: AuthAPI.getCaptcha,
}