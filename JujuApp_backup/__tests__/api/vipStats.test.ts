import { vipStatsApi } from '../../src/api/vipStats';
import api from '../../src/api/index';

// Mock api
jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('vipStatsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVipStats', () => {
    it('should get VIP stats successfully', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '获取成功',
        data: {
          totalUsers: 1000,
          vipUsers: 200,
          conversionRate: 0.2,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipStatsApi.getVipStats();

      expect(api.get).toHaveBeenCalledWith('/analytics/users', { params: undefined });
      expect(result.success).toBe(true);
    });

    it('should get VIP stats with params', async () => {
      const mockResponse = { success: true, data: {} };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = { period: 'monthly', startDate: '2025-01-01', endDate: '2025-03-31' };
      await vipStatsApi.getVipStats(params);

      expect(api.get).toHaveBeenCalledWith('/analytics/users', { params });
    });
  });

  describe('getVipStatsOverview', () => {
    it('should get VIP stats overview', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalMembers: 500,
          activeMembers: 350,
          churnRate: 0.05,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipStatsApi.getVipStatsOverview();

      expect(api.get).toHaveBeenCalledWith('/analytics/users', { params: undefined });
      expect(result.data.totalMembers).toBe(500);
    });
  });

  describe('getVipGrowthTrend', () => {
    it('should get VIP growth trend', async () => {
      const mockResponse = {
        success: true,
        data: [
          { date: '2025-01', newMembers: 50, totalMembers: 150 },
          { date: '2025-02', newMembers: 60, totalMembers: 210 },
          { date: '2025-03', newMembers: 70, totalMembers: 280 },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = { startDate: '2025-01-01', endDate: '2025-03-31' };
      const result = await vipStatsApi.getVipGrowthTrend(params);

      expect(api.get).toHaveBeenCalledWith('/analytics/users/range', { params });
      expect(result.data).toHaveLength(3);
    });

    it('should get growth trend without params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: [] });

      await vipStatsApi.getVipGrowthTrend();

      expect(api.get).toHaveBeenCalledWith('/analytics/users/range', { params: undefined });
    });
  });

  describe('getVipLevelDistribution', () => {
    it('should get VIP level distribution', async () => {
      const mockResponse = {
        success: true,
        data: {
          level1: 100,
          level2: 80,
          level3: 50,
          level4: 30,
          level5: 20,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipStatsApi.getVipLevelDistribution();

      expect(api.get).toHaveBeenCalledWith('/analytics/users', { params: undefined });
      expect(result.data.level1).toBe(100);
    });
  });

  describe('getVipRevenueStats', () => {
    it('should get VIP revenue stats', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalRevenue: 50000,
          monthlyRevenue: 15000,
          arpu: 250,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = { period: 'monthly' };
      const result = await vipStatsApi.getVipRevenueStats(params);

      expect(api.get).toHaveBeenCalledWith('/analytics/revenue', { params });
      expect(result.data.totalRevenue).toBe(50000);
    });

    it('should get revenue stats without params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: {} });

      await vipStatsApi.getVipRevenueStats();

      expect(api.get).toHaveBeenCalledWith('/analytics/revenue', { params: undefined });
    });
  });

  describe('getVipActivityStats', () => {
    it('should get VIP activity stats', async () => {
      const mockResponse = {
        success: true,
        data: {
          activeUsers: 300,
          participationRate: 0.75,
          avgEventsPerUser: 2.5,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await vipStatsApi.getVipActivityStats();

      expect(api.get).toHaveBeenCalledWith('/analytics/users', { params: undefined });
    });
  });

  describe('getVipRetentionStats', () => {
    it('should get VIP retention stats', async () => {
      const mockResponse = {
        success: true,
        data: {
          day1Retention: 0.85,
          day7Retention: 0.65,
          day30Retention: 0.45,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipStatsApi.getVipRetentionStats();

      expect(api.get).toHaveBeenCalledWith('/analytics/users/compare', { params: undefined });
      expect(result.data.day1Retention).toBe(0.85);
    });

    it('should get retention stats with date range', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: {} });

      const params = { startDate: '2025-01-01', endDate: '2025-03-31' };
      await vipStatsApi.getVipRetentionStats(params);

      expect(api.get).toHaveBeenCalledWith('/analytics/users/compare', { params });
    });
  });

  describe('getVipConversionStats', () => {
    it('should get VIP conversion stats', async () => {
      const mockResponse = {
        success: true,
        data: {
          visitorToFree: 0.3,
          freeToVip: 0.15,
          overallConversion: 0.045,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipStatsApi.getVipConversionStats();

      expect(api.get).toHaveBeenCalledWith('/analytics/overview', { params: undefined });
      expect(result.data.overallConversion).toBe(0.045);
    });
  });

  describe('exportVipStatsReport', () => {
    it('should export VIP stats report', async () => {
      const mockResponse = {
        success: true,
        data: {
          downloadUrl: 'https://example.com/report.xlsx',
          expiresAt: '2025-04-01T00:00:00',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = { period: 'quarterly', startDate: '2025-01-01' };
      const result = await vipStatsApi.exportVipStatsReport(params);

      expect(api.get).toHaveBeenCalledWith('/analytics/export', { params });
      expect(result.data.downloadUrl).toBe('https://example.com/report.xlsx');
    });

    it('should export report without params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: {} });

      await vipStatsApi.exportVipStatsReport();

      expect(api.get).toHaveBeenCalledWith('/analytics/export', { params: undefined });
    });
  });
});
