import request from '../request'
import type {
  AdminUserListParams,
  AdminUserListResponse,
  CreateAdminRequest,
  UpdateAdminRequest,
  ChangePasswordRequest,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  OperationLogListParams,
  OperationLogListResponse,
  SystemConfig,
  UpdateSystemConfigRequest,
  SystemStats
} from '@/types/system'

export class SystemAPI {
  static async getAdmins(params: AdminUserListParams): Promise<AdminUserListResponse> {
    return request.get('/admin/', { params })
  }

  static async createAdmin(data: CreateAdminRequest): Promise<{ id: number }> {
    return request.post('/admin/', data)
  }

  static async updateAdmin(id: number, data: UpdateAdminRequest): Promise<void> {
    return request.put(`/admin/${id}`, data)
  }

  static async deleteAdmin(id: number): Promise<void> {
    return request.delete(`/admin/${id}`)
  }

  static async updateAdminStatus(id: number, data: { status: string; reason?: string }): Promise<void> {
    return request.put(`/admin/${id}/status`, data)
  }

  static async changeAdminPassword(id: number, data: ChangePasswordRequest): Promise<void> {
    return request.put(`/admin/${id}/password`, data)
  }

  static async getRoles(): Promise<RoleListResponse> {
    return request.get('/admin/roles')
  }

  static async createRole(data: CreateRoleRequest): Promise<{ id: number }> {
    return request.post('/admin/roles', data)
  }

  static async updateRole(id: number, data: UpdateRoleRequest): Promise<void> {
    return request.put(`/admin/roles/${id}`, data)
  }

  static async deleteRole(id: number): Promise<void> {
    return request.delete(`/admin/roles/${id}`)
  }

  static async getPermissions(): Promise<{ list: Permission[] }> {
    return request.get('/admin/permissions')
  }

  static async createPermission(data: CreatePermissionRequest): Promise<{ id: number }> {
    return request.post('/admin/permissions', data)
  }

  static async updatePermission(id: number, data: UpdatePermissionRequest): Promise<void> {
    return request.put(`/admin/permissions/${id}`, data)
  }

  static async deletePermission(id: number): Promise<void> {
    return request.delete(`/admin/permissions/${id}`)
  }

  static async getOperationLogs(params: OperationLogListParams): Promise<OperationLogListResponse> {
    return request.get('/monitoring/logs', { params })
  }

  // 注意: 后端没有提供获取单条日志详情的接口
  static async getOperationLogDetail(id: number): Promise<OperationLog> {
    // TODO: 需要后端实现 GET /monitoring/logs/:id 接口
    console.warn('getOperationLogDetail: 后端接口未实现')
    return Promise.resolve({} as OperationLog)
  }

  // 注意: 后端没有提供系统配置相关接口
  static async getConfigs(): Promise<{ list: SystemConfig[] }> {
    // TODO: 需要后端实现 GET /system/configs 接口
    console.warn('getConfigs: 后端接口未实现')
    return Promise.resolve({ list: [] })
  }

  static async getConfigGroups(): Promise<{ list: { group: string; label: string }[] }> {
    // TODO: 需要后端实现 GET /system/configs/group 接口
    console.warn('getConfigGroups: 后端接口未实现')
    return Promise.resolve({ list: [] })
  }

  static async updateConfig(id: number, data: UpdateSystemConfigRequest): Promise<void> {
    // TODO: 需要后端实现 PUT /system/configs/:id 接口
    console.warn('updateConfig: 后端接口未实现')
    return Promise.resolve()
  }

  static async getStatistics(): Promise<SystemStats> {
    // 使用 /monitoring/system/overview 替代
    return request.get('/monitoring/system/overview')
  }
}

export const systemAPI = {
  getAdmins: SystemAPI.getAdmins,
  createAdmin: SystemAPI.createAdmin,
  updateAdmin: SystemAPI.updateAdmin,
  deleteAdmin: SystemAPI.deleteAdmin,
  updateAdminStatus: SystemAPI.updateAdminStatus,
  changeAdminPassword: SystemAPI.changeAdminPassword,
  getRoles: SystemAPI.getRoles,
  createRole: SystemAPI.createRole,
  updateRole: SystemAPI.updateRole,
  deleteRole: SystemAPI.deleteRole,
  getPermissions: SystemAPI.getPermissions,
  createPermission: SystemAPI.createPermission,
  updatePermission: SystemAPI.updatePermission,
  deletePermission: SystemAPI.deletePermission,
  getOperationLogs: SystemAPI.getOperationLogs,
  getOperationLogDetail: SystemAPI.getOperationLogDetail,
  getConfigs: SystemAPI.getConfigs,
  getConfigGroups: SystemAPI.getConfigGroups,
  updateConfig: SystemAPI.updateConfig,
  getStatistics: SystemAPI.getStatistics,
}
