const logger = require('./logger');

class LockMetricsCollector {
  constructor() {
    this.metrics = {
      lockAcquisitions: [],
      lockReleases: [],
      lockFailures: [],
      lockWaitTimes: [],
      lockHoldTimes: []
    };
    
    this.maxMetricsSize = 1000;
  }

  recordLockAcquisition(key, waitTime, success) {
    const metric = {
      key,
      waitTime,
      success,
      timestamp: new Date()
    };

    this.metrics.lockAcquisitions.push(metric);
    this.metrics.lockWaitTimes.push({ waitTime, timestamp: metric.timestamp });

    if (this.metrics.lockAcquisitions.length > this.maxMetricsSize) {
      this.metrics.lockAcquisitions.shift();
    }

    if (this.metrics.lockWaitTimes.length > this.maxMetricsSize) {
      this.metrics.lockWaitTimes.shift();
    }

    if (waitTime > 100) {
      logger.warn(`Lock acquisition took ${waitTime}ms:`, {
        key,
        waitTime,
        threshold: 100
      });
    }
  }

  recordLockRelease(key, holdTime) {
    const metric = {
      key,
      holdTime,
      timestamp: new Date()
    };

    this.metrics.lockReleases.push(metric);
    this.metrics.lockHoldTimes.push({ holdTime, timestamp: metric.timestamp });

    if (this.metrics.lockReleases.length > this.maxMetricsSize) {
      this.metrics.lockReleases.shift();
    }

    if (this.metrics.lockHoldTimes.length > this.maxMetricsSize) {
      this.metrics.lockHoldTimes.shift();
    }

    if (holdTime > 5000) {
      logger.warn(`Lock held for ${holdTime}ms:`, {
        key,
        holdTime,
        threshold: 5000
      });
    }
  }

  recordLockFailure(key, reason) {
    const metric = {
      key,
      reason,
      timestamp: new Date()
    };

    this.metrics.lockFailures.push(metric);

    if (this.metrics.lockFailures.length > this.maxMetricsSize) {
      this.metrics.lockFailures.shift();
    }

    logger.warn('Lock acquisition failed:', {
      key,
      reason,
      timestamp: metric.timestamp.toISOString()
    });
  }

  getMetrics() {
    const now = new Date();
    const lastMinute = new Date(now - 60000);
    // const lastFiveMinutes = new Date(now - 300000); // 保留以备将来使用

    const recentWaitTimes = this.metrics.lockWaitTimes.filter(m => m.timestamp > lastMinute);
    const recentHoldTimes = this.metrics.lockHoldTimes.filter(m => m.timestamp > lastMinute);

    const avgWaitTime = this.calculateAverage(recentWaitTimes.map(m => m.waitTime));
    const avgHoldTime = this.calculateAverage(recentHoldTimes.map(m => m.holdTime));

    const p95WaitTime = this.calculatePercentile(recentWaitTimes.map(m => m.waitTime), 95);
    const p99WaitTime = this.calculatePercentile(recentWaitTimes.map(m => m.waitTime), 99);

    const p95HoldTime = this.calculatePercentile(recentHoldTimes.map(m => m.holdTime), 95);
    const p99HoldTime = this.calculatePercentile(recentHoldTimes.map(m => m.holdTime), 99);

    return {
      timestamp: now.toISOString(),
      summary: {
        totalAcquisitions: this.metrics.lockAcquisitions.length,
        totalReleases: this.metrics.lockReleases.length,
        totalFailures: this.metrics.lockFailures.length,
        recentAcquisitions: recentWaitTimes.length,
        recentFailures: this.metrics.lockFailures.filter(m => m.timestamp > lastMinute).length
      },
      waitTime: {
        average: avgWaitTime,
        p95: p95WaitTime,
        p99: p99WaitTime,
        unit: 'ms',
        recentSample: recentWaitTimes.slice(-10)
      },
      holdTime: {
        average: avgHoldTime,
        p95: p95HoldTime,
        p99: p99HoldTime,
        unit: 'ms',
        recentSample: recentHoldTimes.slice(-10)
      },
      recentFailures: this.metrics.lockFailures.slice(-10)
    };
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile / 100) - 1;
    return sorted[Math.max(0, index)];
  }

  resetMetrics() {
    this.metrics = {
      lockAcquisitions: [],
      lockReleases: [],
      lockFailures: [],
      lockWaitTimes: [],
      lockHoldTimes: []
    };
  }

  exportMetrics() {
    return {
      exportTime: new Date().toISOString(),
      metrics: this.metrics
    };
  }
}

const lockMetricsCollector = new LockMetricsCollector();

module.exports = {
  LockMetricsCollector,
  lockMetricsCollector
};
