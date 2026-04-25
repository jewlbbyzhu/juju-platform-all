import api from './index';
import { ApiResponse, PageResponse, Notification } from '../types/api';

/**
 * 推送服务 API
 * @module pushApi
 */
export const pushApi = {
  /**
   * 获取推送消息列表
   * @param {Object} params - 查询参数
   * @returns {Promise<ApiResponse<PageResponse<Notification>>>} 推送消息列表
   */
  getPushMessages(params?: { page?: number; pageSize?: number }) {
    return api.get<ApiResponse<PageResponse<Notification>>>('/push/notifications', { params });
  },

  /**
   * 标记消息已读
   * @param {string} messageId - 消息ID
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  markAsRead(messageId: string) {
    return api.put<ApiResponse<void>>(`/push/notifications/${messageId}/read`);
  },

  /**
   * 标记所有消息已读
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  markAllAsRead() {
    return api.put<ApiResponse<void>>('/push/notifications/read-all');
  },

  /**
   * 删除消息
   * @param {string} messageId - 消息ID
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  deleteMessage(messageId: string) {
    return api.delete<ApiResponse<void>>(`/push/notifications/${messageId}`);
  },

  /**
   * 清空所有消息
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  clearAllMessages() {
    return api.post<ApiResponse<void>>('/push/notifications/clear');
  },

  /**
   * 获取未读消息数量
   * @returns {Promise<ApiResponse<{ count: number }>>} 未读数量
   */
  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>('/push/notifications/unread-count');
  },

  /**
   * 获取推送设置
   * @returns {Promise<ApiResponse<PushSettings>>} 推送设置
   */
  getPushSettings() {
    return api.get<ApiResponse<PushSettings>>('/push/settings');
  },

  /**
   * 更新推送设置
   * @param {Object} data - 推送设置数据
   * @returns {Promise<ApiResponse<PushSettings>>} 更新结果
   */
  updatePushSettings(data: Partial<PushSettings>) {
    return api.put<ApiResponse<PushSettings>>('/push/settings', data);
  },

  /**
   * 启用指定类型推送
   * @param {string} type - 推送类型
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  enablePush(type: string) {
    return api.post<ApiResponse<void>>(`/push/settings/${type}/enable`);
  },

  /**
   * 禁用指定类型推送
   * @param {string} type - 推送类型
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  disablePush(type: string) {
    return api.post<ApiResponse<void>>(`/push/settings/${type}/disable`);
  },
};

export interface PushSettings {
  party_enabled?: boolean;
  comment_enabled?: boolean;
  like_enabled?: boolean;
  follow_enabled?: boolean;
  message_enabled?: boolean;
  activity_enabled?: boolean;
  system_enabled?: boolean;
  do_not_disturb_enabled?: boolean;
  do_not_disturb_start?: string;
  do_not_disturb_end?: string;
  aggregate_enabled?: boolean;
  push_interval?: number;
}

export default pushApi;
