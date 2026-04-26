// VIP系统 API
import api from './index';
import { ApiResponse, PageResponse } from '../types/api';

interface VipParams {
  page?: number;
  pageSize?: number;
}

interface SubscribeData {
  paymentMethod?: string;
  couponCode?: string;
}

interface CancelData {
  reason?: string;
}

export interface VipPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  benefits: string[];
  isHot?: boolean;
}

export interface VipStatus {
  isVip: boolean;
  level: number;
  expireAt: string;
  benefits: string[];
}

export const vipApi = {
  getVipPackages: (): Promise<ApiResponse<VipPackage[]>> => api.get('/vip/packages'),
  subscribe: (packageId: string, data: SubscribeData): Promise<ApiResponse<{ orderId: string; paymentUrl?: string }>> => 
    api.post('/vip/subscribe', { packageId, ...data }),
  getSubscriptionStatus: (): Promise<ApiResponse<VipStatus>> => api.get('/vip/status'),
  getSubscriptionHistory: (params?: VipParams): Promise<ApiResponse<PageResponse<unknown>>> => 
    api.get('/vip/history', { params }),
  renewSubscription: (packageId: string, data: SubscribeData): Promise<ApiResponse<{ orderId: string }>> => 
    api.post('/vip/renew', { packageId, ...data }),
  cancelSubscription: (data: CancelData): Promise<ApiResponse<void>> => 
    api.post('/vip/cancel', data),
  getVipBenefits: (): Promise<ApiResponse<{ benefits: string[]; exclusiveEvents: unknown[] }>> => api.get('/vip/benefits'),
  getVipEvents: (params?: VipParams): Promise<ApiResponse<PageResponse<unknown>>> => 
    api.get('/vip/events', { params }),
  joinVipEvent: (eventId: string): Promise<ApiResponse<{ ticketId: string }>> => 
    api.post(`/vip/events/${eventId}/join`),
  getVipLevels: (): Promise<ApiResponse<{ id: string; name: string; minPoints: number; benefits: string[] }[]>> => api.get('/vip/levels'),
  getVipLevelDetail: (levelId: string): Promise<ApiResponse<unknown>> => 
    api.get(`/vip/levels/${levelId}`),
  upgradeVipLevel: (levelId: string, data: Record<string, unknown>): Promise<ApiResponse<{ success: boolean; newLevel: number }>> => 
    api.post(`/vip/levels/${levelId}/upgrade`, data),
  getVipPoints: (): Promise<ApiResponse<{ total: number; available: number; expireSoon: number }>> => api.get('/vip/points'),
  getVipPointsHistory: (params?: VipParams): Promise<ApiResponse<PageResponse<unknown>>> => 
    api.get('/vip/points-history', { params }),
  getVipRewards: (): Promise<ApiResponse<{ id: string; name: string; points: number; stock: number }[]>> => api.get('/vip/rewards'),
  redeemPoints: (rewardId: string): Promise<ApiResponse<{ success: boolean; code: string }>> => 
    api.post(`/vip/rewards/${rewardId}/redeem`),
  getVipCoupons: (): Promise<ApiResponse<{ id: string; name: string; discount: number; expireAt: string }[]>> => api.get('/vip/coupons'),
};

export default vipApi;
