import request from '../utils/request.js'

export const groupChatApi = {
  createGroup(data) {
    return request.post('/group-chat/groups', data)
  },

  createPartyGroup(partyId, data) {
    return request.post(`/group-chat/parties/${partyId}/group`, data)
  },

  getGroups(params = {}) {
    return request.get('/group-chat/groups', params)
  },

  getGroup(groupId) {
    return request.get(`/group-chat/groups/${groupId}`)
  },

  getGroupMembers(groupId) {
    return request.get(`/group-chat/groups/${groupId}/members`)
  },

  joinGroup(groupId) {
    return request.post(`/group-chat/groups/${groupId}/join`)
  },

  leaveGroup(groupId) {
    return request.post(`/group-chat/groups/${groupId}/leave`)
  },

  removeMember(groupId, userId) {
    return request.delete(`/group-chat/groups/${groupId}/members/${userId}`)
  },

  getMessages(groupId, params = {}) {
    return request.get(`/group-chat/groups/${groupId}/messages`, params)
  },

  sendMessage(groupId, data) {
    return request.post(`/group-chat/groups/${groupId}/messages`, data)
  },

  getUnreadCount(groupId) {
    return request.get(`/group-chat/groups/${groupId}/unread-count`)
  },

  markAsRead(groupId) {
    return request.put(`/group-chat/groups/${groupId}/read`)
  },

  updateGroupInfo(groupId, data) {
    return request.put(`/group-chat/groups/${groupId}`, data)
  },

  disbandGroup(groupId) {
    return request.delete(`/group-chat/groups/${groupId}`)
  }
}
