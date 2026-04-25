import request from '../utils/request'

export const partyApi = {
  getParties(params = {}) {
    return request.get('/parties', params)
  },

  getPartyDetail(id) {
    return request.get(`/parties/${id}`)
  },

  getFeaturedParties() {
    return request.get('/parties/featured')
  },

  searchParties(keyword) {
    return request.get('/parties/search', { keyword })
  },

  getCategories() {
    return request.get('/categories')
  },

  createParty(data) {
    return request.post('/parties', data)
  },

  updateParty(id, data) {
    return request.put(`/parties/${id}`, data)
  },

  deleteParty(id) {
    return request.delete(`/parties/${id}`)
  },

  getMyParties(params = {}) {
    return request.get('/parties/my', params)
  }
}
