import apiClient from './apiClient';
import { ApiResponse, PageResponse } from '../types/api';

export interface Refund {
  id: number;
  orderId: number;
  orderNo: string;
  amount: number;
  reason: string;
  description?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  handledAt?: string;
}

export interface RefundApplyData {
  reason: string;
  description?: string;
  images?: string[];
}

export const refundApi = {
  // 申请退款
  applyRefund(orderId: number, data: RefundApplyData) {
    return apiClient.post<ApiResponse<Refund>>(`/orders/${orderId}/refund`, data);
  },

  // 获取退款列表
  getRefundList(params?: { status?: string; page?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<Refund>>>('/refunds', { params });
  },

  // 获取退款详情
  getRefundDetail(refundId: number) {
    return apiClient.get<ApiResponse<Refund>>(`/refunds/${refundId}`);
  },

  // 取消退款申请
  cancelRefund(refundId: number) {
    return apiClient.post<ApiResponse<void>>(`/refunds/${refundId}/cancel`);
  },
};

export default refundApi;
