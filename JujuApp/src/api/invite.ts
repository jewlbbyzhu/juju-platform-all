import apiClient from './apiClient';
import { ApiResponse, PageResponse } from '../types/api';

export interface InviteCode {
  code: string;
  inviterId: number;
  maxUses: number;
  usedCount: number;
  rewardAmount: number;
  expiredAt: string;
  createdAt: string;
}

export interface InviteRecord {
  id: number;
  inviteeId: number;
  inviteeNickname: string;
  inviteeAvatar: string;
  rewardAmount: number;
  createdAt: string;
}

export const inviteApi = {
  // 获取我的邀请码
  getMyInviteCode() {
    return apiClient.get<ApiResponse<InviteCode>>('/invite/code');
  },

  // 生成邀请码
  generateInviteCode() {
    return apiClient.post<ApiResponse<InviteCode>>('/invite/code');
  },

  // 使用邀请码
  useInviteCode(code: string) {
    return apiClient.post<ApiResponse<{ success: boolean; reward?: number }>>('/invite/use', { code });
  },

  // 获取邀请记录
  getInviteRecords(params?: { page?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<InviteRecord>>>('/invite/records', { params });
  },

  // 获取邀请统计
  getInviteStatistics() {
    return apiClient.get<ApiResponse<{ totalInvites: number; totalRewards: number; activeInvites: number }>>('/invite/statistics');
  },
};

export default inviteApi;
