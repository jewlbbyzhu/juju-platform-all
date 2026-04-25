const { VIPMembership, Payment, User, Party } = require('../models');
const { Op } = require('sequelize');
const TransactionManager = require('../utils/transactionManager');
const logger = require('../utils/logger');

const VIP_TYPES = {
  MONTHLY: {
    type: 'monthly',
    name: '月卡',
    price: 88,
    duration: 30,
    freePartyCount: 2,
    settlementRate: 0.97,
    commissionRate: 0.03,
    auditPriority: 2,
    featuredWeight: 1.2,
    dataReport: 'monthly'
  },
  QUARTERLY: {
    type: 'quarterly',
    name: '季卡',
    price: 188,
    duration: 90,
    freePartyCount: 3,
    settlementRate: 0.98,
    commissionRate: 0.02,
    auditPriority: 1,
    featuredWeight: 1.8,
    dataReport: 'monthly'
  },
  YEARLY: {
    type: 'yearly',
    name: '年卡',
    price: 888,
    duration: 365,
    freePartyCount: -1,
    settlementRate: 0.98,
    commissionRate: 0.02,
    auditPriority: 1,
    featuredWeight: 2.5,
    dataReport: 'both'
  }
};

class VIPService {
  constructor() {
    this.VIP_TYPES = VIP_TYPES;
  }

  async createVIPMembership(userId, membershipType, paymentId) {
    return await TransactionManager.execute(async (t) => {
      const vipType = this.VIP_TYPES[membershipType.toUpperCase()];
      if (!vipType) {
        throw new Error('Invalid VIP membership type');
      }

      const user = await User.findByPk(userId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const startDate = now;
      const endDate = new Date(now.getTime() + vipType.duration * 24 * 60 * 60 * 1000);

      const membership = await VIPMembership.create({
        user_id: userId,
        membership_type: vipType.type,
        start_date: startDate,
        end_date: endDate,
        status: 1,
        payment_id: paymentId
      }, { transaction: t });

      logger.info(`VIP membership created for user ${userId}, type: ${vipType.type}`);
      return membership;
    });
  }

  async getUserVIPStatus(userId) {
    try {
      const membership = await VIPMembership.findOne({
        where: {
          user_id: userId,
          status: 1,
          end_date: {
            [Op.gt]: new Date()
          }
        },
        order: [['end_date', 'DESC']]
      });

      if (!membership) {
        return {
          is_vip: false,
          membership_type: null,
          start_date: null,
          end_date: null,
          days_remaining: 0
        };
      }

      const now = new Date();
      const daysRemaining = Math.ceil((membership.end_date - now) / (1000 * 60 * 60 * 24));

      return {
        is_vip: true,
        membership_type: membership.membership_type,
        start_date: membership.start_date,
        end_date: membership.end_date,
        days_remaining: daysRemaining
      };
    } catch (error) {
      logger.error('Get user VIP status failed:', error);
      throw error;
    }
  }

  async getVIPHistory(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await VIPMembership.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit,
        include: [
          {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'payment_no', 'amount', 'payment_time', 'payment_method']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows.map(membership => ({
          id: membership.id,
          membership_type: membership.membership_type,
          membership_name: this.VIP_TYPES[membership.membership_type.toUpperCase()]?.name || membership.membership_type,
          start_date: membership.start_date,
          end_date: membership.end_date,
          status: membership.status,
          status_text: this.getStatusText(membership.status),
          payment: membership.payment ? {
            id: membership.payment.id,
            payment_no: membership.payment.payment_no,
            amount: membership.payment.amount,
            payment_time: membership.payment.payment_time,
            payment_method: membership.payment.payment_method
          } : null
        }))
      };
    } catch (error) {
      logger.error('Get VIP history failed:', error);
      throw error;
    }
  }

  async getVIPBenefits(userId) {
    try {
      const vipStatus = await this.getUserVIPStatus(userId);

      if (!vipStatus.is_vip) {
        return {
          is_vip: false,
          benefits: this.getNormalUserBenefits()
        };
      }

      const vipType = this.VIP_TYPES[vipStatus.membership_type.toUpperCase()];
      return {
        is_vip: true,
        membership_type: vipStatus.membership_type,
        membership_name: vipType.name,
        benefits: {
          party_publish_limit: vipType.freePartyCount === -1 ? '无限制' : `${vipType.freePartyCount}个免费名额`,
          audit_priority: vipType.auditPriority === 1 ? '2小时内审核' : '2-4小时内审核',
          settlement_rate: `${(vipType.settlementRate * 100).toFixed(1)}%`,
          commission_rate: `${(vipType.commissionRate * 100).toFixed(1)}%`,
          featured_weight: `推荐权重 x${vipType.featuredWeight}`,
          data_report: vipType.dataReport === 'both' ? '月度+年度报告' : '月度报告',
          customer_service: '专属客服支持'
        }
      };
    } catch (error) {
      logger.error('Get VIP benefits failed:', error);
      throw error;
    }
  }

