const { Wallet, WalletTransaction } = require('../models');
const logger = require('../utils/logger');
const { validatePassword, validateAmount } = require('../utils/validator');

class WalletController {
  async getWallet(req, res, next) {
    try {
      let wallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!wallet) {
        wallet = await Wallet.create({
          user_id: req.user.id,
          balance: 0,
          password: null
        });
      }

      res.json({
        success: true,
        data: wallet.toJSON()
      });
    } catch (error) {
      logger.error('Get wallet error:', error);
      next(error);
    }
  }

  async getWalletTransactions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const type = req.query.type;

      const offset = (page - 1) * pageSize;
      const where = { user_id: req.user.id };

      if (type) {
        where.type = type;
      }

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          total: count,
          page,
          pageSize,
          data: rows
        }
      });
    } catch (error) {
      logger.error('Get wallet transactions error:', error);
      next(error);
    }
  }

  async recharge(req, res, next) {
    try {
      const { amount, paymentMethod, paymentPassword } = req.body;
      const wallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // 如果设置了支付密码，需要验证
      if (wallet.password) {
        if (!paymentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Payment password is required'
          });
        }
        
        const bcrypt = require('bcrypt');
        const isPasswordValid = bcrypt.compareSync(paymentPassword, wallet.password);
        if (!isPasswordValid) {
          return res.status(400).json({
            success: false,
            message: 'Invalid payment password'
          });
        }
      }

      const { Payment, WalletTransaction } = require('../models');
      const TransactionManager = require('../utils/transactionManager');
      
      const result = await TransactionManager.execute(async (t) => {
        const paymentNo = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        const payment = await Payment.create({
          order_id: 0,
          user_id: req.user.id,
          payment_no: paymentNo,
          payment_method: paymentMethod,
          amount: amount,
          status: 1,
          payment_time: new Date()
        }, { transaction: t });

        const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
        await Wallet.update(
          { balance: newBalance },
          { where: { id: wallet.id }, transaction: t }
        );

        await WalletTransaction.create({
          user_id: req.user.id,
          wallet_id: wallet.id,
          type: 'recharge',
          amount: amount,
          balance: newBalance,
          description: '钱包充值',
          status: 1
        }, { transaction: t });

        return {
          paymentId: payment.id,
          paymentNo: paymentNo,
          balance: newBalance
        };
      });

      res.json({
        success: true,
        message: 'Recharge successful',
        data: result
      });
    } catch (error) {
      logger.error('Recharge error:', error);
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const { amount, bankCardId, paymentPassword } = req.body;
      
      const amountValidation = validateAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({
          success: false,
          message: amountValidation.message
        });
      }
      
      const passwordValidation = validatePassword(paymentPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment password: ' + passwordValidation.message
        });
      }
      
      if (!bankCardId) {
        return res.status(400).json({
          success: false,
          message: 'Bank card ID is required'
        });
      }
      
      const wallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const bcrypt = require('bcrypt');
      const isPasswordValid = bcrypt.compareSync(paymentPassword, wallet.password);
      if (!isPasswordValid) {
        throw new Error('Invalid payment password');
      }

      await Wallet.update(
        { balance: wallet.balance - amount },
        { where: { id: wallet.id } }
      );

      const { WalletTransaction } = require('../models');
      // const transactionNo = `WTH${Date.now()}${Math.floor(Math.random() * 1000)}`; // TODO: 使用交易号

      const transaction = await WalletTransaction.create({
        user_id: req.user.id,
        wallet_id: wallet.id,
        type: 'withdraw',
        amount: amount,
        balance: wallet.balance - amount,
        description: '钱包提现',
        related_order_id: bankCardId,
        status: 0
      });

      res.json({
        success: true,
        message: 'Withdrawal request submitted',
        data: transaction.toJSON()
      });
    } catch (error) {
      logger.error('Withdraw error:', error);
      next(error);
    }
  }

  async setPassword(req, res, next) {
    try {
      const { password } = req.body;
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
      }
      
      const wallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const bcrypt = require('bcrypt');
      wallet.password = await bcrypt.hash(password, 10);
      await wallet.save();

      res.json({
        success: true,
        message: 'Payment password set successfully'
      });
    } catch (error) {
      logger.error('Set password error:', error);
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { old_password, new_password, confirm_password } = req.body;
      
      if (!old_password || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'New password and confirm password do not match'
        });
      }

      const oldPasswordValidation = validatePassword(old_password);
      const newPasswordValidation = validatePassword(new_password);
      
      if (!oldPasswordValidation.valid || !newPasswordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password format'
        });
      }

      const wallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const bcrypt = require('bcrypt');
      const isPasswordValid = bcrypt.compareSync(old_password, wallet.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Old password is incorrect'
        });
      }

      wallet.password = await bcrypt.hash(new_password, 10);
      await wallet.save();

      res.json({
        success: true,
        message: 'Payment password updated successfully'
      });
    } catch (error) {
      logger.error('Update password error:', error);
      next(error);
    }
  }

  async verifyPassword(req, res, next) {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }
      
      const wallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!wallet || !wallet.password) {
        return res.status(400).json({
          success: false,
          message: 'Payment password not set'
        });
      }

      const bcrypt = require('bcrypt');
      const isPasswordValid = bcrypt.compareSync(password, wallet.password);
      
      res.json({
        success: true,
        data: { valid: isPasswordValid }
      });
    } catch (error) {
      logger.error('Verify password error:', error);
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const { toUserId, amount, paymentPassword, remark } = req.body;
      
      const amountValidation = validateAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({
          success: false,
          message: amountValidation.message
        });
      }
      
      if (!toUserId) {
        return res.status(400).json({
          success: false,
          message: 'Target user ID is required'
        });
      }
      
      if (toUserId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to yourself'
        });
      }
      
      const passwordValidation = validatePassword(paymentPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment password: ' + passwordValidation.message
        });
      }
      
      const fromWallet = await Wallet.findOne({
        where: { user_id: req.user.id }
      });

      if (!fromWallet) {
        throw new Error('Wallet not found');
      }

      if (fromWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const bcrypt = require('bcrypt');
      const isPasswordValid = bcrypt.compareSync(paymentPassword, fromWallet.password);
      if (!isPasswordValid) {
        throw new Error('Invalid payment password');
      }

      const toWallet = await Wallet.findOne({
        where: { user_id: toUserId }
      });

      if (!toWallet) {
        throw new Error('Target user wallet not found');
      }

      // Deduct from sender
      await Wallet.update(
        { balance: fromWallet.balance - amount },
        { where: { id: fromWallet.id } }
      );

      // Add to receiver
      await Wallet.update(
        { balance: toWallet.balance + amount },
        { where: { id: toWallet.id } }
      );

      // Create transaction records
      const transactionNo = `TRF${Date.now()}${Math.floor(Math.random() * 1000)}`;

      await WalletTransaction.create({
        user_id: req.user.id,
        wallet_id: fromWallet.id,
        type: 'transfer_out',
        amount: amount,
        balance: fromWallet.balance - amount,
        description: remark || '转账给他人',
        related_order_id: toUserId,
        status: 1,
        transaction_no: transactionNo
      });

      await WalletTransaction.create({
        user_id: toUserId,
        wallet_id: toWallet.id,
        type: 'transfer_in',
        amount: amount,
        balance: toWallet.balance + amount,
        description: remark || '收到转账',
        related_order_id: req.user.id,
        status: 1,
        transaction_no: transactionNo
      });

      res.json({
        success: true,
        message: 'Transfer successful',
        data: {
          transactionNo,
          amount,
          balance: fromWallet.balance - amount
        }
      });
    } catch (error) {
      logger.error('Transfer error:', error);
      next(error);
    }
  }
}

module.exports = new WalletController();
