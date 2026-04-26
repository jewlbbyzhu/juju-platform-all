import api from './index';
import { ApiResponse, PageResponse } from '../types/api';

export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  party_id: number;
  ticket_type_id: number;
  name: string;
  phone: string;
  gender: number;
  remark: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  discount_amount: number;
  actual_amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  payment_method?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  party?: {
    id: number;
    title: string;
    cover_image: string;
    start_time: string;
    address: string;
  };
  ticket?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface CreateOrderParams {
  party_id: number;
  ticket_id: number;
  name: string;
  phone: string;
  gender: number;
  remark?: string;
  quantity?: number;
}

export interface OrderParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const orderApi = {
  getOrders: (params: { page?: number; pageSize?: number; status?: string } = {}): Promise<PageResponse<Order>> => api.get('/orders', { params }),
  getOrderDetail: (id: number | string): Promise<ApiResponse<Order>> => api.get(`/orders/${id}`),
  createOrder: (data: CreateOrderParams): Promise<ApiResponse<Order>> => api.post('/orders', data),
  cancelOrder: (id: number | string): Promise<ApiResponse<void>> => api.post(`/orders/${id}/cancel`),
  createPayment: (orderId: number | string, data: { paymentMethod: string; [key: string]: unknown }): Promise<ApiResponse<unknown>> => api.post(`/orders/${orderId}/pay`, data),
  queryPaymentStatus: (orderId: number | string): Promise<ApiResponse<{ status: string; paidAt?: string }>> => api.get(`/orders/${orderId}/payment-status`),
  applyRefund: (orderId: number | string, reason: string): Promise<ApiResponse<unknown>> => api.post(`/orders/${orderId}/refund`, { reason }),
  getOrderStats: (): Promise<ApiResponse<{ totalOrders: number; totalAmount: number; pendingCount: number }>> => api.get('/orders/stats'),
  getOrderTickets: (orderId: number | string): Promise<ApiResponse<unknown[]>> => api.get(`/orders/${orderId}/tickets`),
};

export const paymentApi = {
  getPaymentMethods: (): Promise<ApiResponse<{ id: string; name: string; icon: string; enabled: boolean }[]>> => api.get('/payments/methods'),
  createPayment: (orderId: number | string, data: { paymentMethod: string; [key: string]: unknown }): Promise<ApiResponse<unknown>> => api.post('/payments', { order_id: orderId, ...data }),
  queryPayment: (paymentId: string): Promise<ApiResponse<{ status: string; amount: number; paidAt?: string }>> => api.get(`/payments/${paymentId}`),
};

export default orderApi;
