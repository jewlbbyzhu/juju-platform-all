const { PushSetting } = require('../models');
const logger = require('../utils/logger');

class PushSettingService {
  async getSettings(userId) {
    try {
      let settings = await PushSetting.findOne({
        where: { user_id: userId }
      });

      if (!settings) {
        settings = await PushSetting.create({
          user_id: userId,
          notification_enabled: true,
          order_notification: true,
          payment_notification: true,
          refund_notification: true,
          party_notification: true,
          chat_notification: true,
          vip_notification: true,
          marketing_notification: false,
          quiet_hours_enabled: false,
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00'
        });
      }

      return settings;
    } catch (error) {
      logger.error('Get push settings error:', error);
      throw error;
    }
  }

  async updateSettings(userId, settingsData) {
    try {
      const allowedFields = [
        'notification_enabled',
        'order_notification',
        'payment_notification',
        'refund_notification',
        'party_notification',
        'chat_notification',
        'vip_notification',
        'marketing_notification',
        'quiet_hours_enabled',
        'quiet_hours_start',
        'quiet_hours_end'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (settingsData[field] !== undefined) {
          updates[field] = settingsData[field];
        }
      }

      let settings = await PushSetting.findOne({
        where: { user_id: userId }
      });

      if (!settings) {
        settings = await PushSetting.create({
          user_id: userId,
          ...updates
        });
      } else {
        await settings.update(updates);
        settings = await PushSetting.findByPk(settings.id);
      }

      return settings;
    } catch (error) {
      logger.error('Update push settings error:', error);
      throw error;
    }
  }

  async isNotificationEnabled(userId, type) {
    try {
      const settings = await this.getSettings(userId);

      if (!settings.notification_enabled) {
        return false;
      }

      if (settings.quiet_hours_enabled) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const start = settings.quiet_hours_start;
        const end = settings.quiet_hours_end;

        if (start <= end) {
          if (currentTime >= start && currentTime < end) {
            return false;
          }
        } else {
          if (currentTime >= start || currentTime < end) {
            return false;
          }
        }
      }

      const typeMapping = {
        'order': 'order_notification',
        'payment': 'payment_notification',
        'refund': 'refund_notification',
        'party': 'party_notification',
        'chat': 'chat_notification',
        'vip': 'vip_notification',
        'marketing': 'marketing_notification'
      };

      const field = typeMapping[type];
      return field ? settings[field] : true;
    } catch (error) {
      logger.error('Check notification enabled error:', error);
      return true;
    }
  }

  async shouldSendNotification(userId, notificationType) {
    return this.isNotificationEnabled(userId, notificationType);
  }

  async resetSettings(userId) {
    try {
      await PushSetting.destroy({
        where: { user_id: userId }
      });

      return await this.getSettings(userId);
    } catch (error) {
      logger.error('Reset push settings error:', error);
      throw error;
    }
  }
}

module.exports = new PushSettingService();
