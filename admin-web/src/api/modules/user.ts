import request from '../request'
import type {
  UserListParams,
  UserListResponse,
  UserDetail,
  UserStatsData,
  UpdateUserStatusRequest,
  ExportUserRequest
} from '@/types/user'

export class UserAPI {
  /**
   * Get user list with pagination, search, and filters
   * @param params - Query parameters
   * @returns Paginated user list
   */
  static async getUsers(params: UserListParams): Promise<UserListResponse> {
    return request.get('/users/', { params })
  }

  /**
   * Get user detail by ID
   * @param id - User ID
   * @returns User detail with stats and activities
   */
  static async getUserDetail(id: number): Promise<UserDetail> {
    return request.get(`/users/${id}`)
  }

  /**
   * Update user status (ban/unban)
   * @param id - User ID
   * @param data - Status update data
   * @returns void
   */
  static async updateUserStatus(
    id: number,
    data: UpdateUserStatusRequest
  ): Promise<void> {
    return request.put(`/users/${id}/status`, data)
  }

  /**
   * Get user statistics
   * @returns User statistics data
   */
  static async getUserStats(): Promise<UserStatsData> {
    return request.get('/users/stats')
  }

  /**
   * Export users to Excel
   * @param params - Export parameters
   * @returns Blob data for download
   */
  static async exportUsers(params: ExportUserRequest): Promise<Blob> {
    return request.get('/users/export', {
      params,
      responseType: 'blob'
    })
  }

  /**
   * Search users by keyword
   * @param keyword - Search keyword
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Paginated user list
   */
  static async searchUsers(
    keyword: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<UserListResponse> {
    return request.get('/users/search', {
      params: { keyword, page, pageSize }
    })
  }

  /**
   * Get user activities
   * @param id - User ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns User activity list
   */
  static async getUserActivities(
    id: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    list: any[]
    total: number
    page: number
    pageSize: number
  }> {
    return request.get(`/users/${id}/activities`, {
      params: { page, pageSize }
    })
  }

  /**
   * Get user orders
   * @param id - User ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns User order list
   */
  static async getUserOrders(
    id: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    list: any[]
    total: number
    page: number
    pageSize: number
  }> {
    return request.get(`/users/${id}/orders`, {
      params: { page, pageSize }
    })
  }

  /**
   * Get user parties
   * @param id - User ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns User party list
   */
  static async getUserParties(
    id: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    list: any[]
    total: number
    page: number
    pageSize: number
  }> {
    return request.get(`/users/${id}/parties`, {
      params: { page, pageSize }
    })
  }

  /**
   * Batch update user status
   * @param ids - User IDs
   * @param data - Status update data
   * @returns void
   */
  static async batchUpdateUserStatus(
    ids: number[],
    data: UpdateUserStatusRequest
  ): Promise<void> {
    return request.put('/users/batch/status', { ids, ...data })
  }
}

// Export for backward compatibility
export const userAPI = {
  getUsers: UserAPI.getUsers,
  getUserDetail: UserAPI.getUserDetail,
  updateUserStatus: UserAPI.updateUserStatus,
  getUserStats: UserAPI.getUserStats,
  exportUsers: UserAPI.exportUsers,
  searchUsers: UserAPI.searchUsers,
  getUserActivities: UserAPI.getUserActivities,
  getUserOrders: UserAPI.getUserOrders,
  getUserParties: UserAPI.getUserParties,
  batchUpdateUserStatus: UserAPI.batchUpdateUserStatus,
}
