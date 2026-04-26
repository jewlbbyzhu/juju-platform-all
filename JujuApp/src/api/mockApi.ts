// Mock API - 离线模式数据
import {
  mockParties,
  mockUserProfile,
  mockUserStats,
  mockOrders,
  mockTickets,
  mockWallet,
  mockPosts,
  mockNotifications,
  mockVipInfo,
} from './mockData';
import { ApiResponse, PageResponse } from '../types/api';

// 模拟延迟
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// 离线模式标志
export const OFFLINE_MODE = false;

// Mock API对象
export const mockApi = {
  // 聚会相关
  getParties: async (params?: any): Promise<PageResponse<any>> => {
    await delay(500);
    let result = [...mockParties];
    if (params?.category && params.category !== 'all') {
      result = result.filter(p => p.category === params.category);
    }
    return {
      code: 0,
      success: true,
      data: {
        list: result,
        total: result.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
      message: 'success',
    };
  },

  getPartyDetail: async (id: string): Promise<ApiResponse<any>> => {
    await delay(300);
    const party = mockParties.find(p => String(p.id) === id) || mockParties[0];
    return { code: 0, success: true, data: party, message: 'success' };
  },

  // 用户相关
  getUserProfile: async (): Promise<ApiResponse<any>> => {
    await delay(300);
    return { code: 0, success: true, data: mockUserProfile, message: 'success' };
  },

  getUserStatistics: async (): Promise<ApiResponse<any>> => {
    await delay(200);
    return { code: 0, success: true, data: mockUserStats, message: 'success' };
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    await delay(500);
    return { code: 0, success: true, data: { ...mockUserProfile, ...data }, message: 'success' };
  },

  // 订单相关
  getOrders: async (): Promise<PageResponse<any>> => {
    await delay(400);
    return {
      code: 0,
      success: true,
      data: { list: mockOrders, total: mockOrders.length, page: 1, pageSize: 10 },
      message: 'success',
    };
  },

  getOrderDetail: async (id: string): Promise<ApiResponse<any>> => {
    await delay(300);
    const order = mockOrders.find(o => String(o.id) === id) || mockOrders[0];
    return { code: 0, success: true, data: order, message: 'success' };
  },

  // 票券相关
  getTickets: async (): Promise<ApiResponse<any>> => {
    await delay(300);
    return { code: 0, success: true, data: mockTickets, message: 'success' };
  },

  // 钱包相关
  getWallet: async (): Promise<ApiResponse<any>> => {
    await delay(300);
    return { code: 0, success: true, data: mockWallet, message: 'success' };
  },

  // 社交相关
  getFeed: async (_params?: any): Promise<PageResponse<any>> => {
    await delay(600);
    return {
      code: 0,
      success: true,
      data: { list: mockPosts, total: mockPosts.length, page: 1, pageSize: 10 },
      message: 'success',
    };
  },

  likePost: async (_postId: string): Promise<ApiResponse<any>> => {
    await delay(200);
    return { code: 0, success: true, data: null, message: 'success' };
  },

  unlikePost: async (_postId: string): Promise<ApiResponse<any>> => {
    await delay(200);
    return { code: 0, success: true, data: null, message: 'success' };
  },

  // 通知相关
  getNotifications: async (): Promise<PageResponse<any>> => {
    await delay(400);
    return {
      code: 0,
      success: true,
      data: { list: mockNotifications, total: mockNotifications.length, page: 1, pageSize: 10 },
      message: 'success',
    };
  },

  // VIP相关
  getVipInfo: async (): Promise<ApiResponse<any>> => {
    await delay(300);
    return { code: 0, success: true, data: mockVipInfo, message: 'success' };
  },

  // 登录相关
  login: async (_data: any): Promise<ApiResponse<any>> => {
    await delay(800);
    return {
      code: 0,
      success: true,
      data: {
        token: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-token',
        userInfo: mockUserProfile,
      },
      message: '登录成功',
    };
  },

  sendVerifyCode: async (_phone: string): Promise<ApiResponse<any>> => {
    await delay(500);
    return { code: 0, success: true, data: null, message: '验证码已发送' };
  },
};
