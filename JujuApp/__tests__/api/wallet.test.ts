import { walletApi } from '../../src/api/wallet';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('walletApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWalletInfo', () => {
    it('should get wallet info', async () => {
      const mockResponse = { data: { balance: 1000, frozen: 0 } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletApi.getWalletInfo();

      expect(api.get).toHaveBeenCalledWith('/wallet/my');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('recharge', () => {
    it('should recharge with wechat', async () => {
      const mockResponse = { data: { orderId: 'R001', status: 'pending' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { amount: 100, paymentMethod: 'wechat' };
      const result = await walletApi.recharge(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/recharge', data);
      expect(result).toEqual(mockResponse);
    });

    it('should recharge with alipay', async () => {
      const mockResponse = { data: { orderId: 'R002' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { amount: 200, paymentMethod: 'alipay' };
      await walletApi.recharge(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/recharge', data);
    });

    it('should handle invalid amount', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '充值金额无效' } },
      });

      await expect(walletApi.recharge({ amount: -10, paymentMethod: 'wechat' })).rejects.toBeDefined();
    });
  });

  describe('withdraw', () => {
    it('should withdraw successfully', async () => {
      const mockResponse = { data: { withdrawId: 'W001', status: 'processing' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { amount: 50, bankCardId: 1, paymentPassword: '123456' };
      const result = await walletApi.withdraw(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/withdraw', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle insufficient balance', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '余额不足' } },
      });

      await expect(
        walletApi.withdraw({ amount: 9999, bankCardId: 1, paymentPassword: '123456' })
      ).rejects.toBeDefined();
    });

    it('should handle wrong password', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 401, data: { message: '支付密码错误' } },
      });

      await expect(
        walletApi.withdraw({ amount: 50, bankCardId: 1, paymentPassword: 'wrong' })
      ).rejects.toBeDefined();
    });
  });

  describe('getTransactions', () => {
    it('should get transactions without params', async () => {
      const mockResponse = { data: [{ id: 'T001', type: 'recharge', amount: 100 }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletApi.getTransactions();

      expect(api.get).toHaveBeenCalledWith('/wallet/my/transactions', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get transactions with pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await walletApi.getTransactions({ page: 1, pageSize: 10 });

      expect(api.get).toHaveBeenCalledWith('/wallet/my/transactions', { params: { page: 1, pageSize: 10 } });
    });

    it('should get transactions with type filter', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await walletApi.getTransactions({ type: 'withdraw' });

      expect(api.get).toHaveBeenCalledWith('/wallet/my/transactions', { params: { type: 'withdraw' } });
    });

    it('should get transactions with all params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await walletApi.getTransactions({ page: 2, pageSize: 20, type: 'recharge' });

      expect(api.get).toHaveBeenCalledWith('/wallet/my/transactions', {
        params: { page: 2, pageSize: 20, type: 'recharge' },
      });
    });
  });

  describe('setPassword', () => {
    it('should set payment password', async () => {
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { password: '123456' };
      const result = await walletApi.setPassword(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/password', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle weak password', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '密码强度不足' } },
      });

      await expect(walletApi.setPassword({ password: '123' })).rejects.toBeDefined();
    });
  });

  describe('updatePassword', () => {
    it('should update payment password', async () => {
      const mockResponse = { data: { success: true } };
      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const data = { old_password: '123456', new_password: '654321', confirm_password: '654321' };
      const result = await walletApi.updatePassword(data);

      expect(api.put).toHaveBeenCalledWith('/wallet/password', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle wrong old password', async () => {
      (api.put as jest.Mock).mockRejectedValue({
        response: { status: 401, data: { message: '原密码错误' } },
      });

      await expect(
        walletApi.updatePassword({ old_password: 'wrong', new_password: '123456', confirm_password: '123456' })
      ).rejects.toBeDefined();
    });

    it('should handle password mismatch', async () => {
      (api.put as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '两次输入的密码不一致' } },
      });

      await expect(
        walletApi.updatePassword({ old_password: '123456', new_password: '111111', confirm_password: '222222' })
      ).rejects.toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify payment password', async () => {
      const mockResponse = { data: { valid: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { password: '123456' };
      const result = await walletApi.verifyPassword(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/password/verify', data);
      expect(result).toEqual(mockResponse);
    });

    it('should return invalid for wrong password', async () => {
      const mockResponse = { data: { valid: false } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await walletApi.verifyPassword({ password: 'wrong' });

      expect(result.data.valid).toBe(false);
    });
  });

  describe('transfer', () => {
    it('should transfer successfully', async () => {
      const mockResponse = { data: { transferId: 'TR001', status: 'success' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { toUserId: 2, amount: 50, paymentPassword: '123456' };
      const result = await walletApi.transfer(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/transfer', data);
      expect(result).toEqual(mockResponse);
    });

    it('should transfer with remark', async () => {
      const mockResponse = { data: { transferId: 'TR002' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { toUserId: 3, amount: 100, paymentPassword: '123456', remark: 'Gift' };
      await walletApi.transfer(data);

      expect(api.post).toHaveBeenCalledWith('/wallet/transfer', data);
    });

    it('should handle insufficient balance', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '余额不足' } },
      });

      await expect(
        walletApi.transfer({ toUserId: 2, amount: 99999, paymentPassword: '123456' })
      ).rejects.toBeDefined();
    });

    it('should handle wrong password', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 401, data: { message: '支付密码错误' } },
      });

      await expect(
        walletApi.transfer({ toUserId: 2, amount: 50, paymentPassword: 'wrong' })
      ).rejects.toBeDefined();
    });

    it('should handle invalid user', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: '收款用户不存在' } },
      });

      await expect(
        walletApi.transfer({ toUserId: 999, amount: 50, paymentPassword: '123456' })
      ).rejects.toBeDefined();
    });
  });
});
