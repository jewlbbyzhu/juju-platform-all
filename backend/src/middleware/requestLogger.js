const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  const originalSend = res.send;
  
  res.send = function(data) {
    res.responseTime = Date.now() - startTime;
    originalSend.call(this, data);
  };
  
  res.on('finish', () => {
    const { method, originalUrl, ip, headers } = req;
    const { statusCode } = res;
    const responseTime = res.responseTime || Date.now() - startTime;
    const contentLength = res.get('Content-Length') || 0;
    
    const logData = {
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: `${contentLength}b`,
      ip: ip || req.connection.remoteAddress,
      userAgent: headers['user-agent'],
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };
    
    if (statusCode >= 500) {
      logger.error('Server Error:', logData);
    } else if (statusCode >= 400) {
      logger.warn('Client Error:', logData);
    } else if (statusCode >= 300) {
      logger.info('Redirect:', logData);
    } else {
      logger.info('Request:', logData);
    }
  });
  
  next();
}

function logRequestBody(req, res, next) {
  const originalJson = req.json;
  
  req.json = function() {
    logger.debug('Request body:', {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      userId: req.user?.id
    });
    return originalJson.apply(this, arguments);
  };
  
  next();
}

function logQueryParams(req, res, next) {
  if (Object.keys(req.query).length > 0) {
    logger.debug('Query params:', {
      url: req.originalUrl,
      method: req.method,
      query: req.query,
      userId: req.user?.id
    });
  }
  next();
}

function logRouteParams(req, res, next) {
  if (Object.keys(req.params).length > 0) {
    logger.debug('Route params:', {
      url: req.originalUrl,
      method: req.method,
      params: req.params,
      userId: req.user?.id
    });
  }
  next();
}

function slowRequestLogger(threshold = 3000) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      if (responseTime > threshold) {
        logger.warn('Slow request detected:', {
          url: req.originalUrl,
          method: req.method,
          responseTime: `${responseTime}ms`,
          threshold: `${threshold}ms`,
          userId: req.user?.id
        });
      }
    });
    
    next();
  };
}

function errorRequestLogger(err, req, res, next) {
  logger.error('Request error:', {
    url: req.originalUrl,
    method: req.method,
    error: err.message,
    stack: err.stack,
    userId: req.user?.id,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  next(err);
}

module.exports = {
  requestLogger,
  logRequestBody,
  logQueryParams,
  logRouteParams,
  slowRequestLogger,
  errorRequestLogger
};
