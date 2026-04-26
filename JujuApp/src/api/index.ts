// API 统一入口
// 所有 API 模块从这里导出，统一使用 apiClient.ts 中的 axios 实例

import apiClient from './apiClient';
import { mockApi } from './mockApi';
import { ApiResponse, PageResponse, Party, Order, LoginData, UserProfile, Wallet, Ticket } from '../types/api';

// 离线模式开关 - 后端不可达时设置为 true 使用 Mock 数据
export const OFFLINE_MODE = false;

interface PartyParams {
  page?: number;
  pageSize?: number;
  category?: string;
  location?: string;
}

interface PartyData {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  [key: string]: unknown;
}

interface OrderData {
  party_id: string;
  ticket_id?: string;
  quantity: number;
  name?: string;
  phone?: string;
  gender?: number;
  remark?: string;
  [key: string]: unknown;
}

interface PayData {
  paymentMethod: string;
  [key: string]: unknown;
}

interface AuthData {
  phone?: string;
  code?: string;
  [key: string]: unknown;
}

interface ProfileData {
  nickname?: string;
  avatar?: string;
  bio?: string;
  [key: string]: unknown;
}

export const partyApi = {
  getParties: (params?: PartyParams): Promise<PageResponse<Party>> =>
    OFFLINE_MODE ? mockApi.getParties(params) : apiClient.get("/parties", { params }),
  getPartyDetail: (id: string): Promise<ApiResponse<Party>> =>
    OFFLINE_MODE ? mockApi.getPartyDetail(id) : apiClient.get(`/parties/${id}`),
  createParty: (data: PartyData): Promise<ApiResponse<Party>> => apiClient.post("/parties", data),
  getTickets: (partyId: string): Promise<ApiResponse<Ticket[]>> => apiClient.get(`/parties/${partyId}/tickets`),
  getMyParties: (params?: PartyParams): Promise<PageResponse<Party>> =>
    OFFLINE_MODE ? mockApi.getParties(params) : apiClient.get("/parties/my", { params }),
  getParticipatedParties: (params?: PartyParams): Promise<PageResponse<Party>> => apiClient.get("/parties/participated", { params }),
  submitReview: (data: { partyId: string; rating: number; content: string; tags?: string[] }): Promise<ApiResponse<unknown>> => apiClient.post("/parties/reviews", data),
};

export const orderApi = {
  createOrder: (data: OrderData): Promise<ApiResponse<Order>> => apiClient.post("/orders", data),
  getOrders: (): Promise<PageResponse<Order>> =>
    OFFLINE_MODE ? mockApi.getOrders() : apiClient.get("/orders"),
  getOrderDetail: (id: string): Promise<ApiResponse<Order>> =>
    OFFLINE_MODE ? mockApi.getOrderDetail(id) : apiClient.get(`/orders/${id}`),
  payOrder: (id: string, data: PayData): Promise<ApiResponse<Order>> => apiClient.post(`/orders/${id}/pay`, data),
};

export const userApi = {
  login: (data: AuthData): Promise<ApiResponse<LoginData>> =>
    OFFLINE_MODE ? mockApi.login(data) : apiClient.post("/auth/login", data),
  register: (data: AuthData): Promise<ApiResponse<LoginData>> => apiClient.post("/auth/register", data),
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    OFFLINE_MODE ? mockApi.getUserProfile() : apiClient.get("/users/profile"),
  updateProfile: (data: ProfileData): Promise<ApiResponse<UserProfile>> =>
    OFFLINE_MODE ? mockApi.updateProfile(data) : apiClient.put("/users/profile", data),
  getWallet: (): Promise<ApiResponse<Wallet>> =>
    OFFLINE_MODE ? mockApi.getWallet() : apiClient.get("/users/wallet"),
  getMyTickets: (): Promise<ApiResponse<Ticket[]>> =>
    OFFLINE_MODE ? mockApi.getTickets() : apiClient.get("/users/tickets"),
};

// 统一导出各模块 API
export { contentApi } from "./content";
export { favoriteApi } from "./favorites";
export { recommendationApi } from "./recommendation";
export { socialApi } from "./social";
export { tagApi } from "./tag";
export { groupChatApi } from "./group-chat";
export { chatApi } from "./chat";
export { profileApi } from "./profile";
export { vipApi } from './vip';
export { vipStatsApi } from './vipStats';
export { authApi } from './auth';
export { walletApi } from './wallet';
export { scanApi } from './scan';
export { refundApi } from './refund';
export { bankcardsApi } from './bankcards';
export { notificationApi } from './notification';
export { messageApi } from './message';
export { mapApi } from './map';
export { inviteApi } from './invite';
export { followApi } from './follow';
export { pushApi } from './push';
export { ticketApi } from './ticket';
export { ticketStatsApi } from './ticket-stats';

// 导出独立的 order/party/user API（它们不依赖 mock 逻辑）
export { orderApi as orderApiRaw, paymentApi } from './order';
export { partyApi as partyApiRaw } from './party';
export { default as partyApiModule } from './party';
export { default as orderApiModule } from './order';
export { userApi as userApiRaw, default as userApiModule } from './user';

// 导出统一的 API 客户端（供需要直接使用 axios 的地方使用）
export { default as api } from './apiClient';
export { default } from './apiClient';
export type { ApiResponse, PageResponse };
