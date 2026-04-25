import request from '../utils/request.js'

export const scanApi = {
  scanQRCode(qrCode) {
    return request.post('/api/v1/scan/verify', { qrCode })
  },

  getScanHistory(params = {}) {
    return request.get('/api/v1/scan/history', params)
  },

  getScanStats() {
    return request.get('/api/v1/scan/stats')
  },

  getScanDetail(scanId) {
    return request.get(`/api/v1/scan/${scanId}`)
  }
}
