const { Wallet, WalletTransaction } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { WALLET_CONSTANTS } = require('../constants');

class WalletService {
  async getWalletByUserId(userId) {
    try {
      let wallet = await Wallet.findOne({
        where: { user_id: userId }
      });

      if (!wallet) {
        wallet = await Wallet.create({
          user_id: userId,
          balance: 0,
          frozen_balance: 0,
          total_income: 0,
          total_expense: 0,
          status: 1
        });
      }

      return wallet;
    } catch (error) {
      logger.error('Get wallet by user ID failed:', error);
      throw error;
    }
  }

  async recharge(userId, amount, paymentMethod, transactionId) {
    try {
      const wallet = await this.getWalletByUserId(userId);

      if (amount <= 0) {
        throw new Error('Invalid amount');
      }

      // const balanceBefore = wallet.balance; // 保留以备将来审计使用
      wallet.balance += amount;
      wallet.total_income += amount;
      await wallet.save();

      await WalletTransaction.create({
        user_id: userId,
        wallet_id: wallet.id,
        type: 'recharge',
        amount: amount,
        balance: wallet.balance,
        related_order_id: transactionId,
        description: `钱包充值 - ${paymentMethod}`,
        status: 1
      });

      return await this.getWalletByUserId(userId);
    } catch (error) {
      logger.error('Recharge failed:', error);
      throw error;
    }
  }

