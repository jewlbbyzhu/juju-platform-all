import request from '../request'
import type { DashboardData } from '@/types/dashboard'

export class DashboardAPI {
  /**
   * Get dashboard statistics data
   * @returns Dashboard data including stats and trends
   */
  static async getDashboardData(): Promise<DashboardData> {
    return request.get('/dashboard/stats')
  }

  /**
   * Get dashboard statistics for a specific date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Dashboard data for the specified period
   */
  static async getDashboardDataByRange(
    startDate: string,
    endDate: string
  ): Promise<DashboardData> {
    return request.get('/dashboard/stats', {
      params: { startDate, endDate }
    })
  }

  /**
   * Refresh dashboard data
   * @returns Updated dashboard data
   */
  static async refreshDashboard(): Promise<DashboardData> {
    return request.get('/dashboard/stats')
  }
}

// Export for backward compatibility
export const dashboardAPI = {
  getDashboardData: DashboardAPI.getDashboardData,
  getDashboardDataByRange: DashboardAPI.getDashboardDataByRange,
  refreshDashboard: DashboardAPI.refreshDashboard,
}
