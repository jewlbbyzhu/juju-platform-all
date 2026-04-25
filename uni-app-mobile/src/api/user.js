import request from '../utils/request'

/**
 * @typedef {Object} UserInfo
 * @property {number} id - 用户ID
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {string} phone - 手机号
 * @property {number} gender - 性别 0-未知 1-男 2-女
 * @property {string} birthday - 生日
 * @property {string} bio - 个人简介
 * @property {string} createdAt - 创建时间
 * @property {string} updatedAt - 更新时间
 */

/**
 * @typedef {Object} BlockedUser
 * @property {number} id - 用户ID
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {string} blockedAt - 拉黑时间
 */

/**
 * @typedef {Object} PageResult
 * @property {Array} list - 数据列表
 * @property {number} total - 总记录数
 * @property {number} page - 当前页码
 * @property {number} pageSize - 每页大小
 */

export const userApi = {
  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<UserInfo>} 用户信息
   */
  getUserInfo(userId) {
    return request({
      url: `/users/${userId}`,
      method: 'GET'
    })
  },

  /**
   * 更新用户信息
   * @param {Object} data - 用户数据
   * @param {string} data.nickname - 昵称
   * @param {string} data.avatar - 头像URL
   * @param {number} data.gender - 性别
   * @param {string} data.birthday - 生日
   * @param {string} data.bio - 个人简介
   * @returns {Promise<UserInfo>} 更新后的用户信息
   */
  updateUserInfo(data) {
    return request({
      url: '/users/profile',
      method: 'PUT',
      data
    })
  },

  /**
   * 获取拉黑用户列表
   * @param {number} [page=1] - 页码
   * @param {number} [pageSize=20] - 每页大小
   * @returns {Promise<PageResult<BlockedUser>>} 拉黑用户列表
   */
  getBlockedUsers(page = 1, pageSize = 20) {
    return request.get('/social/blocked', { page, pageSize })
  }
}
