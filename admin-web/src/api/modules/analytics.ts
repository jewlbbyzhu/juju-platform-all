import request from '../request'
import type {
  UserAnalytics,
  PartyAnalytics,
  RevenueAnalytics,
  OrderAnalytics,
  AnalyticsQueryParams,
  CustomReportConfig,
  CustomReportListResponse,
  ReportExportRequest,
  CustomDashboard,
  AnalyticsOverview,
  DrillDownRequest,
  DrillDownResponse,
  RealTimeAnalytics
} from '@/types/analytics'

export class AnalyticsAPI {
  /**
   * Get analytics overview
   * @param params - Query parameters
   * @returns Analytics overview data
   */
  static async getOverview(params?: AnalyticsQueryParams): Promise<AnalyticsOverview> {
    return request.get('/analytics/overview', { params })
  }

  /**
   * Get user analytics
   * @param params - Query parameters
   * @returns User analytics data including growth, activity, retention, and trends
   */
  static async getUserAnalytics(params?: AnalyticsQueryParams): Promise<UserAnalytics> {
    return request.get('/analytics/users', { params })
  }

  /**
   * Get party analytics
   * @param params - Query parameters
   * @returns Party analytics data including creation, participation, and distribution
   */
  static async getPartyAnalytics(params?: AnalyticsQueryParams): Promise<PartyAnalytics> {
    return request.get('/analytics/parties', { params })
  }

  /**
   * Get revenue analytics
   * @param params - Query parameters
   * @returns Revenue analytics data including total, sources, and trends
   */
  static async getRevenueAnalytics(params?: AnalyticsQueryParams): Promise<RevenueAnalytics> {
    return request.get('/analytics/revenue', { params })
  }

  /**
   * Get order analytics
   * @param params - Query parameters
   * @returns Order analytics data including status, payment methods, and trends
   */
  static async getOrderAnalytics(params?: AnalyticsQueryParams): Promise<OrderAnalytics> {
    return request.get('/analytics/orders', { params })
  }

