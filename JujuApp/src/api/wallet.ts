import api from './index';
import { ApiResponse, PageResponse, Wallet, Transaction } from '../types/api';

export const walletApi = {
  getWalletInfo: () => api.get<ApiResponse<Wallet>>('/wallet/my'),
  recharge: (data: { amount: number; paymentMethod: string }) => api.post<ApiResponse<unknown>>('/wallet/recharge', data),
  withdraw: (data: { amount: number; bankCardId: number; paymentPassword: string }) => api.post<ApiResponse<unknown>>('/wallet/withdraw', data),
  getTransactions: (params?: { page?: number; pageSize?: number; type?: string }) => api.get<ApiResponse<PageResponse<Transaction>>>('/wallet/my/transactions', { params }),
  setPassword: (data: { password: string }) => api.post<ApiResponse<void>>('/wallet/password', data),
  updatePassword: (data: { old_password: string; new_password: string; confirm_password: string }) => api.put<ApiResponse<void>>('/wallet/password', data),
  verifyPassword: (data: { password: string }) => api.post<ApiResponse<boolean>>('/wallet/password/verify', data),
  transfer: (data: { toUserId: number; amount: number; paymentPassword: string; remark?: string }) => api.post<ApiResponse<unknown>>('/wallet/transfer', data),
};
export default walletApi;
