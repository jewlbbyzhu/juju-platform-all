const { Order, OrderItem, TicketType } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const TransactionManager = require('../utils/transactionManager');

/**
 * 订单超时自动取消服务
 * 
 * 功能：
 * 1. 定期检查超时未支付的订单
 * 2. 自动取消超时订单
 * 3. 恢复票种库存
 * 
 * 超时规则：
 * - 默认订单创建后 30 分钟未支付则自动取消
 * - 可配置超时时间
 */
class OrderTimeoutService {
  constructor(options = {}) {
    this.timeoutMinutes = options.timeoutMinutes || 30;
    this.checkIntervalMinutes = options.checkIntervalMinutes || 5;
    this.timer = null;
    this.isRunning = false;
  }

  /**
   * 启动定时任务
   */
  start() {
    if (this.isRunning) {
      logger.warn('Order timeout service is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Order timeout service started. Timeout: ${this.timeoutMinutes}min, Check interval: ${this.checkIntervalMinutes}min`);
    
    // 立即执行一次检查
    this.checkAndCancelTimeoutOrders();
    
    // 设置定时检查
    const intervalMs = this.checkIntervalMinutes * 60 * 1000;
    this.timer = setInterval(() => {
      this.checkAndCancelTimeoutOrders();
    }, intervalMs);
  }

  /**
   * 停止定时任务
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Order timeout service stopped');
  }

  /**
   * 检查并取消超时订单
   */
  async checkAndCancelTimeoutOrders() {
    try {
      const timeoutTime = new Date(Date.now() - this.timeoutMinutes * 60 * 1000);
      
      logger.info(`Checking for timeout orders before ${timeoutTime.toISOString()}`);

      // 查找超时未支付的订单
      const timeoutOrders = await Order.findAll({
        where: {
          status: 0, // 待支付状态
          payment_status: 0, // 未支付
          created_at: {
            [Op.lt]: timeoutTime
          }
        },
        include: [
          {
            model: OrderItem,
            as: 'order_items',
            required: false
          }
        ]
      });

      if (timeoutOrders.length === 0) {
        logger.info('No timeout orders found');
        return;
      }

      logger.info(`Found ${timeoutOrders.length} timeout orders to cancel`);

      // 逐个取消超时订单
      for (const order of timeoutOrders) {
        await this.cancelTimeoutOrder(order);
      }

      logger.info(`Successfully cancelled ${timeoutOrders.length} timeout orders`);
    } catch (error) {
      logger.error('Error checking timeout orders:', error);
    }
  }

  /**
   * 取消单个超时订单
   */
  async cancelTimeoutOrder(order) {
    try {
      await TransactionManager.execute(async (t) => {
        // 更新订单状态为已取消（status = 3）
        order.status = 3;
        order.cancel_time = new Date();
        order.cancel_reason = '订单超时未支付，系统自动取消';
        await order.save({ transaction: t });

        // 恢复票种库存
        if (order.order_items && order.order_items.length > 0) {
          for (const item of order.order_items) {
            await TicketType.increment('sold_count', {
              by: -item.quantity,
              where: { id: item.ticket_type_id },
              transaction: t
            });
            
            logger.info(`Restored inventory for ticket type ${item.ticket_type_id}, quantity: ${item.quantity}`);
          }
        }

        logger.info(`Timeout order cancelled: ${order.order_no} (ID: ${order.id})`);
      });
    } catch (error) {
      logger.error(`Failed to cancel timeout order ${order.order_no}:`, error);
      throw error;
    }
  }

  /**
   * 手动触发检查（用于测试或管理后台）
   */
  async manualCheck() {
    logger.info('Manual timeout order check triggered');
    return await this.checkAndCancelTimeoutOrders();
  }

  /**
   * 获取即将超时的订单（用于提醒）
   */
  async getPendingTimeoutOrders(warningMinutes = 5) {
    try {
      const warningTime = new Date(Date.now() - (this.timeoutMinutes - warningMinutes) * 60 * 1000);
      const timeoutTime = new Date(Date.now() - this.timeoutMinutes * 60 * 1000);

      const orders = await Order.findAll({
        where: {
          status: 0,
          payment_status: 0,
          created_at: {
            [Op.gte]: warningTime,
            [Op.lt]: timeoutTime
          }
        },
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'openid']
          }
        ]
      });

      return orders;
    } catch (error) {
      logger.error('Error getting pending timeout orders:', error);
      throw error;
    }
  }
}

// 导出单例实例
const orderTimeoutService = new OrderTimeoutService();

module.exports = {
  OrderTimeoutService,
  orderTimeoutService
};
