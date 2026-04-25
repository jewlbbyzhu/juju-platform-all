import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { partyApi } from '../api/party';
import { orderApi } from '../api/order';
import { PageData } from '../types/api';

interface AppContextType {
  user: unknown;
  setUser: (user: unknown) => void;
  loading: boolean;
  fetchParties: (params?: Record<string, unknown>) => Promise<unknown[]>;
  fetchPartyDetail: (id: string | number) => Promise<unknown | null>;
  createOrder: (orderData: unknown) => Promise<unknown | null>;
  payOrder: (orderId: string | number) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  // 获取聚会列表
  const fetchParties = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await partyApi.getParties(params) as unknown as { code?: number; data?: PageData<unknown> };
      return res.code === 0 ? res.data?.list || [] : [];
    } catch (error) {
      console.error("初始化应用失败:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取聚会详情
  const fetchPartyDetail = useCallback(async (id: string | number) => {
    try {
      const res = await partyApi.getPartyDetail(id) as { code?: number; data?: unknown };
      return res.code === 0 ? res.data : null;
    } catch (error) {
      console.error("初始化应用失败:", error);
      return null;
    }
  }, []);

  // 创建订单
  const createOrder = useCallback(async (orderData: unknown) => {
    try {
      const res = await orderApi.createOrder(orderData as any) as { code?: number; data?: unknown };
      return res.code === 0 ? res.data : null;
    } catch (error) {
      console.error("初始化应用失败:", error);
      return null;
    }
  }, []);

  // 支付订单
  const payOrder = useCallback(async (orderId: string | number) => {
    try {
      const res = await orderApi.createPayment(orderId, { paymentMethod: 'wechat' }) as { code?: number };
      return res.code === 0;
    } catch (error) {
      console.error("初始化应用失败:", error);
      return false;
    }
  }, []);

  const value = {
    user,
    setUser,
    loading,
    fetchParties,
    fetchPartyDetail,
    createOrder,
    payOrder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
