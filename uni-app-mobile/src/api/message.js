import request from '../utils/request.js'

export const messageApi = {
  getConversations(params = {}) {
    return request.get('/chat/conversations', params)
  },

  createConversation(data) {
    return request.post('/chat/conversations', data)
  },

  getMessages(conversationId, params = {}) {
    return request.get(`/chat/conversations/${conversationId}/messages`, params)
  },

  sendMessage(conversationId, data) {
    return request.post(`/chat/conversations/${conversationId}/messages`, data)
  },

  markAsRead(conversationId) {
    return request.put(`/chat/conversations/${conversationId}/read`)
  },

  deleteConversation(conversationId) {
    return request.delete(`/chat/conversations/${conversationId}`)
  },

  getUnreadCount() {
    return request.get('/chat/unread-count')
  }
}
