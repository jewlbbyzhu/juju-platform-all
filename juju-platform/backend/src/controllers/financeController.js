const { WalletTransaction, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// 将文本状态映射为数值，兼容 WalletTransaction.status
const statusMap = {
  pending: 0,      // 待审核
  processed: 1,    // 已处理/成功
  rejected: 2      // 已拒绝（自定义扩展）
};

class FinanceController {
  // 提现列表
  async getWithdrawals(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const keyword = req.query.keyword;
      const statusText = req.query.status;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const offset = (page - 1) * pageSize;

      const typeFilter = ['withdraw', 'expense'];

      const where = { type: { [Op.in]: typeFilter } };
      if (startDate && endDate) {
        where.created_at = { 
          [Op.gte]: new Date(startDate), 
          [Op.lte]: new Date(endDate) 
        };
      }
      if (statusText && statusMap[statusText]) {
        where.status = statusMap[statusText];
      }

      const include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar', 'phone'],
          where: keyword
            ? {
              [Op.or]: [
                { nickname: { [Op.like]: `%${keyword}%` } },
                { phone: { [Op.like]: `%${keyword}%` } }
              ]
            }
            : undefined
        }
      ];

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']],
        include
      });

      const list = rows.map((tx) => {
        return {
          id: tx.id,
          userId: tx.user_id,
          amount: Math.round(Number(tx.amount) * 100), // 转为分
          bankCardId: tx.related_order_id || 0,
          status: Object.keys(statusMap).find((k) => statusMap[k] === tx.status) || 'processed',
          reason: undefined,
          processedAt: tx.status === statusMap.processed ? tx.updated_at : undefined,
          createdAt: tx.created_at,
          updatedAt: tx.updated_at,
          user: tx.user
            ? {
              id: tx.user.id,
              nickname: tx.user.nickname,
              avatar: tx.user.avatar,
              phone: tx.user.phone
            }
            : undefined,
          bankCard: undefined
        };
      });

      res.json({
        success: true,
        data: {
          list,
          total: count,
          page,
          pageSize
        }
      });
    } catch (error) {
      logger.error('Get withdrawals error:', error);
      next(error);
    }
  }

  // 财务统计（简化版）
  async getFinancialStats(req, res, next) {
    try {
      const pendingCount = await WalletTransaction.count({ where: { type: 'withdraw', status: statusMap.pending } });
      const processedCount = await WalletTransaction.count({ where: { type: 'withdraw', status: statusMap.processed } });
      const rejectedCount = await WalletTransaction.count({ where: { type: 'withdraw', status: statusMap.rejected } });

      res.json({
        success: true,
        data: {
          revenue: {
            total: 0,
            ticket: 0,
            service: 0,
            vip: 0,
            commission: 0
          },
          trends: [],
          withdrawal: {
            pending: pendingCount,
            approved: processedCount,
            rejected: rejectedCount,
            processed: processedCount
          }
        }
      });
    } catch (error) {
      logger.error('Get financial stats error:', error);
      next(error);
    }
  }

  async getWithdrawalDetail(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const tx = await WalletTransaction.findOne({
        where: { id, type: { [Op.in]: ['withdraw', 'expense'] } },
        include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'phone'] }]
      });
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Withdrawal not found' });
      }
      const detail = {
        id: tx.id,
        userId: tx.user_id,
        amount: Math.round(Number(tx.amount) * 100),
        bankCardId: tx.related_order_id || 0,
        status: Object.keys(statusMap).find((k) => statusMap[k] === tx.status) || 'processed',
        reason: undefined,
        processedAt: tx.status === statusMap.processed ? tx.updated_at : undefined,
        createdAt: tx.created_at,
        updatedAt: tx.updated_at,
        user: tx.user
          ? { id: tx.user.id, nickname: tx.user.nickname, avatar: tx.user.avatar, phone: tx.user.phone }
          : undefined,
        bankCard: undefined
      };
      res.json({ success: true, data: detail });
    } catch (error) {
      logger.error('Get withdrawal detail error:', error);
      next(error);
    }
  }

  async auditWithdrawal(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { status, reason, reviewer } = req.body || {};
      if (!['processed', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      const tx = await WalletTransaction.findOne({ where: { id, type: { [Op.in]: ['withdraw', 'expense'] } } });
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Withdrawal not found' });
      }
      if (tx.status === statusMap.processed && status === 'processed') {
        return res.json({ success: true, data: { id: tx.id } });
      }
      const userId = tx.user_id;
      const amount = Number(tx.amount);
      const { Wallet } = require('../models');
      const wallet = await Wallet.findOne({ where: { user_id: userId } });
      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
      }
      if (status === 'processed') {
        tx.status = statusMap.processed;
        await tx.save();
      } else if (status === 'rejected') {
        wallet.balance = Number(wallet.balance) + amount;
        await wallet.save();
        tx.status = statusMap.rejected;
        await tx.save();
      }
      res.json({ success: true, data: { id: tx.id, status, reason, reviewer } });
    } catch (error) {
      logger.error('Audit withdrawal error:', error);
      next(error);
    }
  }

  async batchAuditWithdrawals(req, res, next) {
    try {
      const { ids, status, reason, reviewer } = req.body || {};
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid ids' });
      }
      if (!['processed', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      const list = [];
      for (const id of ids) {
        req.params.id = String(id);
        req.body = { status, reason, reviewer };
        await this.auditWithdrawal(req, { json: (payload) => list.push(payload.data) }, next);
      }
      res.json({ success: true, data: list });
    } catch (error) {
      logger.error('Batch audit withdrawals error:', error);
      next(error);
    }
  }

  async getPendingWithdrawalsCount(req, res, next) {
    try {
      const count = await WalletTransaction.count({ where: { type: { [Op.in]: ['withdraw', 'expense'] }, status: statusMap.pending } });
      res.json({ success: true, data: count });
    } catch (error) {
      logger.error('Get pending withdrawals count error:', error);
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const type = req.query.type;
      const offset = (page - 1) * pageSize;
      const where = {};
      if (type) where.type = type;
      const { count, rows } = await WalletTransaction.findAndCountAll({ where, offset, limit: pageSize, order: [['created_at', 'DESC']] });
      res.json({ success: true, data: { list: rows, total: count, page, pageSize } });
    } catch (error) {
      logger.error('Get transactions error:', error);
      next(error);
    }
  }

  async getTransactionDetail(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const tx = await WalletTransaction.findOne({ where: { id } });
      if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
      res.json({ success: true, data: tx });
    } catch (error) {
      logger.error('Get transaction detail error:', error);
      next(error);
    }
  }

  async exportFinancialReport(req, res, next) {
    try {
      const startDate = req.body?.startDate;
      const endDate = req.body?.endDate;
      const rows = await WalletTransaction.findAll({
        where: startDate && endDate ? { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } } : undefined,
        order: [['created_at', 'DESC']]
      });
      const header = 'id,user_id,type,amount,balance,description,status,created_at\n';
      const body = rows
        .map((r) => `${r.id},${r.user_id},${r.type},${r.amount},${r.balance},${(r.description || '').replace(/,/g, ' ')},${r.status},${r.created_at?.toISOString() || ''}`)
        .join('\n');
      const csv = header + body;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="financial_report.csv"');
      res.status(200).send(csv);
    } catch (error) {
      logger.error('Export financial report error:', error);
      next(error);
    }
  }
}

module.exports = new FinanceController();
