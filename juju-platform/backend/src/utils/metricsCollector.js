const logger = require('./logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        byPath: {},
        byMethod: {}
      },
      responseTime: {
        total: 0,
        count: 0,
        byPath: {},
        p50: 0,
        p95: 0,
        p99: 0
      },
      errors: {
        total: 0,
        byType: {},
        byPath: {}
      },
      database: {
        queries: 0,
        slowQueries: 0,
        avgTime: 0,
        connections: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      system: {
        memory: {},
        cpu: {},
        disk: {},
        network: {}
      }
    };
    this.responseTimes = [];
  }

  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }
    
    const path = req.path || req.route?.path || 'unknown';
    const method = req.method;
    
    if (!this.metrics.requests.byPath[path]) {
      this.metrics.requests.byPath[path] = { total: 0, success: 0, error: 0 };
    }
    this.metrics.requests.byPath[path].total++;
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.byPath[path].success++;
    } else {
      this.metrics.requests.byPath[path].error++;
    }
    
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = { total: 0, success: 0, error: 0 };
    }
    this.metrics.requests.byMethod[method].total++;
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.byMethod[method].success++;
    } else {
      this.metrics.requests.byMethod[method].error++;
    }
    
    this.recordResponseTime(path, responseTime);
  }

  recordResponseTime(path, responseTime) {
    this.metrics.responseTime.total += responseTime;
    this.metrics.responseTime.count++;
    this.responseTimes.push(responseTime);
    
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
    
    if (!this.metrics.responseTime.byPath[path]) {
      this.metrics.responseTime.byPath[path] = { total: 0, count: 0, avg: 0, max: 0 };
    }
    this.metrics.responseTime.byPath[path].total += responseTime;
    this.metrics.responseTime.byPath[path].count++;
    this.metrics.responseTime.byPath[path].avg = 
      this.metrics.responseTime.byPath[path].total / this.metrics.responseTime.byPath[path].count;
    this.metrics.responseTime.byPath[path].max = 
      Math.max(this.metrics.responseTime.byPath[path].max || 0, responseTime);
    
    this.calculatePercentiles();
  }

  calculatePercentiles() {
    if (this.responseTimes.length === 0) return;
    
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;
    
    this.metrics.responseTime.p50 = sorted[Math.floor(len * 0.5)];
    this.metrics.responseTime.p95 = sorted[Math.floor(len * 0.95)];
    this.metrics.responseTime.p99 = sorted[Math.floor(len * 0.99)];
  }

  recordError(error, path) {
    this.metrics.errors.total++;
    const errorType = error.name || 'Error';
    
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;
    
    if (!this.metrics.errors.byPath[path]) {
      this.metrics.errors.byPath[path] = 0;
    }
    this.metrics.errors.byPath[path]++;
  }

  recordDatabaseQuery(queryTime, isSlow = false) {
    this.metrics.database.queries++;
    this.metrics.database.avgTime = 
      (this.metrics.database.avgTime * (this.metrics.database.queries - 1) + queryTime) / 
      this.metrics.database.queries;
    
    if (isSlow) {
      this.metrics.database.slowQueries++;
      logger.warn(`Slow query detected: ${queryTime}ms`);
    }
  }

  recordDatabaseConnection(connections) {
    this.metrics.database.connections = connections;
  }

  recordCacheHit() {
    this.metrics.cache.hits++;
    this.updateCacheHitRate();
  }

  recordCacheMiss() {
    this.metrics.cache.misses++;
    this.updateCacheHitRate();
  }

  updateCacheHitRate() {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? this.metrics.cache.hits / total : 0;
  }

  recordSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    this.metrics.system.memory = {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers
    };
    
    const cpuUsage = process.cpuUsage();
    this.metrics.system.cpu = {
      user: cpuUsage.user,
      system: cpuUsage.system
    };
  }

  getMetrics() {
    this.recordSystemMetrics();
    return {
      ...this.metrics,
      errorRate: this.metrics.requests.total > 0 
        ? this.metrics.requests.error / this.metrics.requests.total 
        : 0,
      avgResponseTime: this.metrics.responseTime.count > 0 
        ? this.metrics.responseTime.total / this.metrics.responseTime.count 
        : 0
    };
  }

  reset() {
    this.metrics.requests = {
      total: 0,
      success: 0,
      error: 0,
      byPath: {},
      byMethod: {}
    };
    this.metrics.responseTime = {
      total: 0,
      count: 0,
      byPath: {},
      p50: 0,
      p95: 0,
      p99: 0
    };
    this.responseTimes = [];
    this.metrics.errors = {
      total: 0,
      byType: {},
      byPath: {}
    };
  }
}

const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;
