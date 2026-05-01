const nodemailer = require('nodemailer');
const logger = require('../../src/utils/logger');

class AlertService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    this.alertRules = {
      errorRate: {
        threshold: 0.05,
        window: 300000,
        severity: 'critical'
      },
      responseTime: {
        threshold: 1000,
        window: 60000,
        severity: 'warning'
      },
      memoryUsage: {
        threshold: 0.8,
        window: 60000,
        severity: 'warning'
      },
      cpuUsage: {
        threshold: 0.8,
        window: 60000,
        severity: 'warning'
      },
      diskUsage: {
        threshold: 0.9,
        window: 300000,
        severity: 'critical'
      }
    };

    this.alertHistory = new Map();
    this.alertCooldown = 3600000;
  }

  async sendAlert(alert) {
    try {
      const recipients = process.env.ALERT_RECIPIENTS?.split(',') || ['admin@jujuparty.com'];

      const mailOptions = {
        from: process.env.SMTP_USER || 'alerts@jujuparty.com',
        to: recipients,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: this.generateAlertEmail(alert)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Alert sent: ${alert.title}`);

      this.alertHistory.set(alert.key, {
        lastSent: Date.now(),
        count: (this.alertHistory.get(alert.key)?.count || 0) + 1
      });

      return true;
    } catch (error) {
      logger.error('Send alert failed:', error);
      return false;
    }
  }

  generateAlertEmail(alert) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${alert.title}</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
          <p><strong>Service:</strong> ${alert.service}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          ${alert.details ? `
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <h3>Details:</h3>
              <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto;">${JSON.stringify(alert.details, null, 2)}</pre>
            </div>
          ` : ''}
          ${alert.recommendation ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <h3>Recommendation:</h3>
              <p>${alert.recommendation}</p>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #424242; color: white; padding: 20px; text-align: center; margin-top: 20px;">
          <p style="margin: 0;">JuJu Platform Monitoring System</p>
        </div>
      </div>
    `;
  }

  async checkErrorRate(metrics) {
    const rule = this.alertRules.errorRate;
    const alertKey = 'error_rate';

    if (metrics.errorRate > rule.threshold) {
      const lastAlert = this.alertHistory.get(alertKey);

      if (!lastAlert || Date.now() - lastAlert.lastSent > this.alertCooldown) {
        const alert = {
          key: alertKey,
          title: 'High Error Rate Detected',
          severity: rule.severity,
          timestamp: Date.now(),
          service: 'API',
          message: `Error rate is ${metrics.errorRate.toFixed(2)}%, exceeding threshold of ${rule.threshold * 100}%`,
          details: {
            current_error_rate: metrics.errorRate,
            threshold: rule.threshold,
            window: rule.window
          },
          recommendation: 'Check application logs for errors and investigate potential issues'
        };

        await this.sendAlert(alert);
      }
    }
  }

  async checkResponseTime(metrics) {
    const rule = this.alertRules.responseTime;
    const alertKey = 'response_time';

    if (metrics.avgResponseTime > rule.threshold) {
      const lastAlert = this.alertHistory.get(alertKey);

      if (!lastAlert || Date.now() - lastAlert.lastSent > this.alertCooldown) {
        const alert = {
          key: alertKey,
          title: 'High Response Time Detected',
          severity: rule.severity,
          timestamp: Date.now(),
          service: 'API',
          message: `Average response time is ${metrics.avgResponseTime.toFixed(2)}ms, exceeding threshold of ${rule.threshold}ms`,
          details: {
            current_response_time: metrics.avgResponseTime,
            threshold: rule.threshold,
            p95_response_time: metrics.p95ResponseTime,
            p99_response_time: metrics.p99ResponseTime
          },
          recommendation: 'Review slow queries and optimize database performance'
        };

        await this.sendAlert(alert);
      }
    }
  }

  async checkMemoryUsage(metrics) {
    const rule = this.alertRules.memoryUsage;
    const alertKey = 'memory_usage';

    if (metrics.memoryUsage > rule.threshold) {
      const lastAlert = this.alertHistory.get(alertKey);

      if (!lastAlert || Date.now() - lastAlert.lastSent > this.alertCooldown) {
        const alert = {
          key: alertKey,
          title: 'High Memory Usage Detected',
          severity: rule.severity,
          timestamp: Date.now(),
          service: 'Server',
          message: `Memory usage is ${(metrics.memoryUsage * 100).toFixed(2)}%, exceeding threshold of ${rule.threshold * 100}%`,
          details: {
            current_memory_usage: metrics.memoryUsage,
            threshold: rule.threshold,
            total_memory: metrics.totalMemory,
            used_memory: metrics.usedMemory
          },
          recommendation: 'Check for memory leaks and consider increasing available memory'
        };

        await this.sendAlert(alert);
      }
    }
  }

  async checkCpuUsage(metrics) {
    const rule = this.alertRules.cpuUsage;
    const alertKey = 'cpu_usage';

    if (metrics.cpuUsage > rule.threshold) {
      const lastAlert = this.alertHistory.get(alertKey);

      if (!lastAlert || Date.now() - lastAlert.lastSent > this.alertCooldown) {
        const alert = {
          key: alertKey,
          title: 'High CPU Usage Detected',
          severity: rule.severity,
          timestamp: Date.now(),
          service: 'Server',
          message: `CPU usage is ${(metrics.cpuUsage * 100).toFixed(2)}%, exceeding threshold of ${rule.threshold * 100}%`,
          details: {
            current_cpu_usage: metrics.cpuUsage,
            threshold: rule.threshold,
            load_average: metrics.loadAverage
          },
          recommendation: 'Check for CPU-intensive processes and optimize code'
        };

        await this.sendAlert(alert);
      }
    }
  }

  async checkDiskUsage(metrics) {
    const rule = this.alertRules.diskUsage;
    const alertKey = 'disk_usage';

    if (metrics.diskUsage > rule.threshold) {
      const lastAlert = this.alertHistory.get(alertKey);

      if (!lastAlert || Date.now() - lastAlert.lastSent > this.alertCooldown) {
        const alert = {
          key: alertKey,
          title: 'High Disk Usage Detected',
          severity: rule.severity,
          timestamp: Date.now(),
          service: 'Server',
          message: `Disk usage is ${(metrics.diskUsage * 100).toFixed(2)}%, exceeding threshold of ${rule.threshold * 100}%`,
          details: {
            current_disk_usage: metrics.diskUsage,
            threshold: rule.threshold,
            total_disk: metrics.totalDisk,
            used_disk: metrics.usedDisk,
            available_disk: metrics.availableDisk
          },
          recommendation: 'Clean up unnecessary files and consider increasing disk capacity'
        };

        await this.sendAlert(alert);
      }
    }
  }

  async checkAllMetrics(metrics) {
    try {
      await Promise.all([
        this.checkErrorRate(metrics),
        this.checkResponseTime(metrics),
        this.checkMemoryUsage(metrics),
        this.checkCpuUsage(metrics),
        this.checkDiskUsage(metrics)
      ]);

      logger.info('All metrics checked for alerts');
      return true;
    } catch (error) {
      logger.error('Check all metrics failed:', error);
      return false;
    }
  }

  async sendDailyReport(metrics) {
    try {
      const alert = {
        key: 'daily_report',
        title: 'Daily Performance Report',
        severity: 'info',
        timestamp: Date.now(),
        service: 'All',
        message: 'Daily performance summary',
        details: {
          date: new Date().toLocaleDateString(),
          total_requests: metrics.totalRequests,
          successful_requests: metrics.successfulRequests,
          failed_requests: metrics.failedRequests,
          avg_response_time: metrics.avgResponseTime,
          p95_response_time: metrics.p95ResponseTime,
          p99_response_time: metrics.p99ResponseTime,
          error_rate: metrics.errorRate,
          throughput: metrics.throughput,
          uptime: metrics.uptime,
          memory_usage: metrics.memoryUsage,
          cpu_usage: metrics.cpuUsage,
          disk_usage: metrics.diskUsage
        },
        recommendation: 'Review metrics and take action if needed'
      };

      await this.sendAlert(alert);
      logger.info('Daily report sent');
      return true;
    } catch (error) {
      logger.error('Send daily report failed:', error);
      return false;
    }
  }

  getAlertHistory() {
    const history = {};
    this.alertHistory.forEach((value, key) => {
      history[key] = value;
    });
    return history;
  }

  clearAlertHistory() {
    this.alertHistory.clear();
    logger.info('Alert history cleared');
  }
}

module.exports = new AlertService();
