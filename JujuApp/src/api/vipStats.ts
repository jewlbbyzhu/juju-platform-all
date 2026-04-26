// VIP统计 API
import api from './index';
import { ApiResponse } from '../types/api';

export interface VipStatsOverview {
  totalVipUsers: number;
  activeVipUsers: number;
  newVipUsersToday: number;
  vipRevenueToday: number;
  vipRevenueThisMonth: number;
  averageVipDuration: number;
}

export interface VipGrowthData {
  date: string;
  newUsers: number;
  churnUsers: number;
  netGrowth: number;
}

export interface VipLevelDistribution {
  level: number;
  count: number;
  percentage: number;
}

export interface VipRevenueStats {
  totalRevenue: number;
  subscriptionRevenue: number;
  upgradeRevenue: number;
  refundAmount: number;
  netRevenue: number;
}

export interface VipActivityStats {
  activeUsers: number;
  avgSessionDuration: number;
  featureUsage: Record<string, number>;
}

export interface VipRetentionData {
  period: string;
  retentionRate: number;
  cohortSize: number;
}

export interface VipConversionData {
  totalVisitors: number;
  trialUsers: number;
  convertedUsers: number;
  conversionRate: number;
}

interface StatsParams {
  period?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const vipStatsApi = {
  getVipStats: (params?: StatsParams): Promise<ApiResponse<VipStatsOverview>> => api.get('/analytics/users', { params }),
  getVipStatsOverview: (params?: StatsParams): Promise<ApiResponse<VipStatsOverview>> => api.get('/analytics/users', { params }),
  getVipGrowthTrend: (params?: StatsParams): Promise<ApiResponse<VipGrowthData[]>> => api.get('/analytics/users/range', { params }),
  getVipLevelDistribution: (params?: StatsParams): Promise<ApiResponse<VipLevelDistribution[]>> => api.get('/analytics/users', { params }),
  getVipRevenueStats: (params?: StatsParams): Promise<ApiResponse<VipRevenueStats>> => api.get('/analytics/revenue', { params }),
  getVipActivityStats: (params?: StatsParams): Promise<ApiResponse<VipActivityStats>> => api.get('/analytics/users', { params }),
  getVipRetentionStats: (params?: StatsParams): Promise<ApiResponse<VipRetentionData[]>> => api.get('/analytics/users/compare', { params }),
  getVipConversionStats: (params?: StatsParams): Promise<ApiResponse<VipConversionData>> => api.get('/analytics/overview', { params }),
  exportVipStatsReport: (params?: StatsParams): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> => api.get('/analytics/export', { params }),
};

export default vipStatsApi;