  async checkPartyPublishLimit(userId) {
    try {
      const vipStatus = await this.getUserVIPStatus(userId);

      if (!vipStatus.is_vip) {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const publishedCount = await Party.count({
          where: {
            user_id: userId,
            status: { [Op.ne]: 4 },
            created_at: { [Op.gte]: currentMonth }
          }
        });

        return {
          can_publish: publishedCount < 3,
          published_count: publishedCount,
          limit: 3,
          message: publishedCount >= 3 ? '本月发布次数已达上限，升级VIP可无限制发布' : '可发布聚会'
        };
      }

      const vipType = this.VIP_TYPES[vipStatus.membership_type.toUpperCase()];
      
      if (vipType.freePartyCount === -1) {
        return {
          can_publish: true,
          published_count: -1,
          limit: -1,
          message: 'VIP会员可无限制发布聚会'
        };
      }

      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const publishedCount = await Party.count({
        where: {
          user_id: userId,
          status: { [Op.ne]: 4 },
          created_at: { [Op.gte]: currentMonth }
        }
      });

      return {
        can_publish: publishedCount < vipType.freePartyCount,
        published_count: publishedCount,
        limit: vipType.freePartyCount,
        message: publishedCount >= vipType.freePartyCount ? '本月免费名额已用完，后续发布需服务费' : `可发布聚会（剩余${vipType.freePartyCount - publishedCount}个免费名额）`
      };
    } catch (error) {
      logger.error('Check party publish limit failed:', error);
      throw error;
    }
  }

  async getSettlementRate(userId) {
    try {
      const vipStatus = await this.getUserVIPStatus(userId);

      if (!vipStatus.is_vip) {
        return {
          settlement_rate: 0.95,
          commission_rate: 0.05,
          is_vip: false
        };
      }

      const vipType = this.VIP_TYPES[vipStatus.membership_type.toUpperCase()];
      return {
        settlement_rate: vipType.settlementRate,
        commission_rate: vipType.commissionRate,
        is_vip: true,
        membership_type: vipStatus.membership_type
      };
    } catch (error) {
      logger.error('Get settlement rate failed:', error);
      throw error;
    }
  }

  async getAuditPriority(userId) {
    try {
      const vipStatus = await this.getUserVIPStatus(userId);

      if (!vipStatus.is_vip) {
        return {
          priority: 0,
          estimated_time: '4-12小时'
        };
      }

      const vipType = this.VIP_TYPES[vipStatus.membership_type.toUpperCase()];
      return {
        priority: vipType.auditPriority,
        estimated_time: vipType.auditPriority === 1 ? '2小时内' : '2-4小时'
      };
    } catch (error) {
      logger.error('Get audit priority failed:', error);
      throw error;
    }
  }

  async getFeaturedWeight(userId) {
    try {
      const vipStatus = await this.getUserVIPStatus(userId);

      if (!vipStatus.is_vip) {
        return {
          weight: 1.0,
          message: '无额外权重'
        };
      }

      const vipType = this.VIP_TYPES[vipStatus.membership_type.toUpperCase()];
      return {
        weight: vipType.featuredWeight,
        message: `推荐权重 x${vipType.featuredWeight}`
      };
    } catch (error) {
      logger.error('Get featured weight failed:', error);
      throw error;
    }
  }

  async cancelVIPMembership(membershipId, userId) {
    return await TransactionManager.execute(async (t) => {
      const membership = await VIPMembership.findByPk(membershipId, { transaction: t });
      
      if (!membership) {
        throw new Error('VIP membership not found');
      }

      if (membership.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (membership.status !== 1) {
        throw new Error('VIP membership is not active');
      }

      membership.status = 2;
      await membership.save({ transaction: t });

      logger.info(`VIP membership ${membershipId} cancelled by user ${userId}`);
      return membership;
    });
  }

  async checkExpiredMemberships() {
    try {
      const now = new Date();
      const expiredMemberships = await VIPMembership.findAll({
        where: {
          status: 1,
          end_date: { [Op.lt]: now }
        }
      });

      let expiredCount = 0;
      for (const membership of expiredMemberships) {
        membership.status = 0;
        await membership.save();
        expiredCount++;
        logger.info(`VIP membership ${membership.id} expired for user ${membership.user_id}`);
      }

      return {
        expired_count: expiredCount,
        message: `${expiredCount} 个VIP会员已过期`
      };
    } catch (error) {
      logger.error('Check expired memberships failed:', error);
      throw error;
    }
  }

  getNormalUserBenefits() {
    return {
      party_publish_limit: '每月3条，需服务费',
      audit_priority: '4-12小时审核',
      settlement_rate: '95%',
      commission_rate: '5%',
      featured_weight: '无额外权重',
      data_report: '无数据报告',
      customer_service: '普通客服支持'
    };
  }

  getStatusText(status) {
    const statusMap = {
      0: '已过期',
      1: '生效中',
      2: '已取消'
    };
    return statusMap[status] || '未知';
  }
}

module.exports = new VIPService();
