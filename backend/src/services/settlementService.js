const { Party, Order, Payment, Wallet, WalletTransaction, VIPMembership } = require('../models');
const { Op } = require('sequelize');
const TransactionManager = require('../utils/transactionManager');
const logger = require('../utils/logger');
const { SETTLEMENT_CONSTANTS } = require('../constants');

class SettlementService {
  async getSettlementList(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.start_date && filters.end_date) {
        where.start_time = {
          [Op.gte]: filters.start_date,
          [Op.lte]: filters.end_date
        };
      }

      if (filters.user_id) {
        where.user_id = filters.user_id;
      }

      const { count, rows } = await Party.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: Order,
            as: 'orders',
            where: { status: 1 },
            required: false
          },
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['start_time', 'DESC']]
      });

      const settlements = rows.map(party => {
        const totalOrders = party.orders ? party.orders.length : 0;
        const totalAmount = party.orders ? party.orders.reduce((sum, order) => sum + order.final_amount, 0) : 0;

        return {
          party_id: party.id,
          party_title: party.title,
          party_start_time: party.start_time,
          party_end_time: party.end_time,
          organizer_id: party.user_id,
          organizer_nickname: party.user ? party.user.nickname : '',
          total_orders: totalOrders,
          total_amount: totalAmount,
          settlement_status: this.calculateSettlementStatus(party),
          commission: totalAmount * 0.05,
          settlement_amount: totalAmount * 0.95
        };
      });

      return {
        total: count,
        page,
        limit,
        data: settlements
      };
    } catch (error) {
      logger.error('Get settlement list failed:', error);
      throw error;
    }
  }

  async getSettlementById(partyId) {
    try {
      const party = await Party.findByPk(partyId, {
        include: [
          {
            model: Order,
            as: 'orders',
            where: { status: 1 },
            required: false,
            include: [
              {
                model: Payment,
                as: 'payment',
                where: { status: 1 }
              }
            ]
          },
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'phone']
          }
        ]
      });

      if (!party) {
        throw new Error('Party not found');
      }

      const totalOrders = party.orders ? party.orders.length : 0;
      const totalAmount = party.orders ? party.orders.reduce((sum, order) => sum + order.final_amount, 0) : 0;

      // 获取组织者信息用于通知
      const organizer = party.user || await User.findByPk(party.user_id, { attributes: ['id', 'nickname', 'phone'] });
      let commissionRate = 0.05;
      let settlementRate = 0.95;

      const membership = await VIPMembership.findOne({
        where: {
          user_id: party.user_id,
          status: 1
        }
      });

      if (membership) {
        switch (membership.membership_type) {
        case 'monthly':
          commissionRate = 0.03;
          settlementRate = 0.97;
          break;
        case 'quarterly':
          commissionRate = 0.02;
          settlementRate = 0.98;
          break;
        case 'yearly':
          commissionRate = 0.02;
          settlementRate = 0.98;
          break;
        }
      }

      const settlement = {
        party_id: party.id,
        party_title: party.title,
        party_start_time: party.start_time,
        party_end_time: party.end_time,
        organizer_id: party.user_id,
        organizer_nickname: organizer ? organizer.nickname : '',
        organizer_phone: organizer ? organizer.phone : '',
        total_orders: totalOrders,
        total_amount: totalAmount,
        settlement_status: this.calculateSettlementStatus(party),
        commission: totalAmount * commissionRate,
        settlement_amount: totalAmount * settlementRate,
        orders: party.orders || []
      };

      return settlement;
    } catch (error) {
      logger.error('Get settlement by ID failed:', error);
      throw error;
    }
  }

  async processSettlement(partyId) {
    return await TransactionManager.execute(async (t) => {
      const party = await Party.findByPk(partyId, { transaction: t });
      if (!party) {
        throw new Error('Party not found');
      }

      const settlement = await this.getSettlementById(partyId);
      if (settlement.settlement_status !== 'unsettled') {
        throw new Error('Party cannot be settled');
      }

      const wallet = await Wallet.findOne({ 
        where: { user_id: party.user_id },
        transaction: t
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // const balanceBefore = wallet.balance; // 保留以备将来审计使用
      wallet.balance += settlement.settlement_amount;
      wallet.total_income += settlement.settlement_amount;
      await wallet.save({ transaction: t });

      await WalletTransaction.create({
        user_id: party.user_id,
        wallet_id: wallet.id,
        type: 'income',
        amount: settlement.settlement_amount,
        balance: wallet.balance,
        description: `聚会结算 - ${party.title}`,
        status: 1
      }, { transaction: t });

      await Order.update(
        { settlement_status: 1 },
        { 
          where: { 
            party_id: partyId,
            status: 1
          },
          transaction: t
        }
      );

      return await this.getSettlementById(partyId);
    });
  }

  async autoSettlement() {
    try {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - SETTLEMENT_CONSTANTS.SETTLEMENT_DELAY_DAYS * 24 * 60 * 60 * 1000);

      const partiesToSettle = await Party.findAll({
        where: {
          status: 3,
          end_time: {
            [Op.lte]: fiveDaysAgo
          }
        },
        include: [
          {
            model: Order,
            as: 'orders',
            where: { status: 1 },
            required: false
          }
        ]
      });

      let settledCount = 0;
      let totalAmount = 0;

      for (const party of partiesToSettle) {
        try {
          await this.processSettlement(party.id);
          settledCount++;
          totalAmount += party.orders ? party.orders.reduce((sum, order) => sum + order.final_amount, 0) : 0;
          logger.info(`Auto settlement completed for party ${party.id}`);
        } catch (error) {
          logger.error(`Auto settlement failed for party ${party.id}:`, error);
        }
      }

      return {
        settled_count: settledCount,
        total_amount: totalAmount,
        message: `自动结算完成，共结算 ${settledCount} 个聚会，总金额 ${totalAmount} 元`
      };
    } catch (error) {
      logger.error('Auto settlement failed:', error);
      throw error;
    }
  }

  async getSettlementStats(userId) {
    try {
      const parties = await Party.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Order,
            as: 'orders',
            where: { status: 1 },
            required: false
          }
        ]
      });

      const totalParties = parties.length;
      const completedParties = parties.filter(p => p.status === 3).length;
      const totalOrders = parties.reduce((sum, p) => sum + (p.orders ? p.orders.length : 0), 0);
      const totalAmount = parties.reduce((sum, p) => {
        const partyTotal = p.orders ? p.orders.reduce((s, o) => s + o.final_amount, 0) : 0;
        return sum + partyTotal;
      }, 0);

      const settledParties = parties.filter(p => this.calculateSettlementStatus(p) === 'settled').length;
      const settledAmount = parties.filter(p => this.calculateSettlementStatus(p) === 'settled').reduce((sum, p) => {
        const partyTotal = p.orders ? p.orders.reduce((s, o) => s + o.final_amount, 0) : 0;
        return sum + partyTotal * 0.95;
      }, 0);

      const pendingSettlements = parties.filter(p => this.calculateSettlementStatus(p) === 'pending').length;
      const pendingAmount = parties.filter(p => this.calculateSettlementStatus(p) === 'pending').reduce((sum, p) => {
        const partyTotal = p.orders ? p.orders.reduce((s, o) => s + o.final_amount, 0) : 0;
        return sum + partyTotal * 0.95;
      }, 0);

      return {
        total_parties: totalParties,
        completed_parties: completedParties,
        total_orders: totalOrders,
        total_amount: totalAmount,
        settled_parties: settledParties,
        settled_amount: settledAmount,
        pending_settlements: pendingSettlements,
        pending_amount: pendingAmount
      };
    } catch (error) {
      logger.error('Get settlement stats failed:', error);
      throw error;
    }
  }

  calculateSettlementStatus(party) {
    if (party.status !== 3) {
      return 'not_completed';
    }

    const now = new Date();
    const partyEndTime = new Date(party.end_time);
    const daysSinceEnd = Math.floor((now - partyEndTime) / (1000 * 60 * 60 * 24));

    if (daysSinceEnd < 5) {
      return 'pending';
    }

    return 'settled';
  }
}

module.exports = new SettlementService();
