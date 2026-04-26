import api from './index';
import { ApiResponse, PageResponse, Notification } from '../types/api';

/**
 * 通知 API
 * @module notificationApi
 */
export const notificationApi = {
  /**
   * 获取通知列表
   * @param {Object} params - 查询参数
   * @returns {Promise<ApiResponse<PageResponse<Notification>>>} 通知列表
   */
  getNotifications(params?: { page?: number; pageSize?: number; is_read?: boolean }) {
    return api.get<ApiResponse<PageResponse<Notification>>>('/notifications', { params });
  },

  /**
   * 获取通知详情
   * @param {string} id - 通知ID
   * @returns {Promise<ApiResponse<Notification>>} 通知详情
   */
  getNotificationDetail(id: string) {
    return api.get<ApiResponse<Notification>>(`/notifications/${id}`);
  },

  /**
   * 标记通知已读
   * @param {string} id - 通知ID
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  markAsRead(id: string) {
    return api.put<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  /**
   * 标记所有通知已读
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  markAllAsRead() {
    return api.put<ApiResponse<void>>('/notifications/read-all');
  },

  /**
   * 删除通知
   * @param {string} id - 通知ID
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  deleteNotification(id: string) {
    return api.delete<ApiResponse<void>>(`/notifications/${id}`);
  },

  /**
   * 删除所有通知
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  deleteAllNotifications() {
    return api.delete<ApiResponse<void>>('/notifications');
  },

  /**
   * 获取未读通知数量
   * @returns {Promise<ApiResponse<{ count: number }>>} 未读数量
   */
  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  },
};

export default notificationApi;
