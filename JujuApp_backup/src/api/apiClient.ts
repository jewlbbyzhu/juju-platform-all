import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '../config';
import { ApiResponse } from '../types/api';

// 全局类型声明（React Native 环境）
declare const atob: ((encodedString: string) => string) | undefined;

// 重新导出ApiResponse类型
export type { ApiResponse };

// 自定义axios实例类型 - 响应拦截器已将数据转换为ApiResponse
type ApiInstance = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  (config: AxiosRequestConfig): Promise<ApiResponse<unknown>>;
};

// 创建 axios 实例
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求队列（用于Token刷新时的请求排队）
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: InternalAxiosRequestConfig | PromiseLike<InternalAxiosRequestConfig>) => void;
  reject: (reason?: Error) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (prom.config.headers) {
        prom.config.headers.Authorization = `Bearer ${token}`;
      }
      prom.resolve(axiosClient(prom.config));
    }
  });
  failedQueue = [];
};

// JWT 解码 - React Native 兼容
const decodeJWT = (token: string): { exp?: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    
    // Base64Url 转 Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // 使用 atob 或自定义 Base64 解码
    let decoded: string;
    if (typeof atob !== 'undefined') {
      // 浏览器/React Native 环境
      decoded = atob(base64);
    } else {
      // 自定义 Base64 解码（纯 JavaScript）
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      let i = 0;
      const input = base64.replace(/[^A-Za-z0-9+/]/g, '');
      while (i < input.length) {
        const enc1 = chars.indexOf(input.charAt(i++));
        const enc2 = chars.indexOf(input.charAt(i++));
        const enc3 = chars.indexOf(input.charAt(i++));
        const enc4 = chars.indexOf(input.charAt(i++));
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        result += String.fromCharCode(chr1);
        if (enc3 !== 64) result += String.fromCharCode(chr2);
        if (enc4 !== 64) result += String.fromCharCode(chr3);
      }
      decoded = result;
    }
    
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

// 检查 Token 是否过期
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
};

// 刷新 Token (注意：refresh 端点使用相对于 baseURL 的路径)
const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = await AsyncStorage.getItem('refreshToken');
  if (!refreshTokenValue) {
    throw new Error('No refresh token');
  }
  
  // 使用 config 中的 API_BASE_URL 避免硬编码
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken: refreshTokenValue,
  });
  
  if (response.data?.data?.token) {
    await AsyncStorage.setItem('token', response.data.data.token);
    return response.data.data.token;
  }
  throw new Error('Refresh failed');
};

// 请求拦截器
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      // 检查 token 是否过期（排除刷新 token 的请求）
      if (isTokenExpired(token) && !config.url?.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshToken();
            config.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
          } catch (error) {
            processQueue(error, null);
            // 刷新失败，清除 token 并跳转登录
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refreshToken');
            throw error;
          } finally {
            isRefreshing = false;
          }
        } else {
          // 等待刷新完成
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config });
          });
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 401 错误处理
    if (error.response?.status === 401 && originalRequest) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
    }
    
    // 统一错误处理
    const errorData = error.response?.data as { message?: string; code?: number };
    const errorMessage = errorData?.message || error.message || '请求失败';
    if (__DEV__) {
      console.error('API Error:', errorMessage);
    } else {
      console.error('API Error:', errorData?.code || error.response?.status || 'UNKNOWN');
    }
    
    return Promise.reject({
      success: false,
      message: errorMessage,
      code: errorData?.code || error.response?.status || 500,
    });
  }
);

// 导出类型化的API客户端
const apiClient = axiosClient as unknown as ApiInstance;
export default apiClient;
