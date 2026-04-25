const autoCancelService = require('../services/autoCancelService');
const logger = require('../utils/logger');

class ScheduleController {
  async triggerAutoCancel(req, res) {
    try {
      logger.info('Manual trigger of auto-cancel task');
      
      const result = await autoCancelService.checkAndCancelParties();
      
      res.json({
        code: 0,
        message: '自动取消检查完成',
        data: result
      });
    } catch (error) {
      logger.error('Auto-cancel trigger failed:', error);
      res.status(500).json({
        code: 500,
        message: '自动取消检查失败',
        error: error.message
      });
    }
  }

  async getPartiesToCancel(req, res) {
    try {
      const parties = await autoCancelService.getPartiesToCancel();
      
      res.json({
        code: 0,
        message: '获取待取消聚会列表成功',
        data: parties
      });
    } catch (error) {
      logger.error('Get parties to cancel failed:', error);
      res.status(500).json({
        code: 500,
        message: '获取待取消聚会列表失败',
        error: error.message
      });
    }
  }
}

module.exports = new ScheduleController();
