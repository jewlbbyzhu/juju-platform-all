import request from '../utils/request.js'

export const socialApi = {
  followUser(userId) {
    return request.post(`/social/follow/${userId}`)
  },

  unfollowUser(userId) {
    return request.post(`/social/unfollow/${userId}`)
  },

  getFollowers(params) {
    return request.get('/social/followers', params)
  },

  getFollowing(params) {
    return request.get('/social/following', params)
  },

  getComments(partyId, params) {
    return request.get(`/social/parties/${partyId}/comments`, params)
  },

  addComment(partyId, data) {
    return request.post(`/social/parties/${partyId}/comments`, data)
  },

  deleteComment(commentId) {
    return request.delete(`/social/comments/${commentId}`)
  },

  likeComment(commentId) {
    return request.post(`/social/comments/${commentId}/like`)
  },

  unlikeComment(commentId) {
    return request.post(`/social/comments/${commentId}/unlike`)
  },

  likeParty(partyId) {
    return request.post(`/social/parties/${partyId}/like`)
  },

  unlikeParty(partyId) {
    return request.post(`/social/parties/${partyId}/unlike`)
  },

  shareParty(partyId, data) {
    return request.post(`/social/parties/${partyId}/share`, data)
  },

  getShareCount(partyId) {
    return request.get(`/social/parties/${partyId}/share-count`)
  },

  reportUser(data) {
    return request.post('/social/report/user', data)
  },

  reportComment(data) {
    return request.post('/social/report/comment', data)
  },

  blockUser(userId) {
    return request.post(`/social/block/${userId}`)
  },

  unblockUser(userId) {
    return request.post(`/social/unblock/${userId}`)
  },

  getPosts(params) {
    return request.get('/social/posts', params)
  },

  createPost(data) {
    return request.post('/social/posts', data)
  },

  updatePost(postId, data) {
    return request.put(`/social/posts/${postId}`, data)
  },

  deletePost(postId) {
    return request.delete(`/social/posts/${postId}`)
  },

  likePost(postId) {
    return request.post(`/social/posts/${postId}/like`)
  },

  unlikePost(postId) {
    return request.post(`/social/posts/${postId}/unlike`)
  },

  getPostComments(postId, params) {
    return request.get(`/social/posts/${postId}/comments`, params)
  },

  addPostComment(postId, data) {
    return request.post(`/social/posts/${postId}/comments`, data)
  },

  sharePost(postId, data) {
    return request.post(`/social/posts/${postId}/share`, data)
  },

  reportPost(data) {
    return request.post('/social/report/post', data)
  }
}
