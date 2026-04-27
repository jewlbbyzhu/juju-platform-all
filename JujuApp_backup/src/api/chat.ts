// 聊天消息相关 API
import api from "./index";
import { ApiResponse, PageResponse, Conversation, Message } from '../types/api';

interface MessageParams {
  page?: number;
  pageSize?: number;
  before?: string;
}

interface SendMessageData {
  content: string;
  type?: string;
  attachments?: unknown[];
}

interface CreateConversationData {
  userId?: string;
  type?: string;
  name?: string;
}

export const chatApi = {
  getConversationList: (params?: { page?: number; pageSize?: number }): Promise<PageResponse<Conversation>> => 
    api.get("/chat/conversations", { params }),
  getMessages: (conversationId: string, params?: MessageParams): Promise<PageResponse<Message>> => 
    api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, data: SendMessageData): Promise<ApiResponse<Message>> => 
    api.post(`/chat/conversations/${conversationId}/messages`, data),
  createConversation: (data: CreateConversationData): Promise<ApiResponse<Conversation>> => 
    api.post("/chat/conversations", data),
  markAsRead: (conversationId: string): Promise<ApiResponse<void>> => 
    api.post(`/chat/conversations/${conversationId}/read`),
  deleteMessage: (messageId: string): Promise<ApiResponse<void>> => 
    api.delete(`/chat/messages/${messageId}`),
};

export default chatApi;
