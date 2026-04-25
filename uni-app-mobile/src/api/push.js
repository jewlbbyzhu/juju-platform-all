import request from '../utils/request.js'

export const pushApi = {
  getPushMessages(params = {}) {
    return request.get('/push/notifications', params)
  },

  markAsRead(messageId) {
    return request.put(`/push/notifications/${messageId}/read`)
  },

  markAllAsRead() {
    return request.put('/push/notifications/read-all')
  },

  deleteMessage(messageId) {
    return request.delete(`/push/notifications/${messageId}`)
  },

  clearAllMessages() {
    return request.post('/push/notifications/clear')
  },

  getUnreadCount() {
    return request.get('/push/notifications/unread-count')
  },

  getPushSettings() {
    return request.get('/push/settings')
  },

  updatePushSettings(data) {
    return request.put('/push/settings', data)
  },

  enablePush(type) {
    return request.post(`/push/settings/${type}/enable`)
  },

  disablePush(type) {
    return request.post(`/push/settings/${type}/disable`)
  }
}
