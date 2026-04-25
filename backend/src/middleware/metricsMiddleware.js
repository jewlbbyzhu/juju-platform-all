const metricsCollector = require('../utils/metricsCollector');
const logger = require('../utils/logger');

const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    metricsCollector.recordRequest(req, res, responseTime);
    
    if (responseTime > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.path} took ${responseTime}ms`);
    }
  });
  
  next();
};

const errorMetricsMiddleware = (err, req, res, next) => {
  metricsCollector.recordError(err, req.path);
  next(err);
};

const databaseMetricsMiddleware = (sequelize) => {
  sequelize.addHook('afterQuery', (options) => {
    const queryTime = Date.now() - options.startTime;
    const isSlow = queryTime > 500;
    metricsCollector.recordDatabaseQuery(queryTime, isSlow);
  });
  
  sequelize.addHook('afterConnect', () => {
    const connections = sequelize.connectionManager.pool?.numUsed() || 0;
    metricsCollector.recordDatabaseConnection(connections);
  });
};

module.exports = {
  metricsMiddleware,
  errorMetricsMiddleware,
  databaseMetricsMiddleware
};
