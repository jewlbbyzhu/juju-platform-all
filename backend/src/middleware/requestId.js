const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  
  logger.info(`[${id}] ${req.method} ${req.path}`, {
    requestId: id,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  const originalSend = res.send;
  res.send = function(data) {
    logger.info(`[${id}] Response sent`, {
      requestId: id,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime
    });
    originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
};

module.exports = requestId;
