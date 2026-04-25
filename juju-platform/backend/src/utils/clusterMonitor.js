const os = require('os');
const cluster = require('cluster');
const logger = require('../utils/logger');

class ClusterMonitor {
  constructor() {
    this.workers = new Map();
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalSlowRequests: 0,
      startTime: Date.now()
    };
    this.monitorInterval = null;
  }

  startMonitoring(interval = 5000) {
    logger.info('Starting cluster monitoring...', {
      interval: `${interval}ms`
    });

    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
      this.logMetrics();
    }, interval);
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      logger.info('Cluster monitoring stopped');
    }
  }

  collectMetrics() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const metrics = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      cpu: {
        count: cpus.length,
        loadAverage: os.loadavg(),
        usage: this.getCPUUsage()
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: (usedMemory / totalMemory) * 100
      },
      workers: this.getWorkerMetrics(),
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    return metrics;
  }

  getCPUUsage() {
    const cpus = os.cpus();
    const usage = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
      return {
        model: cpu.model,
        speed: cpu.speed,
        times: cpu.times,
        total
      };
    });

    return usage;
  }

  getWorkerMetrics() {
    const metrics = [];
    
    if (process.env.CLUSTER_ENABLED === 'true' && cluster.isMaster) {
      const workers = cluster.workers;
      
      for (const [pid, worker] of Object.entries(workers)) {
        const workerMetrics = {
          pid: parseInt(pid),
          state: worker.state,
          connected: worker.isConnected(),
          uptime: Date.now() - worker.connectedAt,
          requests: this.workers.get(pid)?.requests || 0,
          errors: this.workers.get(pid)?.errors || 0,
          slowRequests: this.workers.get(pid)?.slowRequests || 0
        };
        
        metrics.push(workerMetrics);
      }
    }

    return metrics;
  }

  logMetrics() {
    const metrics = this.collectMetrics();
    
    logger.info('Cluster metrics:', {
      timestamp: new Date(metrics.timestamp).toISOString(),
      uptime: `${metrics.uptime.toFixed(2)}s`,
      cpu: {
        count: metrics.cpu.count,
        loadAverage: metrics.cpu.loadAverage.map(l => l.toFixed(2)),
        usagePercent: metrics.cpu.usage.map(u => 
          (u.total / 1000000).toFixed(2)
        )
      },
      memory: {
        total: `${(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
        used: `${(metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)}GB`,
        free: `${(metrics.memory.free / 1024 / 1024 / 1024).toFixed(2)}GB`,
        usagePercent: `${metrics.memory.usagePercent.toFixed(2)}%`
      },
      workers: metrics.workers.length > 0 ? {
        count: metrics.workers.length,
        active: metrics.workers.filter(w => w.state === 'online').length,
        dead: metrics.workers.filter(w => w.state === 'dead').length,
        disconnected: metrics.workers.filter(w => !w.connected).length,
        details: metrics.workers.map(w => ({
          pid: w.pid,
          state: w.state,
          connected: w.connected,
          uptime: `${(w.uptime / 1000).toFixed(2)}s`,
          requests: w.requests,
          errors: w.errors,
          slowRequests: w.slowRequests
        }))
      } : null,
      process: {
        pid: metrics.process.pid,
        memory: {
          rss: `${(metrics.process.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(metrics.process.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(metrics.process.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          external: `${(metrics.process.memoryUsage.external / 1024 / 1024).toFixed(2)}MB`
        },
        cpu: {
          user: `${(metrics.process.cpuUsage.user / 1000000).toFixed(2)}s`,
          system: `${(metrics.process.cpuUsage.system / 1000000).toFixed(2)}s`
        }
      }
    });
  }

  recordWorkerRequest(workerPid, duration, isError = false) {
    if (!this.workers.has(workerPid)) {
      this.workers.set(workerPid, {
        requests: 0,
        errors: 0,
        slowRequests: 0
      });
    }

    const worker = this.workers.get(workerPid);
    worker.requests++;
    this.metrics.totalRequests++;

    if (isError) {
      worker.errors++;
      this.metrics.totalErrors++;
    }

    if (duration > 1000) {
      worker.slowRequests++;
      this.metrics.totalSlowRequests++;
    }
  }

  getSummary() {
    const uptime = (Date.now() - this.metrics.startTime) / 1000;
    const requestsPerSecond = this.metrics.totalRequests / uptime;
    const errorRate = (this.metrics.totalErrors / this.metrics.totalRequests) * 100;
    const slowRequestRate = (this.metrics.totalSlowRequests / this.metrics.totalRequests) * 100;

    return {
      uptime: `${uptime.toFixed(2)}s`,
      totalRequests: this.metrics.totalRequests,
      requestsPerSecond: requestsPerSecond.toFixed(2),
      totalErrors: this.metrics.totalErrors,
      errorRate: `${errorRate.toFixed(2)}%`,
      totalSlowRequests: this.metrics.totalSlowRequests,
      slowRequestRate: `${slowRequestRate.toFixed(2)}%`,
      workers: this.getWorkerMetrics()
    };
  }

  checkWorkerHealth() {
    const workers = this.getWorkerMetrics();
    const issues = [];

    for (const worker of workers) {
      if (!worker.connected) {
        issues.push({
          type: 'disconnected',
          pid: worker.pid,
          message: `Worker ${worker.pid} is disconnected`
        });
      }

      if (worker.state === 'dead') {
        issues.push({
          type: 'dead',
          pid: worker.pid,
          message: `Worker ${worker.pid} is dead`
        });
      }

      if (worker.errors > 100) {
        issues.push({
          type: 'high_error_rate',
          pid: worker.pid,
          message: `Worker ${worker.pid} has high error rate: ${worker.errors}`
        });
      }

      if (worker.slowRequests > 50) {
        issues.push({
          type: 'high_slow_request_rate',
          pid: worker.pid,
          message: `Worker ${worker.pid} has high slow request rate: ${worker.slowRequests}`
        });
      }
    }

    if (issues.length > 0) {
      logger.warn('Cluster health issues detected:', issues);
    }

    return issues;
  }

  restartDeadWorkers() {
    if (process.env.CLUSTER_ENABLED !== 'true' || !cluster.isMaster) {
      return;
    }

    const workers = cluster.workers;
    let restartedCount = 0;

    for (const [pid, worker] of Object.entries(workers)) {
      if (worker.state === 'dead' || worker.exitedAfterDisconnect) {
        logger.info(`Restarting dead worker ${pid}`);
        cluster.fork();
        restartedCount++;
      }
    }

    if (restartedCount > 0) {
      logger.info(`Restarted ${restartedCount} dead workers`);
    }

    return restartedCount;
  }
}

const clusterMonitor = new ClusterMonitor();

if (process.env.CLUSTER_ENABLED === 'true' && cluster.isMaster) {
  clusterMonitor.startMonitoring(5000);

  cluster.on('fork', (worker) => {
    logger.info(`Worker ${worker.process.pid} forked`);
    worker.connectedAt = Date.now();
  });

  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('listening', (worker, address) => {
    logger.info(`Worker ${worker.process.pid} is listening on ${address.port}`);
  });

  cluster.on('disconnect', (worker) => {
    logger.warn(`Worker ${worker.process.pid} disconnected`);
  });

  cluster.on('exit', (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} exited`, {
      code,
      signal
    });

    clusterMonitor.checkWorkerHealth();

    if (!worker.exitedAfterDisconnect) {
      logger.info('Starting a new worker...');
      cluster.fork();
    }
  });
}

module.exports = clusterMonitor;