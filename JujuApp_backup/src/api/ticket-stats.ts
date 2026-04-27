import apiClient from './apiClient';
import { ApiResponse } from '../types/api';

export interface TicketStats {
  totalTickets: number;
  soldTickets: number;
  usedTickets: number;
  refundedTickets: number;
  totalAmount: number;
  refundedAmount: number;
}

export interface TicketStatsDetail {
  ticketTypeId: number;
  ticketTypeName: string;
  totalCount: number;
  soldCount: number;
  usedCount: number;
  refundedCount: number;
  price: number;
  totalAmount: number;
}

export const ticketStatsApi = {
  // 获取票统计概览
  getTicketOverview(party_id?: number) {
    return apiClient.get<ApiResponse<TicketStats>>('/ticket-stats/overview', { params: party_id ? { party_id } : undefined });
  },

  // 获取票统计详情
  getTicketStatsDetail(party_id?: number) {
    return apiClient.get<ApiResponse<TicketStatsDetail[]>>('/ticket-stats/detail', { params: party_id ? { party_id } : undefined });
  },

  // 获取票销售趋势
  getTicketSalesTrend(params?: { party_id?: number; days?: number }) {
    return apiClient.get<ApiResponse<{ date: string; sales: number; revenue: number }[]>>('/ticket-stats/trend', { params });
  },

  // 获取票使用统计
  getTicketUsageStats(partyId?: number) {
    return apiClient.get<ApiResponse<{ used: number; unused: number; expired: number }>>('/ticket-stats/usage', { params: partyId ? { partyId } : undefined });
  },
  // 获取单个票型统计详情
  getTicketDetailStats(ticketId: number) {
    return apiClient.get<ApiResponse<TicketStatsDetail>>(`/ticket-stats/${ticketId}`);
  },
};

export default ticketStatsApi;
