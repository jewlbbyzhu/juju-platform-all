import { inviteApi, InviteCode, InviteRecord } from '../../src/api/invite';
import apiClient from '../../src/api/apiClient';

jest.mock('../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('inviteApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyInviteCode', () => {
    it('should get my invite code', async () => {
      const mockCode: InviteCode = {
        code: 'ABC123',
        inviterId: 1,
        maxUses: 10,
        usedCount: 3,
        rewardAmount: 10,
        expiredAt: '2025-12-31',
        createdAt: '2025-01-01',
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockCode });

      const result = await inviteApi.getMyInviteCode();

      expect(apiClient.get).toHaveBeenCalledWith('/invite/code');
      expect(result.data).toEqual(mockCode);
    });

    it('should handle no invite code', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: '邀请码不存在' } },
      });

      await expect(inviteApi.getMyInviteCode()).rejects.toBeDefined();
    });
  });

  describe('generateInviteCode', () => {
    it('should generate new invite code', async () => {
      const mockCode: InviteCode = {
        code: 'NEW456',
        inviterId: 1,
        maxUses: 10,
        usedCount: 0,
        rewardAmount: 10,
        expiredAt: '2025-12-31',
        createdAt: '2025-03-15',
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockCode });

      const result = await inviteApi.generateInviteCode();

      expect(apiClient.post).toHaveBeenCalledWith('/invite/code');
      expect(result.data.code).toBe('NEW456');
    });

    it('should handle generation limit reached', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 429, data: { message: '邀请码生成次数已达上限' } },
      });

      await expect(inviteApi.generateInviteCode()).rejects.toBeDefined();
    });
  });

  describe('useInviteCode', () => {
    it('should use invite code successfully', async () => {
      const mockResponse = { data: { success: true, reward: 10 } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await inviteApi.useInviteCode('ABC123');

      expect(apiClient.post).toHaveBeenCalledWith('/invite/use', { code: 'ABC123' });
      expect(result.data.success).toBe(true);
    });

    it('should handle invalid code', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '无效的邀请码' } },
      });

      await expect(inviteApi.useInviteCode('INVALID')).rejects.toBeDefined();
    });

    it('should handle expired code', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '邀请码已过期' } },
      });

      await expect(inviteApi.useInviteCode('EXPIRED')).rejects.toBeDefined();
    });

    it('should handle already used code', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '该邀请码已达使用上限' } },
      });

      await expect(inviteApi.useInviteCode('FULL')).rejects.toBeDefined();
    });
  });

  describe('getInviteRecords', () => {
    it('should get invite records without params', async () => {
      const mockRecords: InviteRecord[] = [
        {
          id: 1,
          inviteeId: 2,
          inviteeNickname: 'User 2',
          inviteeAvatar: 'avatar.jpg',
          rewardAmount: 10,
          createdAt: '2025-03-01',
        },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecords });

      const result = await inviteApi.getInviteRecords();

      expect(apiClient.get).toHaveBeenCalledWith('/invite/records', { params: undefined });
      expect(result.data).toHaveLength(1);
    });

    it('should get invite records with pagination', async () => {
      const mockRecords: InviteRecord[] = [];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecords });

      await inviteApi.getInviteRecords({ page: 1, pageSize: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/invite/records', {
        params: { page: 1, pageSize: 10 },
      });
    });
  });

  describe('getInviteStatistics', () => {
    it('should get invite statistics', async () => {
      const mockStats = {
        totalInvited: 10,
        totalReward: 100,
        activeInvited: 8,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await inviteApi.getInviteStatistics();

      expect(apiClient.get).toHaveBeenCalledWith('/invite/statistics');
      expect(result.data.totalInvited).toBe(10);
    });

    it('should handle empty statistics', async () => {
      const mockStats = { totalInvited: 0, totalReward: 0, activeInvited: 0 };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await inviteApi.getInviteStatistics();

      expect(result.data.totalInvited).toBe(0);
    });
  });
});
