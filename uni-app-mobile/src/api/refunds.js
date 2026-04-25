import request from '../utils/request'

/**
 * 退款API
 * @module refundApi
 */

export const refundApi = {
  /**
   * 获取退款列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   * @param {string} [params.status] - 退款状态
   * @returns {Promise<Object>} 退款列表
   */
  getRefunds(params = {}) {
    return request.get('/refunds', params)
  },

  /**
   * 获取退款详情
   * @param {number} id - 退款ID
   * @returns {Promise<Object>} 退款详情
   */
  getRefundDetail(id) {
    return request.get(`/refunds/${id}`)
  },

  /**
   * 申请退款
   * @param {Object} data - 退款数据
   * @param {number} data.orderId - 订单ID
   * @param {number} data.amount - 退款金额
   * @param {string} data.reason - 退款原因
   * @param {string} [data.description] - 详细说明
   * @returns {Promise<Object>} 申请结果
   */
  applyRefund(data) {
    return request.post('/refunds', data)
  }
}

export default refundApi
