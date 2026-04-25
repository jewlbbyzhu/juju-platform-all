const logger = require('./logger');
const metricsCollector = require('./metricsCollector');

class AlertManager {
  constructor() {
    this.alertRules = {
      responseTime: {
        warning: 1000,
        critical: 3000,
        enabled: true
      },
      errorRate: {
        warning: 0.05,
        critical: 0.1,
        enabled: true
      },
      databaseSlowQueries: {
        warning: 10,
        critical: 50,
        enabled: true
      },
      cacheHitRate: {
        warning: 0.8,
        critical: 0.6,
        enabled: true
      },
      memoryUsage: {
        warning: 0.8,
        critical: 0.9,
        enabled: true
      },
      cpuUsage: {
        warning: 0.7,
        critical: 0.9,
        enabled: true
      },
      diskUsage: {
        warning: 0.8,
        critical: 0.9,
        enabled: true
      },
      databaseConnections: {
        warning: 80,
        critical: 90,
        enabled: true
      },
      concurrentRequests: {
        warning: 100,
        critical: 200,
        enabled: true
      }
    };
    
    this.alertHistory = [];
    this.alertSilencePeriods = new Map();
    this.alertSuppressionRules = new Map();
    this.alertAggregationRules = new Map();
    this.alertEscalationRules = new Map();
    this.pendingAlerts = new Map();
    this.notificationChannels = ['email', 'log'];
  }

  setAlertRule(ruleName, config) {
    if (this.alertRules[ruleName]) {
      this.alertRules[ruleName] = { ...this.alertRules[ruleName], ...config };
    }
  }

  getAlertRule(ruleName) {
    return this.alertRules[ruleName];
  }

  addNotificationChannel(channel) {
    if (!this.notificationChannels.includes(channel)) {
      this.notificationChannels.push(channel);
    }
  }

  setAlertSilencePeriod(alertType, duration) {
    const endTime = Date.now() + duration;
    this.alertSilencePeriods.set(alertType, endTime);
  }

  isSilenced(alertType) {
    const endTime = this.alertSilencePeriods.get(alertType);
    if (!endTime) return false;
    return Date.now() < endTime;
  }

  setAlertSuppressionRule(ruleName, config) {
    this.alertSuppressionRules.set(ruleName, config);
  }

  setAlertAggregationRule(ruleName, config) {
    this.alertAggregationRules.set(ruleName, config);
  }

  setAlertEscalationRule(ruleName, config) {
    this.alertEscalationRules.set(ruleName, config);
  }

