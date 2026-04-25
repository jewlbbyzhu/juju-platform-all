const pushSettingService = require('../services/pushSettingService');
const logger = require('../utils/logger');

class PushSettingController {
  async getSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settings = await pushSettingService.getSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Get push settings error:', error);
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settingsData = req.body;

      const settings = await pushSettingService.updateSettings(userId, settingsData);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Update push settings error:', error);
      next(error);
    }
  }

  async resetSettings(req, res, next) {
    try {
      const userId = req.user.id;

      const settings = await pushSettingService.resetSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Reset push settings error:', error);
      next(error);
    }
  }
}

module.exports = new PushSettingController();
