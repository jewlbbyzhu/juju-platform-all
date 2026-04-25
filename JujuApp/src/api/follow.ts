// 关注相关 API
import api from "./index";
import { ApiResponse, PageResponse } from '../types/api';

export interface FollowUser {
  id: number;
  nickname: string;
  avatar: string;
  bio?: string;
  isFollowing?: boolean;
}

export const followApi = {
  getFollowers: (userId?: string, params?: { page?: number; pageSize?: number }) => api.get<ApiResponse<PageResponse<FollowUser>>>(`/follows/followers/${userId || ""}`, { params }),
  getFollowing: (userId?: string, params?: { page?: number; pageSize?: number }) => api.get<ApiResponse<PageResponse<FollowUser>>>(`/follows/following/${userId || ""}`, { params }),
  follow: (userId: string) => api.post<ApiResponse<void>>("/follows", { userId }),
  unfollow: (userId: string) => api.delete<ApiResponse<void>>(`/follows/${userId}`),
  checkFollow: (userId: string) => api.get<ApiResponse<{ isFollowing: boolean }>>(`/follows/check/${userId}`),
};

export default followApi;
