jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../../src/config/database', () => ({
  transaction: jest.fn(async () => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      LOCK: {
        UPDATE: 'UPDATE',
        SHARE: 'SHARE'
      }
    };
    return mockTransaction;
  }),
  sync: jest.fn().mockResolvedValue({}),
  close: jest.fn().mockResolvedValue(undefined),
  define: jest.fn(() => {
    return {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn()
    };
  }),
  authenticate: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue([])
}));

jest.mock('../../src/models', () => ({
  Wallet: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  WalletTransaction: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  }
}));

const { Wallet, WalletTransaction } = require('../../src/models');
const walletService = require('../../src/services/walletService');

describe('WalletService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWalletByUserId', () => {
    it('should return existing wallet', async () => {
      const userId = 1;
      
      Wallet.findOne.mockResolvedValue({
        id: 1,
        user_id: userId,
        balance: 100.00,
        frozen_balance: 0.00,
        total_income: 200.00,
        total_expense: 100.00,
        status: 1
      });
      
      const result = await walletService.getWalletByUserId(userId);
      
      expect(result).toBeDefined();
      expect(result.user_id).toBe(userId);
      expect(result.balance).toBe(100);
    });

    it('should create new wallet if not exists', async () => {
      const userId = 2;
      
      Wallet.findOne.mockResolvedValue(null);
      Wallet.create.mockResolvedValue({
        id: 2,
        user_id: userId,
        balance: 0.00,
        frozen_balance: 0.00,
        total_income: 0.00,
        total_expense: 0.00,
        status: 1
      });
      
      const result = await walletService.getWalletByUserId(userId);
      
      expect(result).toBeDefined();
      expect(result.user_id).toBe(userId);
      expect(result.balance).toBe(0);
    });
  });

  describe('recharge', () => {
    it('should recharge wallet successfully', async () => {
      const userId = 1;
      const amount = 100.00;
      const paymentMethod = 'wechat';
      const transactionId = 'TXN001';
      
      Wallet.findOne.mockResolvedValue({
        id: 1,
        user_id: userId,
        balance: 50.00,
        frozen_balance: 0.00,
        total_income: 100.00,
        total_expense: 50.00,
        save: jest.fn().mockResolvedValue({
          id: 1,
          user_id: userId,
          balance: 150.00,
          frozen_balance: 0.00,
          total_income: 200.00,
          total_expense: 50.00
        })
      });
      
      WalletTransaction.create.mockResolvedValue({
        id: 1,
        user_id: userId,
        wallet_id: 1,
        type: 'income',
        amount: amount,
        balance_before: 50.00,
        balance_after: 150.00,
        transaction_type: 'recharge'
      });
      
      const result = await walletService.recharge(userId, amount, paymentMethod, transactionId);
      
      expect(result).toBeDefined();
      expect(result.balance).toBe(150);
      expect(result.total_income).toBe(200);
    });

    it('should throw error if amount is invalid', async () => {
      const userId = 1;

      await expect(walletService.recharge(userId, -50, 'wechat', 'TXN001'))
        .rejects.toThrow('Invalid amount');
    });
  });

  describe('withdraw', () => {
    it('should withdraw successfully', async () => {
      const userId = 1;
      const amount = 50.00;
      const bankCardId = 1;
      const password = 'password123';
      
      const mockWalletWithBalance = {
        id: 1,
        user_id: userId,
        balance: 100.00,
        frozen_balance: 0.00,
        total_income: 200.00,
        total_expense: 100.00,
        save: jest.fn().mockResolvedValue({
          id: 1,
          user_id: userId,
          balance: 50.00,
          frozen_balance: 0.00,
          total_income: 200.00,
          total_expense: 150.00,
          toJSON: function() {
            return {
              id: this.id,
              user_id: this.user_id,
              balance: this.balance,
              frozen_balance: this.frozen_balance,
              total_income: this.total_income,
              total_expense: this.total_expense
            };
          }
        })
      };
      
      const mockWalletAfterWithdraw = {
        id: 1,
        user_id: userId,
        balance: 50.00,
        frozen_balance: 0.00,
        total_income: 200.00,
        total_expense: 150.00,
        toJSON: function() {
          return {
            id: this.id,
            user_id: this.user_id,
            balance: this.balance,
            frozen_balance: this.frozen_balance,
            total_income: this.total_income,
            total_expense: this.total_expense
          };
        }
      };
      
      Wallet.findOne
        .mockResolvedValueOnce(mockWalletWithBalance)
        .mockResolvedValueOnce(mockWalletWithBalance)
        .mockResolvedValue(mockWalletAfterWithdraw);
      
      WalletTransaction.findAll.mockResolvedValue([]);
      WalletTransaction.count.mockResolvedValue(0);
      
      WalletTransaction.create.mockResolvedValue({
        id: 2,
        user_id: userId,
        wallet_id: 1,
        type: 'expense',
        amount: amount,
        balance_before: 100.00,
        balance_after: 50.00,
        transaction_type: 'withdrawal',
        toJSON: function() {
          return {
            id: this.id,
            user_id: this.user_id,
            wallet_id: this.wallet_id,
            type: this.type,
            amount: this.amount,
            balance_before: this.balance_before,
            balance_after: this.balance_after,
            transaction_type: this.transaction_type
          };
        }
      });
      
      const result = await walletService.withdraw(userId, amount, bankCardId, password);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('balance');
    });

    it('should throw error if balance is insufficient', async () => {
      const userId = 1;
      
      Wallet.findOne.mockResolvedValue({
        id: 1,
        user_id: userId,
        balance: 30.00,
        frozen_balance: 0.00
      });
      
      await expect(walletService.withdraw(userId, 50, 1, 'password123'))
        .rejects.toThrow('Insufficient balance');
    });
  });

  describe('getTransactionList', () => {
    it('should return transaction list with pagination', async () => {
      const userId = 1;
      const transactions = [
        { id: 1, type: 'income', amount: 100.00, transaction_type: 'recharge' },
        { id: 2, type: 'expense', amount: 50.00, transaction_type: 'withdrawal' },
        { id: 3, type: 'income', amount: 80.00, transaction_type: 'settlement' }
      ];
      
      WalletTransaction.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: transactions
      });
      
      const result = await walletService.getTransactionList(userId, 1, 10, {});
      
      expect(result).toBeDefined();
      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(3);
    });

    it('should filter transactions by type', async () => {
      const userId = 1;
      const transactions = [
        { id: 1, type: 'income', amount: 100.00, transaction_type: 'recharge' },
        { id: 2, type: 'income', amount: 80.00, transaction_type: 'settlement' }
      ];
      
      WalletTransaction.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: transactions
      });
      
      const result = await walletService.getTransactionList(userId, 1, 10, { type: 'income' });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data.every(t => t.type === 'income')).toBe(true);
    });
  });
});