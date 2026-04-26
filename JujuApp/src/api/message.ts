import api from './index';
import { ApiResponse, PageResponse, Message, Conversation } from '../types/api';

/**
 * 消息 API
 * @module messageApi
 */
export const messageApi = {
  /**
   * 获取会话列表
   * @param {Object} params - 查询参数
   * @returns {Promise<ApiResponse<PageResponse<Conversation>>>} 会话列表
   */
  getConversations(params?: { page?: number; pageSize?: number }) {
    return api.get<ApiResponse<PageResponse<Conversation>>>('/chat/conversations', { params });
  },

  /**
   * 创建会话
   * @param {Object} data - 会话数据
   * @returns {Promise<ApiResponse<Conversation>>} 创建结果
   */
  createConversation(data: { participant_id: string; type?: string }) {
    return api.post<ApiResponse<Conversation>>('/chat/conversations', data);
  },

  /**
   * 获取消息列表
   * @param {string} conversationId - 会话ID
   * @param {Object} params - 查询参数
   * @returns {Promise<ApiResponse<PageResponse<Message>>>} 消息列表
   */
  getMessages(conversationId: string, params?: { page?: number; pageSize?: number }) {
    return api.get<ApiResponse<PageResponse<Message>>>(`/chat/conversations/${conversationId}/messages`, { params });
  },

  /**
   * 发送消息
   * @param {string} conversationId - 会话ID
   * @param {Object} data - 消息数据
   * @returns {Promise<ApiResponse<Message>>} 发送结果
   */
  sendMessage(conversationId: string, data: { content: string; type?: string }) {
    return api.post<ApiResponse<Message>>(`/chat/conversations/${conversationId}/messages`, data);
  },

  /**
   * 标记会话已读
   * @param {string} conversationId - 会话ID
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  markAsRead(conversationId: string) {
    return api.put<ApiResponse<void>>(`/chat/conversations/${conversationId}/read`);
  },

  /**
   * 删除会话
   * @param {string} conversationId - 会话ID
   * @returns {Promise<ApiResponse<void>>} 操作结果
   */
  deleteConversation(conversationId: string) {
    return api.delete<ApiResponse<void>>(`/chat/conversations/${conversationId}`);
  },

  /**
   * 获取未读消息数量
   * @returns {Promise<ApiResponse<{ count: number }>>} 未读数量
   */
  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>('/chat/unread-count');
  },
};

export default messageApi;
