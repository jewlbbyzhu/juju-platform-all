import request from '../utils/request'

/**
 * 收藏API
 * @module favoriteApi
 */

export const favoriteApi = {
  /**
   * 获取收藏列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   * @param {string} [params.type] - 收藏类型: party-聚会, user-用户
   * @returns {Promise<Object>} 收藏列表
   */
  getFavorites(params = {}) {
    return request.get('/favorites', params)
  },

  /**
   * 添加收藏
   * @param {Object} data - 收藏数据
   * @param {number} data.targetId - 目标ID
   * @param {string} data.type - 收藏类型: party-聚会, user-用户
   * @returns {Promise<Object>} 添加结果
   */
  addFavorite(data) {
    return request.post('/favorites', data)
  },

  /**
   * 取消收藏
   * @param {number} id - 收藏ID
   * @returns {Promise<void>}
   */
  removeFavorite(id) {
    return request.delete(`/favorites/${id}`)
  },

  /**
   * 检查是否已收藏
   * @param {number} targetId - 目标ID
   * @returns {Promise<Object>} 检查结果 { isFavorited: boolean }
   */
  checkFavorite(targetId) {
    return request.get(`/favorites/check/${targetId}`)
  }
}

export default favoriteApi
