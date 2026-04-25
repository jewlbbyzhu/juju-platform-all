const walletController = require('../../src/controllers/walletController');
const { Wallet, WalletTransaction, Payment } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));
jest.mock('bcrypt', () => ({
  compareSync: jest.fn(() => true),
  hashSync: jest.fn(() => 'hashed_password'),
  hash: jest.fn(() => Promise.resolve('hashed_password'))
}));

describe('WalletController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('getWallet', () => {
    it('should get wallet successfully', async () => {
      req.user = { id: 1 };

      const mockWalletData = {
        id: 1,
        user_id: 1,
        balance: 1000,
        frozen_balance: 0,
        total_income: 0,
        total_expense: 0,
        password: null,
        status: 1
      };

      const mockWallet = {
        ...mockWalletData,
        toJSON: () => mockWalletData
      };

      Wallet.findOne.mockResolvedValue(mockWallet);

      await walletController.getWallet(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockWalletData
      });
      expect(Wallet.findOne).toHaveBeenCalledWith({
        where: { user_id: 1 }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get wallet error', async () => {
      req.user = { id: 1 };

      const error = new Error('Wallet not found');
      Wallet.findOne.mockRejectedValue(error);

      await walletController.getWallet(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('recharge', () => {
    it('should recharge wallet successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        amount: 100,
        paymentMethod: 'wechat',
        paymentPassword: 'password123'
      };

      const mockWalletData = {
        id: 1,
        user_id: 1,
        balance: 1000,
        password: 'password123'
      };

      const mockWallet = {
        ...mockWalletData,
        toJSON: () => mockWalletData
      };

      Wallet.findOne.mockResolvedValue(mockWallet);
      Wallet.update.mockResolvedValue([1]);
      
      const mockPaymentData = {
        id: 1,
        payment_no: 'PAY1234567890',
        order_id: null,
        payment_method: 'wechat',
        amount: 100,
        status: 1,
        payment_time: new Date()
      };

      const mockPayment = {
        ...mockPaymentData,
        get: function(key) {
          return this[key] !== undefined ? this[key] : this.dataValues?.[key];
        }
      };

      Payment.create.mockResolvedValue(mockPayment);
      WalletTransaction.create.mockResolvedValue({});

      await walletController.recharge(req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.message).toBe('Recharge successful');
      expect(jsonCall.data.balance).toBe(1100);
      expect(jsonCall.data.paymentNo).toMatch(/^PAY\d+$/);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle recharge error', async () => {
      req.user = { id: 1 };
      req.body = { amount: 100, paymentMethod: 'wechat' };

      const error = new Error('Wallet not found');
      Wallet.findOne.mockResolvedValue(null);

      await walletController.recharge(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should withdraw successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        amount: 100,
        bankCardId: 1,
        paymentPassword: 'password123'
      };

      const mockWalletData = {
        id: 1,
        user_id: 1,
        balance: 1000,
        password: 'password123'
      };

      const mockWallet = {
        ...mockWalletData,
        toJSON: () => mockWalletData
      };

      const mockTransactionData = {
        id: 1,
        type: 'expense',
        amount: 100,
        balance: 900
      };

      const mockTransaction = {
        ...mockTransactionData,
        toJSON: () => mockTransactionData
      };

      Wallet.findOne.mockResolvedValue(mockWallet);
      Wallet.update.mockResolvedValue([1]);
      WalletTransaction.create.mockResolvedValue(mockTransaction);

      await walletController.withdraw(req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.message).toBe('Withdrawal request submitted');
      expect(jsonCall.data).toMatchObject({
        type: 'expense',
        amount: 100,
        balance: 900
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle withdraw error', async () => {
      req.user = { id: 1 };
      req.body = { amount: 100, bankCardId: 1, paymentPassword: 'password123' };

      const error = new Error('Withdraw failed');
      Wallet.findOne.mockRejectedValue(error);

      await walletController.withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getWalletTransactions', () => {
    it('should get wallet transactions successfully', async () => {
      req.user = { id: 1 };
      req.query = {
        page: '1',
        pageSize: '20',
        type: 'income'
      };

      const mockResult = {
        count: 10,
        rows: [
          { id: 1, type: 'income', amount: 100 },
          { id: 2, type: 'expense', amount: 50 }
        ]
      };

      WalletTransaction.findAndCountAll.mockResolvedValue(mockResult);

      await walletController.getWalletTransactions(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 10,
          page: 1,
          pageSize: 20,
          data: mockResult.rows
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get wallet transactions error', async () => {
      req.user = { id: 1 };
      req.query = { page: '1', pageSize: '20' };

      const error = new Error('Get transactions failed');
      WalletTransaction.findAndCountAll.mockRejectedValue(error);

      await walletController.getWalletTransactions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('setPassword', () => {
    it('should set password successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        password: 'new123'
      };

      const mockWalletData = {
        id: 1,
        user_id: 1
      };

      const mockWallet = {
        ...mockWalletData,
        save: jest.fn().mockResolvedValue(),
        toJSON: () => mockWalletData
      };

      Wallet.findOne.mockResolvedValue(mockWallet);

      await walletController.setPassword(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment password set successfully'
      });
      expect(mockWallet.save).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle set password error', async () => {
      req.user = { id: 1 };
      req.body = { password: 'new123' };

      const error = new Error('Set password failed');
      Wallet.findOne.mockRejectedValue(error);

      await walletController.setPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});