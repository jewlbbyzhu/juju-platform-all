import request from '../utils/request.js'

export const inviteApi = {
  getInviteCode() {
    return request.get('/api/v1/invite/code')
  },

  generateInviteCode() {
    return request.post('/api/v1/invite/generate')
  },

  validateInviteCode(code) {
    return request.post('/api/v1/invite/validate', { code })
  },

  useInviteCode(code) {
    return request.post('/api/v1/invite/use', { code })
  },

  getInviteStats() {
    return request.get('/api/v1/invite/stats')
  },

  getInviteHistory(params = {}) {
    return request.get('/api/v1/invite/history', params)
  },

  getInviteRewards() {
    return request.get('/api/v1/invite/rewards')
  },

  claimReward(rewardId) {
    return request.post(`/api/v1/invite/rewards/${rewardId}/claim`)
  },

  shareInvite(platform) {
    return request.post('/api/v1/invite/share', { platform })
  }
}
