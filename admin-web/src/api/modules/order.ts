import request from '../request'
import type {
  OrderListParams,
  OrderListResponse,
  OrderDetail,
  OrderStatsData,
  RefundAuditRequest,
  ExportOrderRequest
} from '@/types/order'

export class OrderAPI {
  /**
   * Get order list with pagination, search, and filters
   * @param params - Query parameters
   * @returns Paginated order list
   */
  static async getOrders(params: OrderListParams): Promise<OrderListResponse> {
    return request.get('/orders/', { params })
  }

  /**
   * Get order detail by ID
   * @param id - Order ID
   * @returns Order detail with user, party, tickets, and refund info
   */
  static async getOrderDetail(id: number): Promise<OrderDetail> {
    return request.get(`/orders/${id}`)
  }

  /**
   * Get order statistics
   * @returns Order statistics data
   */
  static async getOrderStats(): Promise<OrderStatsData> {
    return request.get('/orders/stats')
  }

  /**
   * Export orders to Excel
   * @param params - Export parameters
   * @returns Blob data for download
   */
  static async exportOrders(params: ExportOrderRequest): Promise<Blob> {
    return request.get('/orders/export', {
      params,
      responseType: 'blob'
    })
  }

  /**
   * Search orders by keyword (order number, user info)
   * @param keyword - Search keyword
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Paginated order list
   */
  static async searchOrders(
    keyword: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<OrderListResponse> {
    return request.get('/orders/search', {
      params: { keyword, page, pageSize }
    })
  }

  /**
   * Get order tickets
   * @param id - Order ID
   * @returns Ticket list
   */
  static async getOrderTickets(id: number): Promise<any[]> {
    return request.get(`/orders/${id}/tickets`)
  }

  /**
   * Get order refund info
   * @param id - Order ID
   * @returns Refund info
   */
  static async getOrderRefund(id: number): Promise<any> {
    return request.get(`/orders/${id}/refund`)
  }

  /**
   * Audit refund request (approve or reject)
   * @param orderId - Order ID
   * @param data - Audit data (status and reason)
   * @returns void
   */
  static async auditRefund(
    orderId: number,
    data: RefundAuditRequest
  ): Promise<void> {
    return request.post(`/orders/${orderId}/refund/audit`, data)
  }

  /**
   * Cancel order
   * @param id - Order ID
   * @param reason - Cancel reason
   * @returns void
   */
  static async cancelOrder(id: number, reason?: string): Promise<void> {
    return request.post(`/orders/${id}/cancel`, { reason })
  }

  /**
   * Get user orders
   * @param userId - User ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Paginated order list
   */
  static async getUserOrders(
    userId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<OrderListResponse> {
    return request.get(`/users/${userId}/orders`, {
      params: { page, pageSize }
    })
  }

  /**
   * Get party orders
   * @param partyId - Party ID
   * @param page - Page number
   * @param pageSize - Page size
   * @returns Paginated order list
   */
  static async getPartyOrders(
    partyId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<OrderListResponse> {
    return request.get(`/orders/parties/${partyId}`, {
      params: { page, pageSize }
    })
  }

  /**
   * Batch export orders
   * @param ids - Order IDs
   * @returns Blob data for download
   */
  static async batchExportOrders(ids: number[]): Promise<Blob> {
    return request.post('/orders/batch/export', { ids }, {
      responseType: 'blob'
    })
  }
}

// Export for backward compatibility
export const orderAPI = {
  getOrders: OrderAPI.getOrders,
  getOrderDetail: OrderAPI.getOrderDetail,
  getOrderStats: OrderAPI.getOrderStats,
  exportOrders: OrderAPI.exportOrders,
  searchOrders: OrderAPI.searchOrders,
  getOrderTickets: OrderAPI.getOrderTickets,
  getOrderRefund: OrderAPI.getOrderRefund,
  auditRefund: OrderAPI.auditRefund,
  cancelOrder: OrderAPI.cancelOrder,
  getUserOrders: OrderAPI.getUserOrders,
  getPartyOrders: OrderAPI.getPartyOrders,
  batchExportOrders: OrderAPI.batchExportOrders,
}
