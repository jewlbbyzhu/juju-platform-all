const { Notification } = require('../models');
const logger = require('../utils/logger');

class NotificationService {
  async createNotification(userId, notificationData) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data || null,
        is_read: false
      });

      return await this.getNotificationById(notification.id);
    } catch (error) {
      logger.error('Create notification failed:', error);
      throw error;
    }
  }

  async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      logger.error('Get notification by ID failed:', error);
      throw error;
    }
  }

  async getNotificationList(userId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = { user_id: userId };

      if (filters.type !== undefined) {
        where.type = filters.type;
      }

      if (filters.is_read !== undefined) {
        where.is_read = filters.is_read;
      }

      const { count, rows } = await Notification.findAndCountAll({
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
      logger.error('Get notification list failed:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          user_id: userId
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.is_read = true;
      notification.read_at = new Date();
      await notification.save();

      return await this.getNotificationById(notification.id);
    } catch (error) {
      logger.error('Mark as read failed:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.update(
        {
          is_read: true,
          read_at: new Date()
        },
        {
          where: {
            user_id: userId,
            is_read: false
          }
        }
      );

      const updatedCount = await Notification.count({
        where: {
          user_id: userId,
          is_read: true
        }
      });

      return {
        message: 'All notifications marked as read',
        total_read: updatedCount
      };
    } catch (error) {
      logger.error('Mark all as read failed:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          user_id: userId
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.destroy();
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      logger.error('Delete notification failed:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: {
          user_id: userId,
          is_read: false
        }
      });

      return {
        unread_count: count
      };
    } catch (error) {
      logger.error('Get unread count failed:', error);
      throw error;
    }
  }

  async getNotificationStats(userId) {
    try {
      const totalNotifications = await Notification.count({
        where: { user_id: userId }
      });

      const unreadNotifications = await Notification.count({
        where: {
          user_id: userId,
          is_read: false
        }
      });

      const readNotifications = await Notification.count({
        where: {
          user_id: userId,
          is_read: true
        }
      });

      const notificationsByType = await Notification.findAll({
        where: { user_id: userId },
        attributes: ['type', [require('sequelize').fn('COUNT', '*')]],
        group: ['type']
      });

      const typeStats = {};
      for (const stat of notificationsByType) {
        typeStats[stat.type] = stat.dataValues.count;
      }

      return {
        total: totalNotifications,
        unread: unreadNotifications,
        read: readNotifications,
        by_type: typeStats
      };
    } catch (error) {
      logger.error('Get notification stats failed:', error);
      throw error;
    }
  }

  async sendOrderNotification(userId, order) {
    try {
      return await this.createNotification(userId, {
        type: 'order',
        title: '订单状态更新',
        content: `您的订单${order.order_no}状态已更新`,
        data: {
          order_id: order.id,
          order_no: order.order_no,
          status: order.status
        }
      });
    } catch (error) {
      logger.error('Send order notification failed:', error);
      throw error;
    }
  }

  async sendPaymentNotification(userId, payment) {
    try {
      return await this.createNotification(userId, {
        type: 'payment',
        title: '支付成功',
        content: `您的支付已成功，金额：${payment.amount}元`,
        data: {
          payment_id: payment.id,
          payment_no: payment.payment_no,
          amount: payment.amount
        }
      });
    } catch (error) {
      logger.error('Send payment notification failed:', error);
      throw error;
    }
  }

  async sendRefundNotification(userId, refund) {
    try {
      return await this.createNotification(userId, {
        type: 'refund',
        title: '退款通知',
        content: `您的退款申请已处理，金额：${refund.amount}元`,
        data: {
          refund_id: refund.id,
          refund_no: refund.refund_no,
          amount: refund.amount,
          status: refund.status
        }
      });
    } catch (error) {
      logger.error('Send refund notification failed:', error);
      throw error;
    }
  }

  async sendSystemNotification(userId, title, content) {
    try {
      return await this.createNotification(userId, {
        type: 'system',
        title: title,
        content: content,
        data: null
      });
    } catch (error) {
      logger.error('Send system notification failed:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
