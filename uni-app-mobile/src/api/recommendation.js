import request from '../utils/request.js'

export const recommendationApi = {
  getRecommendations(params = {}) {
    return request.get('/api/v1/recommendations', params)
  },

  getSimilarParties(partyId, params = {}) {
    return request.get(`/api/v1/recommendations/similar/${partyId}`, params)
  },

  getHotParties(params = {}) {
    return request.get('/api/v1/recommendations/hot', params)
  },

  getNearbyParties(params = {}) {
    return request.get('/api/v1/recommendations/nearby', params)
  },

  updatePreferences(data) {
    return request.post('/api/v1/recommendations/preferences', data)
  },

  getPreferences() {
    return request.get('/api/v1/recommendations/preferences')
  },

  trackBehavior(data) {
    return request.post('/api/v1/recommendations/behavior', data)
  }
}
