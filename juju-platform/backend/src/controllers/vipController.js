const { VipPackage, VipSubscription, VipLevel, VipBenefit, Party, User } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * VIP 控制器
 */
class VipController {
  /**
   * 获取 VIP 套餐列表
   */
  async getVipPackages(req, res) {
    try {
      const packages = await VipPackage.findAll({
        where: { isActive: true },
        order: [['price', 'ASC']]
      });

      return success(res, packages);
    } catch (err) {
      logger.error('获取VIP套餐失败:', err);
      return error(res, '获取VIP套餐失败', 500);
    }
  }

  /**
   * 订阅 VIP
   */
  async subscribe(req, res) {
    try {
      const { packageId } = req.body;
      const userId = req.user.id;

      const vipPackage = await VipPackage.findByPk(packageId);
      if (!vipPackage) {
        return error(res, '套餐不存在', 404);
      }

      // 创建订阅记录
      const subscription = await VipSubscription.create({
        userId,
        packageId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + vipPackage.duration * 30 * 24 * 60 * 60 * 1000),
        autoRenewal: false
      });

      return success(res, {
        subscriptionId: subscription.id,
        status: 'success',
        message: '订阅成功'
      });
    } catch (err) {
      logger.error('VIP订阅失败:', err);
      return error(res, '订阅失败', 500);
    }
  }

  /**
   * 获取订阅状态
   */
  async getSubscriptionStatus(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await VipSubscription.findOne({
        where: {
          userId,
          status: 'active',
          endDate: { $gt: new Date() }
        },
        include: [{
          model: VipPackage,
          as: 'package'
        }],
        order: [['createdAt', 'DESC']]
      });

      if (!subscription) {
        return success(res, {
          isVip: false,
          vipType: null,
          expireTime: null,
          autoRenewal: false
        });
      }

      return success(res, {
        isVip: true,
        vipType: subscription.package?.name || 'VIP',
        expireTime: subscription.endDate,
        autoRenewal: subscription.autoRenewal,
        currentPackage: subscription.package
      });
    } catch (err) {
      logger.error('获取订阅状态失败:', err);
      return error(res, '获取订阅状态失败', 500);
    }
  }

  /**
   * 获取订阅历史
   */
  async getSubscriptionHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 20 } = req.query;

      const { count, rows: history } = await VipSubscription.findAndCountAll({
        where: { userId },
        include: [{
          model: VipPackage,
          as: 'package'
        }],
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: history,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取订阅历史失败:', err);
      return error(res, '获取订阅历史失败', 500);
    }
  }

  /**
   * 续订 VIP
   */
  async renewSubscription(req, res) {
    try {
      const { packageId } = req.body;
      const userId = req.user.id;

      const vipPackage = await VipPackage.findByPk(packageId);
      if (!vipPackage) {
        return error(res, '套餐不存在', 404);
      }

      // 查找当前订阅
      let subscription = await VipSubscription.findOne({
        where: {
          userId,
          status: 'active'
        },
        order: [['createdAt', 'DESC']]
      });

      if (subscription) {
        // 延长当前订阅
        const currentEndDate = new Date(subscription.endDate);
        const newEndDate = currentEndDate > new Date()
          ? new Date(currentEndDate.getTime() + vipPackage.duration * 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + vipPackage.duration * 30 * 24 * 60 * 60 * 1000);

        await subscription.update({
          endDate: newEndDate,
          packageId
        });
      } else {
        // 创建新订阅
        subscription = await VipSubscription.create({
          userId,
          packageId,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + vipPackage.duration * 30 * 24 * 60 * 60 * 1000),
          autoRenewal: false
        });
      }

      return success(res, {
        subscriptionId: subscription.id,
        status: 'success',
        message: '续订成功'
      });
    } catch (err) {
      logger.error('VIP续订失败:', err);
      return error(res, '续订失败', 500);
    }
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(req, res) {
    try {
      const { reason } = req.body;
      const userId = req.user.id;

      const subscription = await VipSubscription.findOne({
        where: {
          userId,
          status: 'active'
        }
      });

      if (!subscription) {
        return error(res, '没有活跃的订阅', 404);
      }

      await subscription.update({
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date()
      });

      return success(res, { message: '取消订阅成功' });
    } catch (err) {
      logger.error('取消订阅失败:', err);
      return error(res, '取消订阅失败', 500);
    }
  }

  /**
   * 切换自动续费
   */
  async toggleAutoRenewal(req, res) {
    try {
      const { enable } = req.body;
      const userId = req.user.id;

      const subscription = await VipSubscription.findOne({
        where: {
          userId,
          status: 'active'
        }
      });

      if (!subscription) {
        return error(res, '没有活跃的订阅', 404);
      }

      await subscription.update({
        autoRenewal: enable
      });

      return success(res, {
        autoRenewal: enable,
        message: enable ? '已开启自动续费' : '已关闭自动续费'
      });
    } catch (err) {
      logger.error('切换自动续费失败:', err);
      return error(res, '操作失败', 500);
    }
  }

  /**
   * 获取 VIP 权益
   */
  async getVipBenefits(req, res) {
    try {
      const benefits = await VipBenefit.findAll({
        where: { isActive: true },
        order: [['sortOrder', 'ASC']]
      });

      return success(res, {
        benefits,
        totalBenefits: benefits.length
      });
    } catch (err) {
      logger.error('获取VIP权益失败:', err);
      return error(res, '获取VIP权益失败', 500);
    }
  }

  /**
   * 获取专属活动列表
   */
  async getExclusiveEvents(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;

      const { count, rows: events } = await Party.findAndCountAll({
        where: {
          isVipOnly: true,
          status: 'active'
        },
        order: [['startTime', 'ASC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: events,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取专属活动失败:', err);
      return error(res, '获取专属活动失败', 500);
    }
  }

  /**
   * 加入 VIP 专属活动
   */
  async joinVipEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      // 检查用户是否是 VIP
      const subscription = await VipSubscription.findOne({
        where: {
          userId,
          status: 'active',
          endDate: { $gt: new Date() }
        }
      });

      if (!subscription) {
        return error(res, '只有VIP用户才能参加专属活动', 403);
      }

      const event = await Party.findByPk(eventId);
      if (!event) {
        return error(res, '活动不存在', 404);
      }

      if (!event.isVipOnly) {
        return error(res, '这不是VIP专属活动', 400);
      }

      // 这里应该调用报名逻辑
      return success(res, { message: '报名成功' });
    } catch (err) {
      logger.error('加入VIP活动失败:', err);
      return error(res, '报名失败', 500);
    }
  }

  /**
   * 获取 VIP 活动详情
   */
  async getVipEventDetail(req, res) {
    try {
      const { eventId } = req.params;

      const event = await Party.findByPk(eventId);
      if (!event) {
        return error(res, '活动不存在', 404);
      }

      return success(res, event);
    } catch (err) {
      logger.error('获取VIP活动详情失败:', err);
      return error(res, '获取活动详情失败', 500);
    }
  }

  /**
   * 获取 VIP 等级列表
   */
  async getVipLevels(req, res) {
    try {
      const levels = await VipLevel.findAll({
        order: [['level', 'ASC']]
      });

      return success(res, levels);
    } catch (err) {
      logger.error('获取VIP等级失败:', err);
      return error(res, '获取VIP等级失败', 500);
    }
  }

  /**
   * 获取 VIP 等级详情
   */
  async getVipLevelDetail(req, res) {
    try {
      const { levelId } = req.params;

      const level = await VipLevel.findByPk(levelId);
      if (!level) {
        return error(res, '等级不存在', 404);
      }

      return success(res, level);
    } catch (err) {
      logger.error('获取VIP等级详情失败:', err);
      return error(res, '获取等级详情失败', 500);
    }
  }

  /**
   * 获取成长值记录
   */
  async getGrowthRecords(req, res) {
    try {
      // const userId = req.user.id; // TODO: 实现成长值记录查询
      const { page = 1, pageSize = 20 } = req.query;

      // 这里应该查询成长值记录表
      // 暂时返回空数据
      return success(res, {
        list: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: false
      });
    } catch (err) {
      logger.error('获取成长值记录失败:', err);
      return error(res, '获取成长值记录失败', 500);
    }
  }

  /**
   * 获取 VIP 优惠券
   */
  async getVipCoupons(req, res) {
    try {
      // const userId = req.user.id; // TODO: 实现VIP优惠券查询

      // 这里应该查询优惠券表
      // 暂时返回空数据
      return success(res, []);
    } catch (err) {
      logger.error('获取VIP优惠券失败:', err);
      return error(res, '获取优惠券失败', 500);
    }
  }

  /**
   * 获取 VIP 历史记录（管理后台）
   */
  async getVipHistory(req, res) {
    try {
      const { page = 1, pageSize = 20, userId, status } = req.query;

      const where = {};
      if (userId) where.user_id = userId;
      if (status) where.status = status;

      const { count, rows } = await VipSubscription.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        }],
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (err) {
      logger.error('获取VIP历史记录失败:', err);
      return error(res, '获取历史记录失败', 500);
    }
  }
}

module.exports = new VipController();
