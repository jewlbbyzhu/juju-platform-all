import request from '../utils/request'

/**
 * 银行卡API
 * @module bankcardApi
 */

export const bankcardApi = {
  /**
   * 获取银行卡列表
   * @returns {Promise<Array>} 银行卡列表
   */
  getBankCards() {
    return request.get('/bankcards')
  },

  /**
   * 添加银行卡
   * @param {Object} data - 银行卡数据
   * @param {string} data.bankName - 银行名称
   * @param {string} data.cardNumber - 银行卡号
   * @param {string} data.cardHolder - 持卡人姓名
   * @param {string} data.phone - 预留手机号
   * @param {string} [data.branch] - 开户支行
   * @returns {Promise<Object>} 添加结果
   */
  addBankCard(data) {
    return request.post('/bankcards', data)
  },

  /**
   * 删除银行卡
   * @param {number} id - 银行卡ID
   * @returns {Promise<void>}
   */
  deleteBankCard(id) {
    return request.delete(`/bankcards/${id}`)
  },

  /**
   * 设置默认银行卡
   * @param {number} id - 银行卡ID
   * @returns {Promise<Object>} 设置结果
   */
  setDefaultBankCard(id) {
    return request.put(`/bankcards/${id}/default`)
  }
}

export default bankcardApi
