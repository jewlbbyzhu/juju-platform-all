import request from '../utils/request'

/**
 * 钱包API
 * @module walletApi
 */

export const walletApi = {
  /**
   * 获取我的钱包信息
   * @returns {Promise<Object>} 钱包信息
   */
  getWalletInfo() {
    return request.get('/wallet/my')
  },

  /**
   * 钱包充值
   * @param {Object} data - 充值数据
   * @param {number} data.amount - 充值金额
   * @param {string} data.paymentMethod - 支付方式
   * @returns {Promise<Object>} 充值结果
   */
  recharge(data) {
    return request.post('/wallet/recharge', data)
  },

  /**
   * 钱包提现
   * @param {Object} data - 提现数据
   * @param {number} data.amount - 提现金额
   * @param {number} data.bankCardId - 银行卡ID
   * @param {string} data.paymentPassword - 支付密码
   * @returns {Promise<Object>} 提现结果
   */
  withdraw(data) {
    return request.post('/wallet/withdraw', data)
  },

  /**
   * 获取我的交易记录
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   * @param {string} [params.type] - 交易类型
   * @returns {Promise<Object>} 交易记录列表
   */
  getTransactions(params = {}) {
    return request.get('/wallet/my/transactions', params)
  },

  /**
   * 设置支付密码
   * @param {Object} data - 密码数据
   * @param {string} data.password - 支付密码
   * @returns {Promise<Object>} 设置结果
   */
  setPassword(data) {
    return request.post('/wallet/password', data)
  },

  /**
   * 修改支付密码
   * @param {Object} data - 密码数据
   * @param {string} data.old_password - 旧密码
   * @param {string} data.new_password - 新密码
   * @param {string} data.confirm_password - 确认密码
   * @returns {Promise<Object>} 修改结果
   */
  updatePassword(data) {
    return request.put('/wallet/password', data)
  },

  /**
   * 验证支付密码
   * @param {Object} data - 密码数据
   * @param {string} data.password - 支付密码
   * @returns {Promise<Object>} 验证结果
   */
  verifyPassword(data) {
    return request.post('/wallet/password/verify', data)
  },

  /**
   * 转账
   * @param {Object} data - 转账数据
   * @param {number} data.toUserId - 目标用户ID
   * @param {number} data.amount - 转账金额
   * @param {string} data.paymentPassword - 支付密码
   * @param {string} [data.remark] - 备注
   * @returns {Promise<Object>} 转账结果
   */
  transfer(data) {
    return request.post('/wallet/transfer', data)
  }
}

export default walletApi
