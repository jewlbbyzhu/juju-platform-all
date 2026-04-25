import request from '../utils/request'

export const notificationApi = {
  getNotifications(params = {}) {
    return request.get('/notifications', params)
  },

  getNotificationDetail(id) {
    return request.get(`/notifications/${id}`)
  },

  markAsRead(id) {
    return request.put(`/notifications/${id}/read`)
  },

  markAllAsRead() {
    return request.put('/notifications/read-all')
  },

  deleteNotification(id) {
    return request.delete(`/notifications/${id}`)
  },

  deleteAllNotifications() {
    return request.delete('/notifications')
  },

  getUnreadCount() {
    return request.get('/notifications/unread-count')
  }
}
