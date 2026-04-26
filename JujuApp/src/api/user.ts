import apiClient from './apiClient';
import { ApiResponse, PageResponse } from '../types/api';

export interface UserInfo {
  id: number;
  nickname: string;
  avatar: string;
  phone?: string;
  gender?: number;
  birthday?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockedUser {
  id: number;
  nickname: string;
  avatar: string;
  blockedAt: string;
}

export const userApi = {
  // 获取用户信息
  getUserInfo(userId: number) {
    return apiClient.get<ApiResponse<UserInfo>>(`/users/${userId}`);
  },

  // 更新用户信息
  updateUserInfo(data: Partial<UserInfo>) {
    return apiClient.put<ApiResponse<UserInfo>>('/users/profile', data);
  },

  // 获取拉黑列表
  getBlockedUsers(params?: { page?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<BlockedUser>>>('/users/blocked', { params });
  },

  // 拉黑用户
  blockUser(userId: number) {
    return apiClient.post<ApiResponse<void>>(`/users/${userId}/block`);
  },

  // 取消拉黑
  unblockUser(userId: number) {
    return apiClient.delete<ApiResponse<void>>(`/users/${userId}/block`);
  },

  // 搜索用户
  searchUsers(keyword: string, params?: { page?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<UserInfo>>>('/users/search', { params: { keyword, ...params } });
  },

  // 获取用户统计数据
  getUserStatistics(userId: number) {
    return apiClient.get<ApiResponse<{ totalParties: number; totalParticipants: number; totalComments: number; totalLikes: number }>>(`/users/${userId}/statistics`);
  },
};

export default userApi;