  async withdraw(userId, amount, bankCardId, password) {
    try {
      const TransactionManager = require('../utils/transactionManager');
      
      return await TransactionManager.execute(async (t) => {
        const wallet = await Wallet.findOne({
          where: { user_id: userId },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        if (wallet.balance < amount) {
          throw new Error('Insufficient balance');
        }

        if (wallet.password && !this.verifyPassword(password, wallet.password)) {
          throw new Error('Invalid password');
        }

        if (amount < WALLET_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) {
          throw new Error('Minimum withdrawal amount is 1 yuan');
        }

        if (amount > WALLET_CONSTANTS.MAX_WITHDRAWAL_AMOUNT) {
          throw new Error('Maximum withdrawal amount is 10000 yuan');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayWithdrawals = await WalletTransaction.count({
          where: {
            user_id: userId,
            type: 'withdraw',
            created_at: {
              [Op.gte]: today
            }
          },
          transaction: t
        });

        if (todayWithdrawals >= WALLET_CONSTANTS.DAILY_WITHDRAWAL_LIMIT) {
          throw new Error('Daily withdrawal limit reached (3 times)');
        }

        const currentMonth = new Date();
        currentMonth.setDate(1);
        const monthlyWithdrawals = await WalletTransaction.findAll({
          where: {
            user_id: userId,
            type: 'withdraw',
            created_at: {
              [Op.gte]: currentMonth
            }
          },
          attributes: ['amount'],
          transaction: t
        });

        const monthlyWithdrawnAmount = monthlyWithdrawals.reduce((sum, t) => sum + t.amount, 0);
        if (monthlyWithdrawnAmount + amount > WALLET_CONSTANTS.MONTHLY_WITHDRAWAL_LIMIT) {
          throw new Error('Monthly withdrawal limit reached (30000 yuan)');
        }

        // const balanceBefore = wallet.balance; // 保留以备将来审计使用
        const feeAmount = amount * WALLET_CONSTANTS.WITHDRAWAL_FEE_RATE;
        const actualWithdrawAmount = amount - feeAmount;
        
        // 余额应该扣减申请金额（包含手续费）
        wallet.balance -= amount;
        wallet.total_expense += amount;
        await wallet.save({ transaction: t });

        await WalletTransaction.create({
          user_id: userId,
          wallet_id: wallet.id,
          type: 'withdraw',
          amount: actualWithdrawAmount,
          balance: wallet.balance,
          related_order_id: bankCardId,
          description: `钱包提现 - 银行卡${bankCardId}（手续费${feeAmount.toFixed(2)}元）`,
          status: 1
        }, { transaction: t });

        return await this.getWalletByUserId(userId);
      });
    } catch (error) {
      logger.error('Withdraw failed:', error);
      throw error;
    }
  }

  async transfer(fromUserId, toUserId, amount, password) {
    try {
      const TransactionManager = require('../utils/transactionManager');
      
      return await TransactionManager.execute(async (t) => {
        const fromWallet = await Wallet.findOne({
          where: { user_id: fromUserId },
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        const toWallet = await Wallet.findOne({
          where: { user_id: toUserId },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!fromWallet || !toWallet) {
          throw new Error('Wallet not found');
        }

        if (fromWallet.balance < amount) {
          throw new Error('Insufficient balance');
        }

        if (fromWallet.password && !this.verifyPassword(password, fromWallet.password)) {
          throw new Error('Invalid password');
        }

        if (amount <= 0) {
          throw new Error('Invalid amount');
        }

        // const fromBalanceBefore = fromWallet.balance; // 保留以备将来审计使用
        fromWallet.balance -= amount;
        fromWallet.total_expense += amount;
        await fromWallet.save({ transaction: t });

        await WalletTransaction.create({
          user_id: fromUserId,
          wallet_id: fromWallet.id,
          type: 'payment',
          amount: amount,
          balance: fromWallet.balance,
          related_order_id: toUserId,
          description: `转账给用户${toUserId}`,
          status: 1
        }, { transaction: t });

        // const toBalanceBefore = toWallet.balance; // 保留以备将来审计使用
        toWallet.balance += amount;
        toWallet.total_income += amount;
        await toWallet.save({ transaction: t });

        await WalletTransaction.create({
          user_id: toUserId,
          wallet_id: toWallet.id,
          type: 'income',
          amount: amount,
          balance: toWallet.balance,
          related_order_id: fromUserId,
          description: `收到用户${fromUserId}转账`,
          status: 1
        }, { transaction: t });

        return {
          fromWallet: await this.getWalletByUserId(fromUserId),
          toWallet: await this.getWalletByUserId(toUserId)
        };
      });
    } catch (error) {
      logger.error('Transfer failed:', error);
      throw error;
    }
  }

  async getTransactionList(userId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = { user_id: userId };

      if (filters.type !== undefined) {
        where.type = filters.type;
      }

      if (filters.start_date && filters.end_date) {
        const { Op } = require('sequelize');
        where.created_at = {
          [Op.gte]: filters.start_date,
          [Op.lte]: filters.end_date
        };
      }

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where,
        offset,
        limit,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows
      };
    } catch (error) {
      logger.error('Get transaction list failed:', error);
      throw error;
    }
  }

  async getTransactionById(transactionId, userId) {
    try {
      const transaction = await WalletTransaction.findOne({
        where: {
          id: transactionId,
          user_id: userId
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      logger.error('Get transaction by ID failed:', error);
      throw error;
    }
  }

  async setPassword(userId, oldPassword, newPassword) {
    try {
      const wallet = await this.getWalletByUserId(userId);

      if (wallet.password && !this.verifyPassword(oldPassword, wallet.password)) {
        throw new Error('Invalid old password');
      }

      const bcrypt = require('bcrypt');
      wallet.password = await bcrypt.hash(newPassword, 12);
      await wallet.save();

      return await this.getWalletByUserId(userId);
    } catch (error) {
      logger.error('Set password failed:', error);
      throw error;
    }
  }

  async freezeBalance(userId, amount) {
    try {
      const wallet = await this.getWalletByUserId(userId);

      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      wallet.balance -= amount;
      wallet.frozen_balance += amount;
      await wallet.save();

      return await this.getWalletByUserId(userId);
    } catch (error) {
      logger.error('Freeze balance failed:', error);
      throw error;
    }
  }

  async unfreezeBalance(userId, amount) {
    try {
      const wallet = await this.getWalletByUserId(userId);

      if (wallet.frozen_balance < amount) {
        throw new Error('Insufficient frozen balance');
      }

      wallet.frozen_balance -= amount;
      wallet.balance += amount;
      await wallet.save();

      return await this.getWalletByUserId(userId);
    } catch (error) {
      logger.error('Unfreeze balance failed:', error);
      throw error;
    }
  }

  verifyPassword(password, hash) {
    const bcrypt = require('bcrypt');
    return bcrypt.compareSync(password, hash);
  }
}

module.exports = new WalletService();
