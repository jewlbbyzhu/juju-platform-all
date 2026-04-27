import { vipApi } from '../../src/api/vip';
import { vipStatsApi } from '../../src/api/vipStats';
import api from '../../src/api/index';

// Mock api
jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('vipApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVipPackages', () => {
    it('should get VIP packages successfully', async () => {
      const mockPackages = {
        success: true,
        code: 200,
        message: '获取成功',
        data: [
          { id: '1', name: '月度会员', price: 29.9, duration: 30 },
          { id: '2', name: '年度会员', price: 299, duration: 365 },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockPackages);

      const result = await vipApi.getVipPackages();

      expect(api.get).toHaveBeenCalledWith('/vip/packages');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should handle empty packages', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        success: true,
        code: 200,
        data: [],
      });

      const result = await vipApi.getVipPackages();

      expect(result.data).toEqual([]);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to VIP package successfully', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '订阅成功',
        data: { orderId: 'ORDER001', status: 'pending' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.subscribe('pkg1', { paymentMethod: 'wechat' });

      expect(api.post).toHaveBeenCalledWith('/vip/subscribe', {
        packageId: 'pkg1',
        paymentMethod: 'wechat',
      });
      expect(result.success).toBe(true);
    });

    it('should subscribe with coupon code', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        success: true,
        code: 200,
        data: { orderId: 'ORDER002' },
      });

      await vipApi.subscribe('pkg2', { paymentMethod: 'alipay', couponCode: 'SAVE10' });

      expect(api.post).toHaveBeenCalledWith('/vip/subscribe', {
        packageId: 'pkg2',
        paymentMethod: 'alipay',
        couponCode: 'SAVE10',
      });
    });

    it('should handle subscription failure', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(vipApi.subscribe('pkg1', {})).rejects.toThrow('Network Error');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should get subscription status successfully', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        data: {
          isVip: true,
          level: 2,
          expireDate: '2025-12-31',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getSubscriptionStatus();

      expect(api.get).toHaveBeenCalledWith('/vip/status');
      expect(result.data.isVip).toBe(true);
    });

    it('should handle non-vip user', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { isVip: false, level: 0 },
      });

      const result = await vipApi.getSubscriptionStatus();

      expect(result.data.isVip).toBe(false);
    });
  });

  describe('getSubscriptionHistory', () => {
    it('should get subscription history', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', packageName: '月度会员', amount: 29.9, date: '2025-01-01' },
          { id: '2', packageName: '年度会员', amount: 299, date: '2025-02-01' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getSubscriptionHistory();

      expect(api.get).toHaveBeenCalledWith('/vip/history', { params: undefined });
      expect(result.data).toHaveLength(2);
    });

    it('should get history with pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: [] });

      await vipApi.getSubscriptionHistory({ page: 1, pageSize: 10 });

      expect(api.get).toHaveBeenCalledWith('/vip/history', { params: { page: 1, pageSize: 10 } });
    });
  });

  describe('renewSubscription', () => {
    it('should renew subscription successfully', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '续费成功',
        data: { newExpireDate: '2026-12-31' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.renewSubscription('pkg1', { paymentMethod: 'wechat' });

      expect(api.post).toHaveBeenCalledWith('/vip/renew', {
        packageId: 'pkg1',
        paymentMethod: 'wechat',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '取消订阅成功',
        data: null,
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.cancelSubscription({ reason: '不再需要' });

      expect(api.post).toHaveBeenCalledWith('/vip/cancel', { reason: '不再需要' });
      expect(result.success).toBe(true);
    });

    it('should cancel without reason', async () => {
      (api.post as jest.Mock).mockResolvedValue({ success: true, data: null });

      await vipApi.cancelSubscription({});

      expect(api.post).toHaveBeenCalledWith('/vip/cancel', {});
    });
  });

  describe('getVipBenefits', () => {
    it('should get VIP benefits', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', name: '优先购票', description: '提前24小时购票' },
          { id: '2', name: '专属折扣', description: '全场9折优惠' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getVipBenefits();

      expect(api.get).toHaveBeenCalledWith('/vip/benefits');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getVipEvents', () => {
    it('should get VIP exclusive events', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', title: 'VIP专属派对', date: '2025-04-01' },
          { id: '2', title: '会员答谢会', date: '2025-05-01' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await vipApi.getVipEvents();

      expect(api.get).toHaveBeenCalledWith('/vip/events', { params: undefined });
    });

    it('should get events with pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: [] });

      await vipApi.getVipEvents({ page: 2, pageSize: 5 });

      expect(api.get).toHaveBeenCalledWith('/vip/events', { params: { page: 2, pageSize: 5 } });
    });
  });

  describe('joinVipEvent', () => {
    it('should join VIP event successfully', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '报名成功',
        data: { ticketId: 'TICKET001' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.joinVipEvent('event1');

      expect(api.post).toHaveBeenCalledWith('/vip/events/event1/join');
      expect(result.success).toBe(true);
    });

    it('should handle event full error', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '活动名额已满' } },
      });

      await expect(vipApi.joinVipEvent('event1')).rejects.toBeDefined();
    });
  });

  describe('getVipLevels', () => {
    it('should get all VIP levels', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', name: '普通会员', pointsRequired: 0 },
          { id: '2', name: '银卡会员', pointsRequired: 1000 },
          { id: '3', name: '金卡会员', pointsRequired: 5000 },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getVipLevels();

      expect(api.get).toHaveBeenCalledWith('/vip/levels');
      expect(result.data).toHaveLength(3);
    });
  });

  describe('getVipLevelDetail', () => {
    it('should get VIP level detail', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '2',
          name: '银卡会员',
          pointsRequired: 1000,
          benefits: ['优先客服', '生日礼券'],
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getVipLevelDetail('2');

      expect(api.get).toHaveBeenCalledWith('/vip/levels/2');
      expect(result.data.name).toBe('银卡会员');
    });
  });

  describe('upgradeVipLevel', () => {
    it('should upgrade VIP level', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '升级成功',
        data: { newLevel: '3', pointsUsed: 5000 },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.upgradeVipLevel('3', { points: 5000 });

      expect(api.post).toHaveBeenCalledWith('/vip/levels/3/upgrade', { points: 5000 });
      expect(result.success).toBe(true);
    });
  });

  describe('getVipPoints', () => {
    it('should get VIP points', async () => {
      const mockResponse = {
        success: true,
        data: { total: 1500, available: 1200, frozen: 300 },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getVipPoints();

      expect(api.get).toHaveBeenCalledWith('/vip/points');
      expect(result.data.total).toBe(1500);
    });
  });

  describe('getVipPointsHistory', () => {
    it('should get points history', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', type: 'earn', amount: 100, description: '签到奖励' },
          { id: '2', type: 'spend', amount: -50, description: '兑换优惠券' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await vipApi.getVipPointsHistory();

      expect(api.get).toHaveBeenCalledWith('/vip/points-history', { params: undefined });
    });

    it('should get history with pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({ success: true, data: [] });

      await vipApi.getVipPointsHistory({ page: 1, pageSize: 20 });

      expect(api.get).toHaveBeenCalledWith('/vip/points-history', { params: { page: 1, pageSize: 20 } });
    });
  });

  describe('getVipRewards', () => {
    it('should get available rewards', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', name: '10元优惠券', pointsCost: 100 },
          { id: '2', name: '免费门票', pointsCost: 500 },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getVipRewards();

      expect(api.get).toHaveBeenCalledWith('/vip/rewards');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('redeemPoints', () => {
    it('should redeem points for reward', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '兑换成功',
        data: { rewardCode: 'CODE123' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.redeemPoints('reward1');

      expect(api.post).toHaveBeenCalledWith('/vip/rewards/reward1/redeem');
      expect(result.success).toBe(true);
    });

    it('should handle insufficient points', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '积分不足' } },
      });

      await expect(vipApi.redeemPoints('reward1')).rejects.toBeDefined();
    });
  });

  describe('getVipCoupons', () => {
    it('should get VIP coupons', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', code: 'VIP10', discount: 10, expireDate: '2025-12-31' },
          { id: '2', code: 'VIP20', discount: 20, expireDate: '2025-11-30' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await vipApi.getVipCoupons();

      expect(api.get).toHaveBeenCalledWith('/vip/coupons');
      expect(result.data).toHaveLength(2);
    });
  });
});

describe('vipStatsApi import', () => {
  it('vipStatsApi should be imported from vipStats module', () => {
    // vipStatsApi is imported from ../api/vipStats
    expect(typeof vipStatsApi).toBe('object');
    expect(vipStatsApi).toHaveProperty('getVipStats');
    expect(vipStatsApi).toHaveProperty('getVipStatsOverview');
  });
});
