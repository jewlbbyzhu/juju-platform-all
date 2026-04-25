const { Notification } = require('../models');
const logger = require('../utils/logger');

class NotificationController {
  async createNotification(req, res, next) {
    try {
      const { title, content, type } = req.body;
      
      const notification = await Notification.create({
        user_id: req.user.id,
        title,
        content,
        type,
        is_read: false
      });
      
      res.json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      logger.error('Create notification error:', error);
      next(error);
    }
  }

  async getNotificationDetail(req, res, next) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('Get notification detail error:', error);
      next(error);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const type = req.query.type;

      const offset = (page - 1) * pageSize;
      const where = { user_id: req.user.id };

      if (type) {
        where.type = type;
      }

      const { count, rows } = await Notification.findAndCountAll({
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
      logger.error('Get notifications error:', error);
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.is_read = true;
      await notification.save();

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user.id } }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      logger.error('Delete notification error:', error);
      next(error);
    }
  }

  async markAsUnread(req, res, next) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.is_read = false;
      await notification.save();

      res.json({
        success: true,
        message: 'Notification marked as unread'
      });
    } catch (error) {
      logger.error('Mark notification as unread error:', error);
      next(error);
    }
  }

  async deleteReadNotifications(req, res, next) {
    try {
      await Notification.destroy({
        where: {
          user_id: req.user.id,
          is_read: true
        }
      });

      res.json({
        success: true,
        message: 'Read notifications deleted successfully'
      });
    } catch (error) {
      logger.error('Delete read notifications error:', error);
      next(error);
    }
  }

  async deleteAllNotifications(req, res, next) {
    try {
      await Notification.destroy({
        where: {
          user_id: req.user.id
        }
      });

      res.json({
        success: true,
        message: 'All notifications deleted successfully'
      });
    } catch (error) {
      logger.error('Delete all notifications error:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await Notification.count({
        where: {
          user_id: req.user.id,
          is_read: false
        }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      next(error);
    }
  }

  async getNotificationStatistics(req, res, next) {
    try {
      const total = await Notification.count({
        where: { user_id: req.user.id }
      });

      const unread = await Notification.count({
        where: {
          user_id: req.user.id,
          is_read: false
        }
      });

      const read = total - unread;

      res.json({
        success: true,
        data: { total, unread, read }
      });
    } catch (error) {
      logger.error('Get notification statistics error:', error);
      next(error);
    }
  }

  async getNotificationsByType(req, res, next) {
    try {
      const type = req.params.type;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const offset = (page - 1) * pageSize;
      const where = { user_id: req.user.id, type };

      const { count, rows } = await Notification.findAndCountAll({
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
      logger.error('Get notifications by type error:', error);
      next(error);
    }
  }
}

module.exports = new NotificationController();
