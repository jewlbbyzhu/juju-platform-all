import request from '../utils/request.js'

export const vipStatsApi = {
  getVipStatsOverview(params = {}) {
    return request.get('/analytics/users', params)
  },

  getVipGrowthTrend(params = {}) {
    return request.get('/analytics/users/range', params)
  },

  getVipLevelDistribution(params = {}) {
    return request.get('/analytics/users', params)
  },

  getVipRevenueStats(params = {}) {
    return request.get('/analytics/revenue', params)
  },

  getVipActivityStats(params = {}) {
    return request.get('/analytics/users', params)
  },

  getVipRetentionStats(params = {}) {
    return request.get('/analytics/users/compare', params)
  },

  getVipConversionStats(params = {}) {
    return request.get('/analytics/overview', params)
  },

  exportVipStatsReport(params = {}) {
    return request.get('/analytics/export', params)
  }
}