  checkAlerts() {
    const metrics = metricsCollector.getMetrics();
    const alerts = [];

    if (this.alertRules.responseTime.enabled) {
      const avgResponseTime = metrics.avgResponseTime;
      if (avgResponseTime > this.alertRules.responseTime.critical) {
        alerts.push(this.createAlert('responseTime', 'critical', avgResponseTime));
      } else if (avgResponseTime > this.alertRules.responseTime.warning) {
        alerts.push(this.createAlert('responseTime', 'warning', avgResponseTime));
      }
    }

    if (this.alertRules.errorRate.enabled) {
      const errorRate = metrics.errorRate;
      if (errorRate > this.alertRules.errorRate.critical) {
        alerts.push(this.createAlert('errorRate', 'critical', errorRate));
      } else if (errorRate > this.alertRules.errorRate.warning) {
        alerts.push(this.createAlert('errorRate', 'warning', errorRate));
      }
    }

    if (this.alertRules.databaseSlowQueries.enabled) {
      const slowQueries = metrics.database.slowQueries;
      if (slowQueries > this.alertRules.databaseSlowQueries.critical) {
        alerts.push(this.createAlert('databaseSlowQueries', 'critical', slowQueries));
      } else if (slowQueries > this.alertRules.databaseSlowQueries.warning) {
        alerts.push(this.createAlert('databaseSlowQueries', 'warning', slowQueries));
      }
    }

    if (this.alertRules.cacheHitRate.enabled) {
      const cacheHitRate = metrics.cache.hitRate;
      if (cacheHitRate < this.alertRules.cacheHitRate.critical) {
        alerts.push(this.createAlert('cacheHitRate', 'critical', cacheHitRate));
      } else if (cacheHitRate < this.alertRules.cacheHitRate.warning) {
        alerts.push(this.createAlert('cacheHitRate', 'warning', cacheHitRate));
      }
    }

    if (this.alertRules.memoryUsage.enabled) {
      const memoryUsage = metrics.system.memory.heapUsed / metrics.system.memory.heapTotal;
      if (memoryUsage > this.alertRules.memoryUsage.critical) {
        alerts.push(this.createAlert('memoryUsage', 'critical', memoryUsage));
      } else if (memoryUsage > this.alertRules.memoryUsage.warning) {
        alerts.push(this.createAlert('memoryUsage', 'warning', memoryUsage));
      }
    }

    if (this.alertRules.cpuUsage.enabled) {
      const cpuUsage = metrics.system.cpuUsage;
      if (cpuUsage > this.alertRules.cpuUsage.critical) {
        alerts.push(this.createAlert('cpuUsage', 'critical', cpuUsage));
      } else if (cpuUsage > this.alertRules.cpuUsage.warning) {
        alerts.push(this.createAlert('cpuUsage', 'warning', cpuUsage));
      }
    }

    if (this.alertRules.diskUsage.enabled) {
      const diskUsage = metrics.system.diskUsage;
      if (diskUsage > this.alertRules.diskUsage.critical) {
        alerts.push(this.createAlert('diskUsage', 'critical', diskUsage));
      } else if (diskUsage > this.alertRules.diskUsage.warning) {
        alerts.push(this.createAlert('diskUsage', 'warning', diskUsage));
      }
    }

    if (this.alertRules.databaseConnections.enabled) {
      const dbConnections = metrics.database.connections;
      if (dbConnections > this.alertRules.databaseConnections.critical) {
        alerts.push(this.createAlert('databaseConnections', 'critical', dbConnections));
      } else if (dbConnections > this.alertRules.databaseConnections.warning) {
        alerts.push(this.createAlert('databaseConnections', 'warning', dbConnections));
      }
    }

    if (this.alertRules.concurrentRequests.enabled) {
      const concurrentReqs = metrics.concurrentRequests;
      if (concurrentReqs > this.alertRules.concurrentRequests.critical) {
        alerts.push(this.createAlert('concurrentRequests', 'critical', concurrentReqs));
      } else if (concurrentReqs > this.alertRules.concurrentRequests.warning) {
        alerts.push(this.createAlert('concurrentRequests', 'warning', concurrentReqs));
      }
    }

    return this.processAlerts(alerts);
  }

  createAlert(type, severity, value) {
    return {
      id: `${type}_${Date.now()}`,
      type,
      severity,
      value,
      timestamp: new Date(),
      message: this.getAlertMessage(type, severity, value)
    };
  }

  getAlertMessage(type, severity, value) {
    const messages = {
      responseTime: `响应时间${severity === 'critical' ? '严重' : '偏高'}: ${value.toFixed(2)}ms`,
      errorRate: `错误率${severity === 'critical' ? '严重' : '偏高'}: ${(value * 100).toFixed(2)}%`,
      databaseSlowQueries: `慢查询数量${severity === 'critical' ? '严重' : '偏高'}: ${value}`,
      cacheHitRate: `缓存命中率${severity === 'critical' ? '严重' : '偏低'}: ${(value * 100).toFixed(2)}%`,
      memoryUsage: `内存使用率${severity === 'critical' ? '严重' : '偏高'}: ${(value * 100).toFixed(2)}%`,
      cpuUsage: `CPU使用率${severity === 'critical' ? '严重' : '偏高'}: ${(value * 100).toFixed(2)}%`,
      diskUsage: `磁盘使用率${severity === 'critical' ? '严重' : '偏高'}: ${(value * 100).toFixed(2)}%`,
      databaseConnections: `数据库连接数${severity === 'critical' ? '严重' : '偏高'}: ${value}`,
      concurrentRequests: `并发请求数${severity === 'critical' ? '严重' : '偏高'}: ${value}`
    };
    return messages[type] || `${type} alert: ${value}`;
  }

