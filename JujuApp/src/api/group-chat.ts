// 群聊 API - 合并版
import api from "./index";
import apiClient from "./apiClient";
import { ApiResponse, PageResponse, Conversation, Message } from '../types/api';

export interface CreateGroupData {
  name: string;
  description?: string;
  avatar?: string;
  maxMembers?: number;
  type?: 'public' | 'private';
  allowInvite?: boolean;
  needApproval?: boolean;
  memberIds?: (string | number)[];
}

export interface SendGroupMessageData {
  content: string;
  type?: 'text' | 'image' | 'voice' | 'file';
  attachments?: unknown[];
}

// 从 group-chat.ts 保留的 API (使用 api 实例)
export const groupChatApiV1 = {
  createGroup: (data: CreateGroupData) => 
    api.post<ApiResponse<Conversation>>("/group-chat/groups", data),
  createPartyGroup: (partyId: string | number, data: CreateGroupData) => 
    api.post<ApiResponse<Conversation>>(`/group-chat/parties/${partyId}/group`, data),
  getGroups: (params: { page?: number; pageSize?: number } = {}) => 
    api.get<PageResponse<Conversation>>("/group-chat/groups", { params }),
  getGroup: (groupId: string | number) => 
    api.get<ApiResponse<Conversation>>(`/group-chat/groups/${groupId}`),
  getGroupMembers: (groupId: string | number) => 
    api.get<ApiResponse<{ id: number; nickname: string; avatar: string; role: string }[]>>(`/group-chat/groups/${groupId}/members`),
  joinGroup: (groupId: string | number) => 
    api.post<ApiResponse<void>>(`/group-chat/groups/${groupId}/join`),
  leaveGroup: (groupId: string | number) => 
    api.post<ApiResponse<void>>(`/group-chat/groups/${groupId}/leave`),
  removeMember: (groupId: string | number, userId: string | number) => 
    api.delete<ApiResponse<void>>(`/group-chat/groups/${groupId}/members/${userId}`),
  getMessages: (groupId: string | number, params: { page?: number; pageSize?: number; before?: string } = {}) => 
    api.get<PageResponse<Message>>(`/group-chat/groups/${groupId}/messages`, { params }),
  sendMessage: (groupId: string | number, data: SendGroupMessageData) => 
    api.post<ApiResponse<Message>>(`/group-chat/groups/${groupId}/messages`, data),
  getUnreadCount: (groupId: string | number) => 
    api.get<ApiResponse<{ count: number }>>(`/group-chat/groups/${groupId}/unread-count`),
  markAsRead: (groupId: string | number) => 
    api.put<ApiResponse<void>>(`/group-chat/groups/${groupId}/read`),
  updateGroupInfo: (groupId: string | number, data: Partial<CreateGroupData>) => 
    api.put<ApiResponse<Conversation>>(`/group-chat/groups/${groupId}`, data),
  disbandGroup: (groupId: string | number) => 
    api.delete<ApiResponse<void>>(`/group-chat/groups/${groupId}`),
};

// 从 groupChat.ts 合并的 API (使用 apiClient)
export const groupChatApiV2 = {
  getGroupList: (params?: { page?: number; pageSize?: number }) => apiClient.get<ApiResponse<PageResponse<Conversation>>>("/group-chats", { params }),
  getGroupDetail: (groupId: string) => apiClient.get<ApiResponse<Conversation>>(`/group-chats/${groupId}`),
  createGroupChat: (data: CreateGroupData) => apiClient.post<ApiResponse<Conversation>>("/group-chats", data),
  joinGroupChat: (groupId: string) => apiClient.post<ApiResponse<void>>(`/group-chats/${groupId}/join`),
  leaveGroupChat: (groupId: string) => apiClient.post<ApiResponse<void>>(`/group-chats/${groupId}/leave`),
  getGroupChatMembers: (groupId: string) => apiClient.get<ApiResponse<{ id: number; nickname: string; avatar: string; role: string }[]>>(`/group-chats/${groupId}/members`),
  sendGroupChatMessage: (groupId: string, data: SendGroupMessageData) => apiClient.post<ApiResponse<Message>>(`/group-chats/${groupId}/messages`, data),
  getGroupChatMessages: (groupId: string, params?: { page?: number; pageSize?: number }) => apiClient.get<ApiResponse<PageResponse<Message>>>(`/group-chats/${groupId}/messages`, { params }),
};

// 统一导出
export const groupChatApi = {
  ...groupChatApiV1,
  ...groupChatApiV2,
};

export default groupChatApi;
