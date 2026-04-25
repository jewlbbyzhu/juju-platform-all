import { userApi, UserInfo } from '../../src/api/user';
import apiClient from '../../src/api/apiClient';

// Mock apiClient
jest.mock('../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('userApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    it('should get user info by id successfully', async () => {
      const mockUser = {
        id: 1,
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
        phone: '13800138000',
        gender: 1,
        birthday: '1990-01-01',
        bio: '这是我的简介',
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await userApi.getUserInfo(1);

      expect(apiClient.get).toHaveBeenCalledWith('/users/1');
      expect(result.data).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: '用户不存在' } },
      });

      await expect(userApi.getUserInfo(999)).rejects.toBeDefined();
    });

    it('should handle network error', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(userApi.getUserInfo(1)).rejects.toThrow('Network Error');
    });
  });

  describe('updateUserInfo', () => {
    it('should update user info successfully', async () => {
      const updateData: Partial<UserInfo> = {
        nickname: '新昵称',
        bio: '更新后的简介',
        gender: 2,
      };
      const mockResponse = {
        id: 1,
        nickname: '新昵称',
        avatar: 'https://example.com/avatar.jpg',
        bio: '更新后的简介',
        gender: 2,
      };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await userApi.updateUserInfo(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result.data).toEqual(mockResponse);
    });

    it('should update partial fields', async () => {
      const updateData = { nickname: '仅更新昵称' };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: { ...updateData, id: 1 } });

      await userApi.updateUserInfo(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', updateData);
    });
  });

  describe('getBlockedUsers', () => {
    it('should get blocked users list', async () => {
      const mockBlockedUsers = [
        { id: 2, nickname: '用户A', avatar: 'avatar1.jpg', blockedAt: '2025-01-01' },
        { id: 3, nickname: '用户B', avatar: 'avatar2.jpg', blockedAt: '2025-01-02' },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBlockedUsers });

      const result = await userApi.getBlockedUsers();

      expect(apiClient.get).toHaveBeenCalledWith('/users/blocked', { params: undefined });
      expect(result.data).toEqual(mockBlockedUsers);
    });

    it('should get blocked users with pagination', async () => {
      const mockBlockedUsers = [
        { id: 2, nickname: '用户A', avatar: 'avatar1.jpg', blockedAt: '2025-01-01' },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBlockedUsers });

      await userApi.getBlockedUsers({ page: 1, pageSize: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/users/blocked', { params: { page: 1, pageSize: 10 } });
    });

    it('should return empty array when no blocked users', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await userApi.getBlockedUsers();

      expect(result.data).toEqual([]);
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      const mockResponse = { success: true, message: '拉黑成功' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await userApi.blockUser(2);

      expect(apiClient.post).toHaveBeenCalledWith('/users/2/block');
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle block self error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '不能拉黑自己' } },
      });

      await expect(userApi.blockUser(1)).rejects.toBeDefined();
    });

    it('should handle already blocked error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 409, data: { message: '已经拉黑该用户' } },
      });

      await expect(userApi.blockUser(2)).rejects.toBeDefined();
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      const mockResponse = { success: true, message: '取消拉黑成功' };
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await userApi.unblockUser(2);

      expect(apiClient.delete).toHaveBeenCalledWith('/users/2/block');
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle unblock not blocked user', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: '该用户不在黑名单中' } },
      });

      await expect(userApi.unblockUser(2)).rejects.toBeDefined();
    });
  });

  describe('searchUsers', () => {
    it('should search users by keyword', async () => {
      const mockUsers = [
        { id: 2, nickname: '张三', avatar: 'avatar1.jpg' },
        { id: 3, nickname: '张三丰', avatar: 'avatar2.jpg' },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const result = await userApi.searchUsers('张');

      expect(apiClient.get).toHaveBeenCalledWith('/users/search', { params: { keyword: '张' } });
      expect(result.data).toEqual(mockUsers);
    });

    it('should search users with pagination', async () => {
      const mockUsers = [{ id: 2, nickname: '张三', avatar: 'avatar1.jpg' }];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      await userApi.searchUsers('张', { page: 1, pageSize: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/users/search', {
        params: { keyword: '张', page: 1, pageSize: 10 },
      });
    });

    it('should return empty array when no matches', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await userApi.searchUsers('不存在的用户');

      expect(result.data).toEqual([]);
    });

    it('should handle empty keyword', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      await userApi.searchUsers('');

      expect(apiClient.get).toHaveBeenCalledWith('/users/search', { params: { keyword: '' } });
    });
  });

  describe('getUserStatistics', () => {
    it('should get user statistics successfully', async () => {
      const mockStats = {
        partyCount: 10,
        orderCount: 5,
        spentAmount: 1000,
        joinedParties: 8,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await userApi.getUserStatistics(1);

      expect(apiClient.get).toHaveBeenCalledWith('/users/1/statistics');
      expect(result.data).toEqual(mockStats);
    });

    it('should get statistics for different user', async () => {
      const mockStats = { partyCount: 0, orderCount: 0 };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      await userApi.getUserStatistics(99);

      expect(apiClient.get).toHaveBeenCalledWith('/users/99/statistics');
    });
  });
});
