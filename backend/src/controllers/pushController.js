const PushMessage = require('../models/PushMessage');
const PushSetting = require('../models/PushSetting');
// const { Op } = require('sequelize'); // 保留以备将来使用

const pushController = {
  async getPushMessages(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { user_id: req.user.id };
      if (status) {
        where.status = status;
      }

      const messages = await PushMessage.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await PushMessage.count({ where });

      res.json({
        success: true,
        data: messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取推送消息列表失败'
      });
    }
  },

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;

      const message = await PushMessage.findOne({
        where: { id: messageId }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      if (message.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      await message.update({ status: 'read', read_at: new Date() });

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '标记已读失败'
      });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await PushMessage.update(
        { status: 'read', read_at: new Date() },
        {
          where: {
            user_id: req.user.id,
            status: 'unread'
          }
        }
      );

      res.json({
        success: true,
        message: 'All messages marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '标记全部已读失败'
      });
    }
  },

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;

      const message = await PushMessage.findOne({
        where: { id: messageId }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      if (message.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      await message.destroy();

      res.json({
        success: true,
        message: 'Message deleted'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除消息失败'
      });
    }
  },

  async clearAllMessages(req, res) {
    try {
      await PushMessage.destroy({
        where: { user_id: req.user.id }
      });

      res.json({
        success: true,
        message: 'All messages cleared'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '清空消息失败'
      });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = await PushMessage.count({
        where: {
          user_id: req.user.id,
          status: 'unread'
        }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取未读数失败'
      });
    }
  },

  async getPushSettings(req, res) {
    try {
      let settings = await PushSetting.findOne({
        where: { user_id: req.user.id }
      });

      if (!settings) {
        settings = await PushSetting.create({
          user_id: req.user.id,
          party_notification: true,
          order_notification: true,
          message_notification: true,
          system_notification: true,
          marketing_notification: false
        });
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取推送设置失败'
      });
    }
  },

  async updatePushSettings(req, res) {
    try {
      const {
        party_notification,
        order_notification,
        message_notification,
        system_notification,
        marketing_notification
      } = req.body;

      let settings = await PushSetting.findOne({
        where: { user_id: req.user.id }
      });

      if (!settings) {
        settings = await PushSetting.create({
          user_id: req.user.id,
          party_notification: party_notification ?? true,
          order_notification: order_notification ?? true,
          message_notification: message_notification ?? true,
          system_notification: system_notification ?? true,
          marketing_notification: marketing_notification ?? false
        });
      } else {
        await settings.update({
          party_notification: party_notification ?? settings.party_notification,
          order_notification: order_notification ?? settings.order_notification,
          message_notification: message_notification ?? settings.message_notification,
          system_notification: system_notification ?? settings.system_notification,
          marketing_notification: marketing_notification ?? settings.marketing_notification
        });
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新推送设置失败'
      });
    }
  },

  async enablePush(req, res) {
    try {
      const { type } = req.params;

      const settings = await PushSetting.findOne({
        where: { user_id: req.user.id }
      });

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      const validTypes = ['party', 'order', 'message', 'system', 'marketing'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type'
        });
      }

      const field = `${type}_notification`;
      await settings.update({ [field]: true });

      res.json({
        success: true,
        message: `${type} notification enabled`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '启用推送失败'
      });
    }
  },

  async disablePush(req, res) {
    try {
      const { type } = req.params;

      const settings = await PushSetting.findOne({
        where: { user_id: req.user.id }
      });

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      const validTypes = ['party', 'order', 'message', 'system', 'marketing'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type'
        });
      }

      const field = `${type}_notification`;
      await settings.update({ [field]: false });

      res.json({
        success: true,
        message: `${type} notification disabled`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '禁用推送失败'
      });
    }
  }
};

module.exports = pushController;
