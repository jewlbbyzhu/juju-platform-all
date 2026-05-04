const systemMonitoringService = require('../services/systemMonitoringService');
const alertManager = require('../utils/alertManager');
const metricsCollector = require('../utils/metricsCollector');
/* eslint-disable no-unused-vars */
const logger = require('../utils/logger');

class MonitoringController {
  async getMetrics(req, res, next) {
    try {
      const metrics = metricsCollector.getMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Get metrics error:', error);
      next(error);
    }
  }

  async getSystemOverview(req, res, next) {
    try {
      const overview = await systemMonitoringService.getSystemOverview();
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      logger.error('Get system overview error:', error);
      next(error);
    }
  }

  async getHealthDetails(req, res, next) {
    try {
      const health = await systemMonitoringService.getHealthDetails();
      const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json({
        success: health.status !== 'unhealthy',
        data: health
      });
    } catch (error) {
      logger.error('Get health details error:', error);
      res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  async getBusinessMetrics(req, res, next) {
    try {
      const metrics = await systemMonitoringService.getBusinessMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Get business metrics error:', error);
      next(error);
    }
  }

  async getDatabaseStats(req, res, next) {
    try {
      const stats = await systemMonitoringService.getDatabaseStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get database stats error:', error);
      next(error);
    }
  }

  async getRedisStats(req, res, next) {
    try {
      const stats = await systemMonitoringService.getRedisStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get redis stats error:', error);
      next(error);
    }
  }

  async getAPIStats(req, res, next) {
    try {
      const stats = await systemMonitoringService.getAPIStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get API stats error:', error);
      next(error);
    }
  }

  async getAlertHistory(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        severity: req.query.severity,
        startTime: req.query.startTime ? new Date(req.query.startTime) : undefined,
        endTime: req.query.endTime ? new Date(req.query.endTime) : undefined
      };
      
      const history = alertManager.getAlertHistory(filters);
      
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;
      
      const paginatedHistory = history.slice(offset, offset + pageSize);
      
      res.json({
        success: true,
        data: {
          total: history.length,
          page,
          pageSize,
          data: paginatedHistory
        }
      });
    } catch (error) {
      logger.error('Get alert history error:', error);
      next(error);
    }
  }

  async getAlertStats(req, res, next) {
    try {
      const stats = alertManager.getAlertStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get alert stats error:', error);
      next(error);
    }
  }

  async checkAlerts(req, res, next) {
    try {
      const alerts = alertManager.checkAlerts();
      res.json({
        success: true,
        data: {
          alerts,
          count: alerts.length
        }
      });
    } catch (error) {
      logger.error('Check alerts error:', error);
      next(error);
    }
  }

  async updateAlertRule(req, res, next) {
    try {
      const { ruleName, config } = req.body;
      alertManager.setAlertRule(ruleName, config);
      res.json({
        success: true,
        message: 'Alert rule updated successfully'
      });
    } catch (error) {
      logger.error('Update alert rule error:', error);
      next(error);
    }
  }

  async setAlertSilencePeriod(req, res, next) {
    try {
      const { alertType, duration } = req.body;
      alertManager.setAlertSilencePeriod(alertType, duration);
      res.json({
        success: true,
        message: 'Alert silence period set successfully'
      });
    } catch (error) {
      logger.error('Set alert silence period error:', error);
      next(error);
    }
  }

  async addNotificationChannel(req, res, next) {
    try {
      const { channel } = req.body;
      alertManager.addNotificationChannel(channel);
      res.json({
        success: true,
        message: 'Notification channel added successfully'
      });
    } catch (error) {
      logger.error('Add notification channel error:', error);
      next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const params = {
        level: req.query.level,
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 100
      };

      const logs = await systemMonitoringService.getLogs(params);
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      logger.error('Get logs error:', error);
      next(error);
    }
  }
}

module.exports = new MonitoringController();
