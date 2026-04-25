import request from '../utils/request.js'

/**
 * VIP相关API
 * @module vipApi
 */

/**
 * @typedef {import('./types').VipPackage} VipPackage
 * @typedef {import('./types').VipSubscription} VipSubscription
 * @typedef {import('./types').PageResult} PageResult
 * @typedef {import('./types').Party} Party
 */

export const vipApi = {
  /**
   * 获取VIP套餐列表
   * @returns {Promise<VipPackage[]>} VIP套餐列表
   */
  getVipPackages() {
    return request({
      url: '/vip/packages',
      method: 'GET'
    })
  },

  /**
   * 订阅VIP套餐
   * @param {number} packageId - 套餐ID
   * @param {Object} data - 支付数据
   * @returns {Promise<Object>} 订阅结果
   */
  subscribe(packageId, data) {
    return request({
      url: '/vip/subscribe',
      method: 'POST',
      data: { packageId, ...data }
    })
  },

  /**
   * 获取订阅状态
   * @returns {Promise<VipSubscription>} 订阅状态
   */
  getSubscriptionStatus() {
    return request.get('/vip/status')
  },

  /**
   * 获取订阅历史
   * @param {Object} params - 查询参数
   * @returns {Promise<PageResult>} 订阅历史列表
   */
  getSubscriptionHistory(params) {
    return request({
      url: '/vip/history',
      method: 'GET',
      data: params
    })
  },

  /**
   * 续订VIP
   * @param {number} packageId - 套餐ID
   * @param {Object} data - 支付数据
   * @returns {Promise<Object>} 续订结果
   */
  renewSubscription(packageId, data) {
    return request({
      url: '/vip/renew',
      method: 'POST',
      data: { packageId, ...data }
    })
  },

  /**
   * 取消订阅
   * @param {string} reason - 取消原因
   * @returns {Promise<void>}
   */
  cancelSubscription(reason) {
    return request({
      url: '/vip/cancel',
      method: 'POST',
      data: { reason }
    })
  },

  /**
   * 切换自动续费
   * @param {boolean} enable - 是否开启
   * @returns {Promise<Object>} 操作结果
   */
  toggleAutoRenewal(enable) {
    return request({
      url: '/vip/auto-renewal',
      method: 'POST',
      data: { enable }
    })
  },

  /**
   * 获取VIP权益
   * @returns {Promise<Object>} VIP权益
   */
  getVipBenefits() {
    return request({
      url: '/vip/benefits',
      method: 'GET'
    })
  },

  /**
   * 获取专属活动列表
   * @param {Object} params - 查询参数
   * @returns {Promise<PageResult<Party>>} 活动列表
   */
  getExclusiveEvents(params) {
    return request({
      url: '/vip/events',
      method: 'GET',
      data: params
    })
  },

  /**
   * 加入VIP专属活动
   * @param {number} eventId - 活动ID
   * @returns {Promise<Object>} 加入结果
   */
  joinVipEvent(eventId) {
    return request({
      url: `/vip/events/${eventId}/join`,
      method: 'POST'
    })
  },

  /**
   * 获取VIP活动详情
   * @param {number} eventId - 活动ID
   * @returns {Promise<Party>} 活动详情
   */
  getVipEventDetail(eventId) {
    return request.get(`/vip/events/${eventId}`)
  },

  /**
   * 获取VIP等级列表
   * @returns {Promise<Object[]>} VIP等级列表
   */
  getVipLevels() {
    return request({
      url: '/vip/levels',
      method: 'GET'
    })
  },

  /**
   * 获取VIP等级详情
   * @param {number} levelId - 等级ID
   * @returns {Promise<Object>} 等级详情
   */
  getVipLevelDetail(levelId) {
    return request({
      url: `/vip/levels/${levelId}`,
      method: 'GET'
    })
  },

  /**
   * 获取VIP成长值记录
   * @param {Object} params - 查询参数
   * @returns {Promise<PageResult>} 成长值记录
   */
  getGrowthRecords(params) {
    return request({
      url: '/vip/growth-records',
      method: 'GET',
      data: params
    })
  },

  /**
   * 获取VIP优惠券
   * @returns {Promise<Object[]>} 优惠券列表
   */
  getVipCoupons() {
    return request({
      url: '/vip/coupons',
      method: 'GET'
    })
  }
}
