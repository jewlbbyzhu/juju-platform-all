import request from '../utils/request.js'

export const tagApi = {
  getTagList(params = {}) {
    return request.get('/api/v1/tags', params)
  },

  getHotTags(params = {}) {
    return request.get('/api/v1/tags/hot', params)
  },

  getTagDetail(tagId) {
    return request.get(`/api/v1/tags/${tagId}`)
  },

  createTag(data) {
    return request.post('/api/v1/tags', data)
  },

  updateTag(tagId, data) {
    return request.put(`/api/v1/tags/${tagId}`, data)
  },

  deleteTag(tagId) {
    return request.delete(`/api/v1/tags/${tagId}`)
  },

  followTag(tagId) {
    return request.post(`/api/v1/tags/${tagId}/follow`)
  },

  unfollowTag(tagId) {
    return request.post(`/api/v1/tags/${tagId}/unfollow`)
  },

  getTagParties(tagId, params = {}) {
    return request.get(`/api/v1/tags/${tagId}/parties`, params)
  },

  searchTags(keyword) {
    return request.get('/api/v1/tags/search', { keyword })
  },

  getRecommendedTags(params = {}) {
    return request.get('/api/v1/tags/recommended', params)
  }
}
