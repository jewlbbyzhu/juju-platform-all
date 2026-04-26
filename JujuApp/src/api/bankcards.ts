import api from './index';
import apiClient from './apiClient';
import { ApiResponse } from '../types/api';

export interface BankCard {
  id: number;
  bankName: string;
  cardNo: string;
  cardType: 'debit' | 'credit';
  isDefault: boolean;
  cardHolder?: string;
}

// 从 bankcard.ts 保留的 API (使用 api 实例)
export const bankcardApiLegacy = {
  getBankCards: () => api.get<ApiResponse<BankCard[]>>('/bankcards'),
  addBankCardLegacy: (data: { bankName: string; cardNumber: string; cardHolder: string; phone: string; branch?: string }) => api.post<ApiResponse<BankCard>>('/bankcards', data),
  deleteBankCardLegacy: (id: number) => api.delete<ApiResponse<void>>(`/bankcards/${id}`),
  setDefaultBankCardLegacy: (id: number) => api.put<ApiResponse<void>>(`/bankcards/${id}/default`),
};

// 从 bankcards.ts 保留的 API (使用 apiClient)
export const bankcardsApiV2 = {
  // 获取银行卡列表
  getBankCardList() {
    return apiClient.get<ApiResponse<BankCard[]>>('/bankcards');
  },

  // 添加银行卡
  addBankCard(data: {
    bankName: string;
    cardNo: string;
    cardType: 'debit' | 'credit';
    cardHolder: string;
    isDefault?: boolean;
    phone?: string;
  }) {
    // 字段映射：前端用 cardNo，后端期望 cardNumber
    const payload = {
      bankName: data.bankName,
      cardNumber: data.cardNo,
      cardType: data.cardType,
      cardHolder: data.cardHolder,
      phone: data.phone || '13800138000',
    };
    return apiClient.post<ApiResponse<BankCard>>('/bankcards', payload);
  },

  // 删除银行卡
  deleteBankCard(cardId: number) {
    return apiClient.delete<ApiResponse<void>>(`/bankcards/${cardId}`);
  },

  // 设置默认银行卡
  setDefaultCard(cardId: number) {
    return apiClient.put<ApiResponse<void>>(`/bankcards/${cardId}/default`);
  },

  // 获取支持的银行列表
  getSupportedBanks() {
    return apiClient.get<ApiResponse<{ name: string; code: string; icon?: string }[]>>('/bankcards/supported-banks');
  },
};

// 统一导出 - 优先使用新版本 API
export const bankcardsApi = {
  ...bankcardsApiV2,
  // 保留旧版 API 作为兼容
  getBankCardsLegacy: bankcardApiLegacy.getBankCards,
  addBankCardLegacy: bankcardApiLegacy.addBankCardLegacy,
  deleteBankCardLegacy: bankcardApiLegacy.deleteBankCardLegacy,
  setDefaultBankCardLegacy: bankcardApiLegacy.setDefaultBankCardLegacy,
};

export default bankcardsApi;
