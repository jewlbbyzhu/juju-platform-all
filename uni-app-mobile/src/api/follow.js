import request from '../utils/request.js'

export const followApi = {
  follow(userId) {
    return request.post(`/social/follow/${userId}`)
  },

  unfollow(userId) {
    return request.post(`/social/unfollow/${userId}`)
  },

  checkFollow(userId) {
    return request.get('/social/following', { userId })
  },

  getFollowers(params = {}) {
    return request.get('/social/followers', params)
  },

  getFollowing(params = {}) {
    return request.get('/social/following', params)
  }
}
