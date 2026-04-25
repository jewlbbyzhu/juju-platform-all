import request from '../utils/request.js'

export const ticketStatsApi = {
  getTicketSalesStats(params = {}) {
    return request.get('/analytics/orders', params)
  },

  getTicketSalesTrend(params = {}) {
    return request.get('/analytics/orders/range', params)
  },

  getTicketSalesRanking(params = {}) {
    return request.get('/analytics/orders', params)
  },

  getTicketSalesDetail(ticketId, params = {}) {
    return request.get(`/analytics/orders`, { ...params, ticketId })
  },

  exportTicketSalesReport(params = {}) {
    return request.get('/analytics/export', params)
  }
}
