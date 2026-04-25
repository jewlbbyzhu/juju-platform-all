import request from '../utils/request.js'

export const chatApi = {
  getConversationList(params) {
    return request({
      url: '/chat/conversations',
      method: 'GET',
      data: params
    })
  },

  getMessages(conversationId, params) {
    return request({
      url: `/chat/conversations/${conversationId}/messages`,
      method: 'GET',
      data: params
    })
  },

  sendMessage(conversationId, data) {
    return request({
      url: `/chat/conversations/${conversationId}/messages`,
      method: 'POST',
      data
    })
  },

  createConversation(data) {
    return request({
      url: '/chat/conversations',
      method: 'POST',
      data
    })
  },

  markAsRead(conversationId) {
    return request({
      url: `/chat/conversations/${conversationId}/read`,
      method: 'POST'
    })
  },

  deleteMessage(messageId) {
    return request({
      url: `/chat/messages/${messageId}`,
      method: 'DELETE'
    })
  },

  recallMessage(messageId) {
    return request({
      url: `/chat/messages/${messageId}/recall`,
      method: 'POST'
    })
  },

  getGroupList(params) {
    return request({
      url: '/chat/groups',
      method: 'GET',
      data: params
    })
  },

  getGroupMessages(groupId, params) {
    return request({
      url: `/chat/groups/${groupId}/messages`,
      method: 'GET',
      data: params
    })
  },

  sendGroupMessage(groupId, data) {
    return request({
      url: `/chat/groups/${groupId}/messages`,
      method: 'POST',
      data
    })
  },

  createGroup(data) {
    return request({
      url: '/chat/groups',
      method: 'POST',
      data
    })
  },

  joinGroup(groupId) {
    return request({
      url: `/chat/groups/${groupId}/join`,
      method: 'POST'
    })
  },

  leaveGroup(groupId) {
    return request({
      url: `/chat/groups/${groupId}/leave`,
      method: 'POST'
    })
  },

  getGroupMembers(groupId) {
    return request({
      url: `/chat/groups/${groupId}/members`,
      method: 'GET'
    })
  },

  uploadImage(file) {
    return request({
      url: '/chat/upload/image',
      method: 'POST',
      data: { file }
    })
  },

  uploadVoice(file) {
    return request({
      url: '/chat/upload/voice',
      method: 'POST',
      data: { file }
    })
  },

  searchMessages(keyword) {
    return request({
      url: '/chat/messages/search',
      method: 'GET',
      data: { keyword }
    })
  }
}
