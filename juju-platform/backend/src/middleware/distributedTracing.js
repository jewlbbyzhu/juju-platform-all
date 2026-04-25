const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const traceStore = new Map();

function distributedTracing(req, res, next) {
  const traceId = req.headers['x-trace-id'] || uuidv4();
  const spanId = uuidv4();
  const parentSpanId = req.headers['x-span-id'] || null;
  
  req.traceId = traceId;
  req.spanId = spanId;
  req.parentSpanId = parentSpanId;
  req.startTime = Date.now();
  
  res.setHeader('X-Trace-Id', traceId);
  res.setHeader('X-Span-Id', spanId);
  
  const traceData = {
    traceId,
    spanId,
    parentSpanId,
    startTime: req.startTime,
    path: req.path,
    method: req.method,
    client: req.client,
    userId: req.user?.id || null
  };
  
  traceStore.set(spanId, traceData);
  
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    
    if (data && typeof data === 'object') {
      data._trace = {
        traceId,
        spanId,
        duration: `${duration}ms`,
        ...(parentSpanId && { parentSpanId })
      };
    }
    
    traceData.endTime = Date.now();
    traceData.duration = duration;
    traceData.statusCode = res.statusCode;
    
    if (duration > 1000) {
      logger.warn('Slow request detected:', {
        traceId,
        spanId,
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
    }
    
    originalJson(data);
  };
  
  const originalSend = res.send.bind(res);
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    
    traceData.endTime = Date.now();
    traceData.duration = duration;
    traceData.statusCode = res.statusCode;
    
    if (duration > 1000) {
      logger.warn('Slow request detected:', {
        traceId,
        spanId,
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
    }
    
    originalSend(data);
  };
  
  res.on('finish', () => {
    traceData.endTime = Date.now();
    traceData.duration = Date.now() - req.startTime;
    traceData.statusCode = res.statusCode;
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Request completed:', {
        traceId,
        spanId,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        duration: `${traceData.duration}ms`
      });
    }
    
    setTimeout(() => {
      traceStore.delete(spanId);
    }, 60000);
  });
  
  next();
}

function getTraceData(spanId) {
  return traceStore.get(spanId);
}

function getAllActiveTraces() {
  return Array.from(traceStore.values());
}

function clearOldTraces(maxAge = 300000) {
  const now = Date.now();
  let clearedCount = 0;
  
  for (const [spanId, traceData] of traceStore.entries()) {
    if (now - traceData.startTime > maxAge) {
      traceStore.delete(spanId);
      clearedCount++;
    }
  }
  
  if (clearedCount > 0) {
    logger.info(`Cleared ${clearedCount} old traces`);
  }
  
  return clearedCount;
}

setInterval(() => {
  clearOldTraces(300000);
}, 60000);

module.exports = {
  distributedTracing,
  getTraceData,
  getAllActiveTraces,
  clearOldTraces
};