  /**
   * Get real-time analytics
   * @returns Real-time analytics data
   */
  static async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    return request.get('/analytics/realtime')
  }

  /**
   * Drill down into specific dimension
   * @param data - Drill-down request data
   * @returns Drill-down data with hierarchical structure
   */
  static async drillDown(data: DrillDownRequest): Promise<DrillDownResponse> {
    return request.post('/analytics/drilldown', data)
  }

  /**
   * Get custom report list
   * @returns List of custom reports
   */
  static async getCustomReports(): Promise<CustomReportListResponse> {
    return request.get('/analytics/reports')
  }

  /**
   * Get custom report detail
   * @param id - Report ID
   * @returns Custom report configuration
   */
  static async getCustomReportDetail(id: number): Promise<CustomReportConfig> {
    return request.get(`/analytics/reports/${id}`)
  }

  /**
   * Create custom report
   * @param data - Report configuration
   * @returns Created report
   */
  static async createCustomReport(data: Omit<CustomReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReportConfig> {
    return request.post('/analytics/reports', data)
  }

  /**
   * Update custom report
   * @param id - Report ID
   * @param data - Report configuration
   * @returns Updated report
   */
  static async updateCustomReport(
    id: number,
    data: Partial<Omit<CustomReportConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<CustomReportConfig> {
    return request.put(`/analytics/reports/${id}`, data)
  }

  /**
   * Delete custom report
   * @param id - Report ID
   * @returns void
   */
  static async deleteCustomReport(id: number): Promise<void> {
    return request.delete(`/analytics/reports/${id}`)
  }

  /**
   * Execute custom report
   * @param id - Report ID
   * @returns Report data based on configuration
   */
  static async executeCustomReport(id: number): Promise<any> {
    return request.post(`/analytics/reports/${id}/execute`)
  }

  /**
   * Export report to file
   * @param data - Export request data
   * @returns Blob data for download
   */
  static async exportReport(data: ReportExportRequest): Promise<Blob> {
    return request.post('/analytics/export', data, {
      responseType: 'blob'
    })
  }

  /**
   * Get custom dashboard list
   * @returns List of custom dashboards
   */
  static async getCustomDashboards(): Promise<CustomDashboard[]> {
    return request.get('/analytics/dashboards')
  }

  /**
   * Get custom dashboard detail
   * @param id - Dashboard ID
   * @returns Custom dashboard configuration
   */
  static async getCustomDashboardDetail(id: number): Promise<CustomDashboard> {
    return request.get(`/analytics/dashboards/${id}`)
  }

  /**
   * Create custom dashboard
   * @param data - Dashboard configuration
   * @returns Created dashboard
   */
  static async createCustomDashboard(
    data: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomDashboard> {
    return request.post('/analytics/dashboards', data)
  }

  /**
   * Update custom dashboard
   * @param id - Dashboard ID
   * @param data - Dashboard configuration
   * @returns Updated dashboard
   */
  static async updateCustomDashboard(
    id: number,
    data: Partial<Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<CustomDashboard> {
    return request.put(`/analytics/dashboards/${id}`, data)
  }

  /**
   * Delete custom dashboard
   * @param id - Dashboard ID
   * @returns void
   */
  static async deleteCustomDashboard(id: number): Promise<void> {
    return request.delete(`/analytics/dashboards/${id}`)
  }

  /**
   * Set default dashboard
   * @param id - Dashboard ID
   * @returns void
   */
  static async setDefaultDashboard(id: number): Promise<void> {
    return request.post(`/analytics/dashboards/${id}/default`)
  }

  /**
   * Get analytics data by time range
   * @param dimension - Analytics dimension
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Analytics data for the specified dimension and time range
   */
  static async getAnalyticsByTimeRange(
    dimension: 'user' | 'party' | 'order' | 'revenue',
    startDate: string,
    endDate: string
  ): Promise<any> {
    return request.get(`/analytics/${dimension}/range`, {
      params: { startDate, endDate }
    })
  }

  /**
   * Compare analytics data between two periods
   * @param dimension - Analytics dimension
   * @param period1Start - Period 1 start date
   * @param period1End - Period 1 end date
   * @param period2Start - Period 2 start date
   * @param period2End - Period 2 end date
   * @returns Comparison data
   */
  static async compareAnalytics(
    dimension: 'user' | 'party' | 'order' | 'revenue',
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string
  ): Promise<{
    period1: any
    period2: any
    comparison: {
      metric: string
      period1Value: number
      period2Value: number
      change: number
      changePercentage: number
    }[]
  }> {
    return request.get(`/analytics/${dimension}/compare`, {
      params: {
        period1Start,
        period1End,
        period2Start,
        period2End
      }
    })
  }

  /**
   * Schedule report generation
   * @param reportId - Report ID
   * @param schedule - Schedule configuration
   * @returns void
   */
  static async scheduleReport(
    reportId: number,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly'
      time: string // HH:mm
      recipients: string[]
    }
  ): Promise<void> {
    return request.post(`/analytics/reports/${reportId}/schedule`, schedule)
  }

  /**
   * Cancel scheduled report
   * @param reportId - Report ID
   * @returns void
   */
  static async cancelScheduledReport(reportId: number): Promise<void> {
    return request.delete(`/analytics/reports/${reportId}/schedule`)
  }

  /**
   * Get analytics metrics list
   * @param dimension - Analytics dimension
   * @returns Available metrics for the dimension
   */
  static async getAvailableMetrics(
    dimension: 'user' | 'party' | 'order' | 'revenue'
  ): Promise<{
    metric: string
    label: string
    description: string
    unit?: string
  }[]> {
    return request.get(`/analytics/${dimension}/metrics`)
  }

  /**
   * Get analytics filters
   * @param dimension - Analytics dimension
   * @returns Available filters for the dimension
   */
  static async getAvailableFilters(
    dimension: 'user' | 'party' | 'order' | 'revenue'
  ): Promise<{
    filter: string
    label: string
    type: 'select' | 'date' | 'number' | 'text'
    options?: { label: string; value: any }[]
  }[]> {
    return request.get(`/analytics/${dimension}/filters`)
  }
}

// Export for backward compatibility
export const analyticsAPI = {
  getOverview: AnalyticsAPI.getOverview,
  getUserAnalytics: AnalyticsAPI.getUserAnalytics,
  getPartyAnalytics: AnalyticsAPI.getPartyAnalytics,
  getRevenueAnalytics: AnalyticsAPI.getRevenueAnalytics,
  getOrderAnalytics: AnalyticsAPI.getOrderAnalytics,
  getRealTimeAnalytics: AnalyticsAPI.getRealTimeAnalytics,
  drillDown: AnalyticsAPI.drillDown,
  getCustomReports: AnalyticsAPI.getCustomReports,
  getCustomReportDetail: AnalyticsAPI.getCustomReportDetail,
  createCustomReport: AnalyticsAPI.createCustomReport,
  updateCustomReport: AnalyticsAPI.updateCustomReport,
  deleteCustomReport: AnalyticsAPI.deleteCustomReport,
  executeCustomReport: AnalyticsAPI.executeCustomReport,
  exportReport: AnalyticsAPI.exportReport,
  getCustomDashboards: AnalyticsAPI.getCustomDashboards,
  getCustomDashboardDetail: AnalyticsAPI.getCustomDashboardDetail,
  createCustomDashboard: AnalyticsAPI.createCustomDashboard,
  updateCustomDashboard: AnalyticsAPI.updateCustomDashboard,
  deleteCustomDashboard: AnalyticsAPI.deleteCustomDashboard,
  setDefaultDashboard: AnalyticsAPI.setDefaultDashboard,
  getAnalyticsByTimeRange: AnalyticsAPI.getAnalyticsByTimeRange,
  compareAnalytics: AnalyticsAPI.compareAnalytics,
  scheduleReport: AnalyticsAPI.scheduleReport,
  cancelScheduledReport: AnalyticsAPI.cancelScheduledReport,
  getAvailableMetrics: AnalyticsAPI.getAvailableMetrics,
  getAvailableFilters: AnalyticsAPI.getAvailableFilters,
}
