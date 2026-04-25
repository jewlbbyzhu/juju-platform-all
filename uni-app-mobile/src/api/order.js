import request from '../utils/request'

export const orderApi = {
  createOrder(data) {
    return request.post('/orders', data)
  },

  getOrders(params = {}) {
    return request.get('/orders', params)
  },

  getOrderDetail(id) {
    return request.get(`/orders/${id}`)
  },

  cancelOrder(id) {
    return request.post(`/orders/${id}/cancel`)
  },

  getOrderStatistics() {
    return request.get('/orders/statistics')
  }
}

export const paymentApi = {
  createPayment(orderId, data) {
    return request.post(`/orders/${orderId}/payment`, data)
  },

  getPaymentStatus(orderId) {
    return request.get(`/orders/${orderId}/payment/status`)
  },

  getPaymentMethods() {
    return request.get('/payments/methods')
  },

  verifyPayment(orderId, data) {
    return request.post(`/orders/${orderId}/payment/verify`, data)
  }
}
