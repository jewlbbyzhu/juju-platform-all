import apiClient from './apiClient';
import { ApiResponse, PageResponse } from '../types/api';

export interface ScanRecord {
  id: number;
  type: 'ticket' | 'invite' | 'payment';
  content: string;
  result?: string;
  createdAt: string;
}

export interface ScanTicketResult {
  valid: boolean;
  ticket?: {
    id: number;
    orderNo: string;
    partyTitle: string;
    ticketTypeName: string;
    status: string;
    usedAt?: string;
  };
  message?: string;
}

export const scanApi = {
  // 验证票券二维码
  verifyTicket(qrcode: string) {
    return apiClient.post<ApiResponse<ScanTicketResult>>('/scan/ticket', { qrcode });
  },

  // 使用票券
  useTicket(qrcode: string) {
    return apiClient.post<ApiResponse<ScanTicketResult>>('/scan/ticket/use', { qrcode });
  },

  // 获取扫码历史
  getScanHistory(params?: { page?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<ScanRecord>>>('/scan/history', { params });
  },

  // 保存扫码记录
  saveScanRecord(data: { type: string; content: string; result?: string }) {
    return apiClient.post<ApiResponse<ScanRecord>>('/scan/record', data);
  },

  // 清空扫码历史
  clearScanHistory() {
    return apiClient.delete<ApiResponse<void>>('/scan/history');
  },
};

export default scanApi;
