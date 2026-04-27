import { authApi } from '../../src/api/auth';
import apiClient from '../../src/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock apiClient
jest.mock('../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockLoginResponse = {
      code: 0,
      data: {
        token: 'mock_token_123',
        refreshToken: 'mock_refresh_token_456',
        userInfo: {
          id: 1,
          nickname: '测试用户',
          avatar: 'https://example.com/avatar.jpg',
          phone: '13800138000',
        },
      },
    };

    it('should login with wechat code successfully', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await authApi.login('wechat_code_123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { code: 'wechat_code_123' });
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle login failure', async () => {
      const errorResponse = {
        code: 401,
        message: '登录失败',
        data: null,
      };
      (apiClient.post as jest.Mock).mockResolvedValue(errorResponse);

      const result = await authApi.login('invalid_code');

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(errorResponse);
    });

    it('should handle network error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(authApi.login('code')).rejects.toThrow('Network Error');
    });
  });

  describe('phoneLogin', () => {
    const mockPhoneLoginResponse = {
      code: 0,
      data: {
        token: 'phone_token_123',
        refreshToken: 'phone_refresh_token_456',
        userInfo: {
          id: 2,
          nickname: '手机用户',
          avatar: 'https://example.com/phone_avatar.jpg',
          phone: '13900139000',
        },
      },
    };

    it('should login with phone and verify code successfully', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockPhoneLoginResponse);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await authApi.phoneLogin('13900139000', '123456');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/phone-login', { phone: '13900139000', code: '123456' });
      expect(result).toEqual(mockPhoneLoginResponse);
    });

    it('should handle invalid verify code', async () => {
      const errorResponse = {
        code: 400,
        message: '验证码错误',
        data: null,
      };
      (apiClient.post as jest.Mock).mockResolvedValue(errorResponse);

      const result = await authApi.phoneLogin('13900139000', '000000');

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(errorResponse);
    });
  });

  describe('sendVerifyCode', () => {
    it('should send verify code successfully', async () => {
      const mockResponse = {
        code: 0,
        message: '验证码已发送',
        data: null,
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.sendVerifyCode('13800138000');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-code', { phone: '13800138000' });
      expect(result).toEqual(mockResponse);
    });

    it('should handle send verify code failure', async () => {
      const errorResponse = {
        code: 429,
        message: '发送过于频繁',
        data: null,
      };
      (apiClient.post as jest.Mock).mockResolvedValue(errorResponse);

      const result = await authApi.sendVerifyCode('13800138000');

      expect(result.code).toBe(429);
    });
  });

  describe('getUserInfo', () => {
    it('should get user info successfully', async () => {
      const mockResponse = {
        code: 0,
        message: '获取成功',
        data: {
          userInfo: {
            id: 1,
            nickname: '测试用户',
            avatar: 'https://example.com/avatar.jpg',
          },
          vipInfo: { level: 1 },
          statistics: { partyCount: 10 },
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getUserInfo();

      expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
      expect(result.code).toBe(0);
      expect(result.data.userInfo.id).toBe(1);
    });

    it('should handle get user info failure', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      await expect(authApi.getUserInfo()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        nickname: '新昵称',
        bio: '新简介',
      };
      const mockResponse = {
        code: 0,
        message: '更新成功',
        data: {
          id: 1,
          nickname: '新昵称',
          avatar: 'https://example.com/avatar.jpg',
          bio: '新简介',
        },
      };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.updateProfile(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result.code).toBe(0);
    });

    it('should handle update profile validation error', async () => {
      const errorResponse = {
        code: 400,
        message: '昵称不能为空',
        data: null,
      };
      (apiClient.put as jest.Mock).mockResolvedValue(errorResponse);

      const result = await authApi.updateProfile({ nickname: '' });

      expect(result.code).toBe(400);
      expect(result.message).toBe('昵称不能为空');
    });
  });

  describe('logout', () => {
    it('should clear tokens on logout', async () => {
      await authApi.logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid_token');

      const result = await authApi.isLoggedIn();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should return false when token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authApi.isLoggedIn();

      expect(result).toBe(false);
    });

    it('should return false when token is empty string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');

      const result = await authApi.isLoggedIn();

      expect(result).toBe(false);
    });
  });
});
