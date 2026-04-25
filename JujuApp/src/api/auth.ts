import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types/api';
import type { LoginData, UserProfile } from '../types/api';

// 重新导出类型
export type { LoginData, UserProfile };

export const authApi = {
  // 微信登录 (code)
  async login(code: string): Promise<ApiResponse<LoginData>> {
    const response = await apiClient.post<LoginData>('/auth/login', { code });
    if (response.data?.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  // 手机号登录
  async phoneLogin(phone: string, verifyCode: string): Promise<ApiResponse<LoginData>> {
    const response = await apiClient.post<LoginData>('/auth/phone-login', { phone, code: verifyCode });
    if (response.data?.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  // 发送验证码
  async sendVerifyCode(phone: string): Promise<ApiResponse<null>> {
    return await apiClient.post<null>('/auth/verify-code', { phone });
  },

  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<{ userInfo: UserProfile; vipInfo: unknown; statistics: unknown }>> {
    return await apiClient.get<{ userInfo: UserProfile; vipInfo: unknown; statistics: unknown }>('/users/profile');
  },

  // 更新用户资料
  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return await apiClient.put<UserProfile>('/users/profile', data);
  },

  // 退出登录
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
  },

  // 检查登录状态
  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};

export default authApi;
