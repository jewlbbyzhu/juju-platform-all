const settlementService = require('../services/settlementService');
const logger = require('../utils/logger');

class SettlementController {
  async getSettlementList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined
      };

      const result = await settlementService.getSettlementList(page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get settlement list error:', error);
      next(error);
    }
  }

  async getSettlementById(req, res, next) {
    try {
      const settlement = await settlementService.getSettlementById(req.params.id);
      res.json({
        success: true,
        data: settlement
      });
    } catch (error) {
      logger.error('Get settlement by ID error:', error);
      next(error);
    }
  }

  async processSettlement(req, res, next) {
    try {
      const settlement = await settlementService.processSettlement(req.params.id);
      res.json({
        success: true,
        message: 'Settlement processed successfully',
        data: settlement
      });
    } catch (error) {
      logger.error('Process settlement error:', error);
      next(error);
    }
  }

  async getSettlementStats(req, res, next) {
    try {
      const stats = await settlementService.getSettlementStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get settlement stats error:', error);
      next(error);
    }
  }
}

module.exports = new SettlementController();
