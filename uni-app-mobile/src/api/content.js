import request from '../utils/request'

/**
 * 内容API
 * @module contentApi
 */

export const contentApi = {
  /**
   * 获取内容列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   * @param {string} [params.category] - 内容分类
   * @param {string} [params.type] - 内容类型
   * @returns {Promise<Object>} 内容列表
   */
  getContents(params = {}) {
    return request.get('/content', params)
  },

  /**
   * 获取内容详情
   * @param {number} id - 内容ID
   * @returns {Promise<Object>} 内容详情
   */
  getContentDetail(id) {
    return request.get(`/content/${id}`)
  },

  /**
   * 获取轮播图列表
   * @param {string} [position='home'] - 轮播图位置
   * @returns {Promise<Array>} 轮播图列表
   */
  getBanners(position = 'home') {
    return request.get('/content/banners', { position })
  },

  /**
   * 获取公告列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 公告列表
   */
  getAnnouncements(params = {}) {
    return request.get('/content/announcements', params)
  },

  /**
   * 获取公告详情
   * @param {number} id - 公告ID
   * @returns {Promise<Object>} 公告详情
   */
  getAnnouncementDetail(id) {
    return request.get(`/content/announcements/${id}`)
  }
}

export default contentApi
