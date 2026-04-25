const os = require('os');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Redis } = require('../config/redis');
const { Order, Payment, User, Party, Ticket } = require('../models');
const logger = require('../utils/logger');
// const alertManager = require('../utils/alertManager'); // 保留以备将来使用
const metricsCollector = require('../utils/metricsCollector');

class SystemMonitoringService {
  async getSystemOverview() {
    try {
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const loadAvg = os.loadavg();

      const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: loadAvg
      };

      const processInfo = {
        pid: process.pid,
        uptime: uptime,
        memoryUsage: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss
        },
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      };

      const dbStats = await this.getDatabaseStats();
      const redisStats = await this.getRedisStats();
      const apiStats = await this.getAPIStats();

      return {
        system: systemInfo,
        process: processInfo,
        database: dbStats,
        redis: redisStats,
        api: apiStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Get system overview error:', error);
      throw error;
    }
  }

  async getDatabaseStats() {
    try {
      const [results] = await sequelize.query(`
        SHOW GLOBAL STATUS LIKE 'Questions'
      `);
      
      const queries = results[0]?.Value || 0;

      const [connectionResults] = await sequelize.query(`
        SHOW GLOBAL STATUS LIKE 'Threads_connected'
      `);
      
      const connections = connectionResults[0]?.Value || 0;

      const tableCount = await sequelize.query(`
        SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()
      `);

      return {
        status: 'connected',
        queries: parseInt(queries),
        activeConnections: parseInt(connections),
        tableCount: tableCount[0][0]?.count || 0
      };
    } catch (error) {
      logger.error('Get database stats error:', error);
      return {
        status: 'disconnected',
        error: error.message
      };
    }
  }

  async getRedisStats() {
    try {
      const redis = Redis.getClient();
      if (!redis) {
        return { status: 'not_configured' };
      }

      const info = await redis.info('memory');
      const clientInfo = await redis.info('clients');

      return {
        status: 'connected',
        memory: info,
        clients: clientInfo
      };
    } catch (error) {
      logger.error('Get redis stats error:', error);
      return {
        status: 'disconnected',
        error: error.message
      };
    }
  }

  async getAPIStats() {
    try {
      const metrics = metricsCollector.getMetrics();
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentOrders = await Order.count({
        where: { created_at: { [Op.gt]: oneHourAgo } }
      });
      
      const recentPayments = await Payment.count({
        where: { created_at: { [Op.gt]: oneHourAgo } }
      });

      const recentUsers = await User.count({
        where: { created_at: { [Op.gt]: oneHourAgo } }
      });

      return {
        requestCount: metrics?.requestCount || 0,
        errorCount: metrics?.errorCount || 0,
        responseTime: metrics?.avgResponseTime || 0,
        recentOrders,
        recentPayments,
        recentUsers
      };
    } catch (error) {
      logger.error('Get API stats error:', error);
      return {
        error: error.message
      };
    }
  }

  async getBusinessMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = await Order.count({
        where: { created_at: { [Op.gte]: today } }
      });

      const todayPayments = await Payment.count({
        where: { 
          created_at: { [Op.gte]: today },
          status: 'success'
        }
      });

      const todayRevenue = await Payment.sum('amount', {
        where: { 
          created_at: { [Op.gte]: today },
          status: 'success'
        }
      }) || 0;

      const totalUsers = await User.count();
      const totalParties = await Party.count({ where: { status: 1 } });
      const totalTickets = await Ticket.count({ where: { status: 'active' } });

      const activeParties = await Party.count({
        where: { 
          status: 1,
          start_time: { [Op.gte]: new Date() }
        }
      });

      return {
        today: {
          orders: todayOrders,
          payments: todayPayments,
          revenue: todayRevenue
        },
        totals: {
          users: totalUsers,
          parties: totalParties,
          tickets: totalTickets,
          activeParties
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Get business metrics error:', error);
      throw error;
    }
  }

  async getHealthDetails() {
    try {
      const checks = {
        database: await this.checkDatabaseHealth(),
        redis: await this.checkRedisHealth(),
        storage: await this.checkStorageHealth(),
        externalServices: await this.checkExternalServices()
      };

      const overallStatus = Object.values(checks).every(c => c.status === 'healthy') 
        ? 'healthy' 
        : Object.values(checks).some(c => c.status === 'unhealthy') 
          ? 'degraded' 
          : 'unhealthy';

      return {
        status: overallStatus,
        checks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Get health details error:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async checkDatabaseHealth() {
    try {
      await sequelize.query('SELECT 1');
      return { status: 'healthy', latency: 0 };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkRedisHealth() {
    try {
      const redis = Redis.getClient();
      if (!redis) {
        return { status: 'not_configured' };
      }
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkStorageHealth() {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const stats = await require('fs').promises.stat(uploadDir);
      return {
        status: 'healthy',
        uploadDirSize: stats.size
      };
    } catch (error) {
      return { status: 'warning', error: error.message };
    }
  }

  async checkExternalServices() {
    const services = {
      wechatPay: await this.checkWechatPay(),
      alipay: await this.checkAlipay(),
      sms: await this.checkSMS()
    };

    const allHealthy = Object.values(services).every(s => s.status === 'healthy');
    const anyUnhealthy = Object.values(services).some(s => s.status === 'unhealthy');

    return {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
      services
    };
  }

  async checkWechatPay() {
    return { status: 'healthy', configured: !!process.env.WECHAT_MCHID };
  }

  async checkAlipay() {
    return { status: 'healthy', configured: !!process.env.ALIPAY_APPID };
  }

  async checkSMS() {
    return { status: 'healthy', configured: !!process.env.SMS_API_KEY };
  }

  async getLogs(params = {}) {
    try {
      const { level, startTime, endTime, page = 1, pageSize = 100 } = params;
      
      const logs = [];
      const logDir = process.env.LOG_DIR || './logs';
      
      try {
        const fs = require('fs');
        const files = await fs.promises.readdir(logDir);
        
        for (const file of files) {
          if (file.endsWith('.log')) {
            const filePath = `${logDir}/${file}`;
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const lines = content.split('\n').filter(Boolean);
            
            for (const line of lines) {
              try {
                const logEntry = JSON.parse(line);
                logs.push(logEntry);
              } catch (e) {
                // Skip invalid log entries
              }
            }
          }
        }
      } catch (e) {
        // Continue if log file cannot be read
      }

      let filteredLogs = logs;
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }
      if (startTime) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startTime));
      }
      if (endTime) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endTime));
      }

      const offset = (page - 1) * pageSize;
      const paginatedLogs = filteredLogs.slice(offset, offset + pageSize);

      return {
        total: filteredLogs.length,
        page,
        pageSize,
        data: paginatedLogs
      };
    } catch (error) {
      logger.error('Get logs error:', error);
      throw error;
    }
  }
}

module.exports = new SystemMonitoringService();