  processAlerts(alerts) {
    const processedAlerts = [];
    
    for (const alert of alerts) {
      if (this.isSilenced(alert.type)) {
        continue;
      }
      
      if (this.shouldSuppress(alert)) {
        continue;
      }
      
      const aggregatedAlert = this.aggregateAlert(alert);
      if (aggregatedAlert) {
        processedAlerts.push(aggregatedAlert);
      }
      
      this.sendAlert(alert);
      this.alertHistory.push(alert);
    }
    
    return processedAlerts;
  }

  shouldSuppress(alert) {
    const rule = this.alertSuppressionRules.get(alert.type);
    if (!rule) return false;
    
    const recentAlerts = this.alertHistory.filter(
      a => a.type === alert.type && 
      Date.now() - a.timestamp.getTime() < rule.suppressionWindow
    );
    
    return recentAlerts.length >= rule.maxAlerts;
  }

  aggregateAlert(alert) {
    const rule = this.alertAggregationRules.get(alert.type);
    if (!rule) return alert;
    
    const key = `${alert.type}_${alert.severity}`;
    if (!this.pendingAlerts.has(key)) {
      this.pendingAlerts.set(key, {
        alert,
        count: 1,
        startTime: Date.now()
      });
      return null;
    }
    
    const pending = this.pendingAlerts.get(key);
    pending.count++;
    
    if (Date.now() - pending.startTime >= rule.aggregationWindow) {
      const aggregatedAlert = {
        ...alert,
        id: `${alert.type}_aggregated_${Date.now()}`,
        count: pending.count,
        message: `${alert.message} (共${pending.count}次)`
      };
      this.pendingAlerts.delete(key);
      return aggregatedAlert;
    }
    
    return null;
  }

  sendAlert(alert) {
    logger.warn(`Alert triggered: ${alert.message}`, {
      type: alert.type,
      severity: alert.severity,
      value: alert.value,
      timestamp: alert.timestamp
    });
    
    for (const channel of this.notificationChannels) {
      this.sendToChannel(channel, alert);
    }
  }

  sendToChannel(channel, alert) {
    switch (channel) {
    case 'email':
      this.sendEmailAlert(alert);
      break;
    case 'sms':
      this.sendSMSAlert(alert);
      break;
    case 'wechat':
      this.sendWeChatAlert(alert);
      break;
    case 'dingtalk':
      this.sendDingTalkAlert(alert);
      break;
    case 'log':
      logger.warn(`Alert: ${alert.message}`);
      break;
    }
  }

  sendEmailAlert(alert) {
    logger.info(`Sending email alert: ${alert.message}`);
  }

  sendSMSAlert(alert) {
    logger.info(`Sending SMS alert: ${alert.message}`);
  }

  sendWeChatAlert(alert) {
    logger.info(`Sending WeChat alert: ${alert.message}`);
  }

  sendDingTalkAlert(alert) {
    logger.info(`Sending DingTalk alert: ${alert.message}`);
  }

  getAlertHistory(filters = {}) {
    let history = [...this.alertHistory];
    
    if (filters.type) {
      history = history.filter(a => a.type === filters.type);
    }
    
    if (filters.severity) {
      history = history.filter(a => a.severity === filters.severity);
    }
    
    if (filters.startTime) {
      history = history.filter(a => a.timestamp >= filters.startTime);
    }
    
    if (filters.endTime) {
      history = history.filter(a => a.timestamp <= filters.endTime);
    }
    
    return history;
  }

  getAlertStats() {
    const stats = {
      total: this.alertHistory.length,
      byType: {},
      bySeverity: {
        warning: 0,
        critical: 0
      },
      recent24h: 0,
      recent7d: 0,
      recent30d: 0
    };
    
    const now = Date.now();
    const day24 = 24 * 60 * 60 * 1000;
    const day7 = 7 * day24;
    const day30 = 30 * day24;
    
    for (const alert of this.alertHistory) {
      if (!stats.byType[alert.type]) {
        stats.byType[alert.type] = 0;
      }
      stats.byType[alert.type]++;
      
      if (alert.severity === 'warning') {
        stats.bySeverity.warning++;
      } else if (alert.severity === 'critical') {
        stats.bySeverity.critical++;
      }
      
      const age = now - alert.timestamp.getTime();
      if (age < day24) stats.recent24h++;
      if (age < day7) stats.recent7d++;
      if (age < day30) stats.recent30d++;
    }
    
    return stats;
  }
}

const alertManager = new AlertManager();

module.exports = alertManager;
