const promClient = require('prom-client');
const logger = require('../utils/logger');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'client'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'client']
});

const httpRequestSize = new promClient.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route', 'client'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

const httpResponseSize = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code', 'client'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

const activeConnections = new promClient.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections'
});

const processCpuSeconds = new promClient.Counter({
  name: 'process_cpu_seconds_total',
  help: 'Total user and system CPU time spent in seconds'
});

const processResidentMemoryBytes = new promClient.Gauge({
  name: 'process_resident_memory_bytes',
  help: 'Resident memory size in bytes'
});

const processHeapMemoryBytes = new promClient.Gauge({
  name: 'process_heap_memory_bytes',
  help: 'Process heap size in bytes'
});

const eventLoopLagSeconds = new promClient.Gauge({
  name: 'nodejs_eventloop_lag_current_seconds',
  help: 'Current lag of event loop in seconds'
});

const eventLoopLagHistogram = new promClient.Histogram({
  name: 'nodejs_eventloop_lag_seconds',
  help: 'Lag of event loop in seconds',
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
});

function prometheusMiddleware(req, res, next) {
  const start = Date.now();
  // const startMemory = process.memoryUsage(); // TODO: 实现内存使用监控

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    const client = req.client || 'unknown';

    httpRequestDuration.observe({
      method,
      route,
      status_code: statusCode,
      client
    }, duration);

    httpRequestTotal.inc({
      method,
      route,
      status_code: statusCode,
      client
    });

    if (req.headers['content-length']) {
      httpRequestSize.observe({
        method,
        route,
        client
      }, parseInt(req.headers['content-length']));
    }

    if (res.getHeader('Content-Length')) {
      httpResponseSize.observe({
        method,
        route,
        status_code: statusCode,
        client
      }, parseInt(res.getHeader('Content-Length')));
    }

    if (duration > 1) {
      logger.warn('Slow request detected:', {
        method,
        route,
        status_code: statusCode,
        duration: `${duration}s`,
        threshold: '1s'
      });
    }
  });

  next();
}

function updateSystemMetrics() {
  const memoryUsage = process.memoryUsage();
  processResidentMemoryBytes.set(memoryUsage.rss);
  processHeapMemoryBytes.set(memoryUsage.heapUsed);

  const cpuUsage = process.cpuUsage();
  processCpuSeconds.inc(cpuUsage.user / 1000000);
  processCpuSeconds.inc(cpuUsage.system / 1000000);

  const eventLoopDelay = measureEventLoopLag();
  eventLoopLagSeconds.set(eventLoopDelay / 1000);
  eventLoopLagHistogram.observe(eventLoopDelay / 1000);
}

function measureEventLoopLag() {
  const start = process.hrtime.bigint();
  return new Promise((resolve) => {
    setImmediate(() => {
      const end = process.hrtime.bigint();
      const diff = end - start;
      const diffInMs = Number(diff) / 1000000n;
      resolve(diffInMs);
    });
  });
}

function incrementActiveConnections() {
  activeConnections.inc();
}

function decrementActiveConnections() {
  activeConnections.dec();
}

async function collectDatabaseMetrics() {
  try {
    const { sequelize } = require('../config/database');
    const [result] = await sequelize.query('SHOW GLOBAL STATUS');
    
    const metrics = {};
    result.forEach(row => {
      metrics[row.Variable_name] = row.Value;
    });

    logger.debug('Database metrics collected:', {
      connections: metrics.Threads_connected,
      queries: metrics.Queries,
      slowQueries: metrics.Slow_queries,
      uptime: metrics.Uptime
    });
  } catch (error) {
    logger.error('Failed to collect database metrics:', error);
  }
}

async function collectRedisMetrics() {
  try {
    const redis = require('../config/redis').redisClient;
    const info = await redis.info('stats');
    
    const stats = {};
    info.split('\r\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key] = value;
      }
    });

    logger.debug('Redis metrics collected:', {
      connections: stats.connected_clients,
      commands: stats.total_commands_processed,
      keyspace: stats.db0
    });
  } catch (error) {
    logger.error('Failed to collect Redis metrics:', error);
  }
}

function startMetricsCollection(interval = 15000) {
  setInterval(() => {
    updateSystemMetrics();
    collectDatabaseMetrics();
    collectRedisMetrics();
  }, interval);

  logger.info('Metrics collection started', {
    interval: `${interval}ms`
  });
}

function stopMetricsCollection() {
  clearInterval(metricsInterval);
  logger.info('Metrics collection stopped');
}

const metricsInterval = null;

module.exports = {
  prometheusMiddleware,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestSize,
  httpResponseSize,
  activeConnections,
  processCpuSeconds,
  processResidentMemoryBytes,
  processHeapMemoryBytes,
  eventLoopLagSeconds,
  eventLoopLagHistogram,
  updateSystemMetrics,
  collectDatabaseMetrics,
  collectRedisMetrics,
  startMetricsCollection,
  stopMetricsCollection,
  incrementActiveConnections,
  decrementActiveConnections,
  register: promClient.register,
  metrics: promClient.register.metrics
};