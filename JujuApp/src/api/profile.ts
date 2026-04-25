import api from './index';
import { ApiResponse, PageResponse, UserProfile } from '../types/api';

export interface UserPreferences {
  partyType?: string[];
  partyTime?: string[];
  partySize?: string[];
  budget?: string[];
  notification?: {
    party_enabled?: boolean;
    comment_enabled?: boolean;
    message_enabled?: boolean;
  };
}

export interface UserBehavior {
  action: string;
  targetId?: number;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

export const profileApi = {
  getUserProfile: () => api.get<ApiResponse<UserProfile>>('/users/profile'),
  updateUserProfile: (data: Partial<UserProfile>) => api.post<ApiResponse<UserProfile>>('/users/profile', data),
  getUserTags: () => api.get<ApiResponse<string[]>>('/users/tags'),
  updateUserTags: (tags: string[]) => api.put<ApiResponse<string[]>>('/users/tags', { tags }),
  getUserInterests: () => api.get<ApiResponse<string[]>>('/users/interests'),
  updateUserInterests: (interests: string[]) => api.put<ApiResponse<string[]>>('/users/interests', { interests }),
  getUserPreferences: () => api.get<ApiResponse<UserPreferences>>('/users/preferences'),
  updateUserPreferences: (data: Partial<UserPreferences>) => api.put<ApiResponse<UserPreferences>>('/users/preferences', data),
  getUserStatistics: () => api.get<ApiResponse<{ totalParties: number; totalParticipants: number; totalComments: number; totalLikes: number }>>('/analytics/users'),
  getRecommendedParties: (params?: { page?: number; pageSize?: number }) => api.get<ApiResponse<PageResponse<any>>>('/social/posts', { params }),
  getRecommendedUsers: (params?: { page?: number; pageSize?: number }) => api.get<ApiResponse<PageResponse<unknown>>>('/social/followers', { params }),
  getUserBehavior: () => api.get<ApiResponse<unknown[]>>('/users/behavior'),
  trackUserBehavior: (data: UserBehavior) => api.post<ApiResponse<void>>('/users/behavior', data),
};
export default profileApi;
