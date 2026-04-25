import request from '../utils/request.js'

export const profileApi = {
  getUserProfile() {
    return request.get('/users/profile')
  },

  updateUserProfile(data) {
    return request.post('/users/profile', data)
  },

  // 注意: 以下API在v2中可能已迁移到social或其他模块
  getUserTags() {
    return request.get('/api/v1/user/tags')
  },

  updateUserTags(tags) {
    return request.put('/api/v1/user/tags', { tags })
  },

  getUserInterests() {
    return request.get('/api/v1/user/interests')
  },

  updateUserInterests(interests) {
    return request.put('/api/v1/user/interests', { interests })
  },

  getUserPreferences() {
    return request.get('/api/v1/user/preferences')
  },

  updateUserPreferences(data) {
    return request.put('/api/v1/user/preferences', data)
  },

  // 使用analytics替代原来的statistics
  getUserStatistics() {
    return request.get('/analytics/users')
  },

  // 推荐功能已迁移到social模块
  getRecommendedParties(params) {
    return request.get('/social/posts', params)
  },

  getRecommendedUsers(params) {
    return request.get('/social/followers', params)
  },

  getUserBehavior() {
    return request.get('/api/v1/user/behavior')
  },

  trackUserBehavior(data) {
    return request.post('/api/v1/user/behavior', data)
  }
}
