// System settings types

// Admin user types - 匹配后端实际返回结构
export interface AdminUser {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  // 后端返回 role_id (数字)，需要转换
  role_id: number
  // 后端返回 status (数字: 0=禁用, 1=正常)
  status: number
  // 权限需要额外查询，设为可选
  permissions?: string[]
  last_login_at?: string
  last_login_ip?: string
  created_at: string
  updated_at: string
  // 后端不返回以下字段
  // createdBy?: number
  // updatedBy?: number
}

export interface AdminUserListParams {
  page: number
  pageSize: number
  keyword?: string
  role?: AdminRole
  status?: AdminStatus
  startDate?: string
  endDate?: string
}

export interface AdminUserListResponse {
  list: AdminUser[]
  total: number
  page: number
  pageSize: number
}

export interface CreateAdminRequest {
  username: string
  password: string
  nickname: string
  email?: string
  phone?: string
  role: AdminRole
  permissions?: string[]
  avatar?: string
}

export interface UpdateAdminRequest {
  nickname?: string
  email?: string
  phone?: string
  role?: AdminRole
  permissions?: string[]
  avatar?: string
  status?: AdminStatus
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// Role types - 匹配后端实际返回结构
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: string[]
  status: RoleStatus
  created_at: string
  updated_at: string
}

// 后端直接返回数组，没有包装
export type RoleListResponse = Role[]

export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
  status?: RoleStatus
}

// Permission types
export interface Permission {
  id: number
  name: string
  code: string
  type: PermissionType
  parentId?: number
  path?: string
  icon?: string
  sort: number
  status: PermissionStatus
  children?: Permission[]
  description?: string
  createdAt: string
  updatedAt: string
}

export interface PermissionTree extends Permission {
  children?: PermissionTree[]
}

export interface CreatePermissionRequest {
  name: string
  code: string
  type: PermissionType
  parentId?: number
  path?: string
  icon?: string
  sort?: number
  description?: string
}

export interface UpdatePermissionRequest {
  name?: string
  code?: string
  type?: PermissionType
  parentId?: number
  path?: string
  icon?: string
  sort?: number
  status?: PermissionStatus
  description?: string
}

// Operation log types
export interface OperationLog {
  id: number
  adminId: number
  adminName: string
  module: string
  action: string
  method: string
  path: string
  params?: any
  ip: string
  userAgent: string
  status: LogStatus
  errorMessage?: string
  duration: number
  createdAt: string
}

export interface OperationLogListParams {
  page: number
  pageSize: number
  adminId?: number
  module?: string
  action?: string
  status?: LogStatus
  startDate?: string
  endDate?: string
}

export interface OperationLogListResponse {
  list: OperationLog[]
  total: number
  page: number
  pageSize: number
}

// System config types
export interface SystemConfig {
  id: number
  key: string
  value: string
  type: ConfigType
  group: string
  description?: string
  isPublic: boolean
  updatedAt: string
  updatedBy?: number
}

export interface SystemConfigGroup {
  group: string
  label: string
  configs: SystemConfig[]
}

export interface UpdateSystemConfigRequest {
  key: string
  value: string
}

// Enums
// 后端使用 role_id: 1=超级管理员, 2=运营管理员
export enum AdminRole {
  SUPER_ADMIN = 1,
  OPERATION_ADMIN = 2
}

// 后端使用 status: 0=禁用, 1=正常
export enum AdminStatus {
  DISABLED = 0,
  ACTIVE = 1,
  LOCKED = 2
}

export enum RoleStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api'
}

export enum PermissionStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

export enum LogStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json'
}

// Statistics types
export interface SystemStats {
  adminCount: number
  roleCount: number
  permissionCount: number
  todayOperations: number
  activeAdmins: number
  recentLogs: OperationLog[]
}
