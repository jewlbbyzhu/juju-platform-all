const logger = require('../utils/logger');
// 保留错误类导入以备将来使用
/* eslint-disable no-unused-vars */
const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError
} = require('../utils/errors');
/* eslint-enable no-unused-vars */
const { reportError } = require('../utils/errorReporter');

const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  const sensitiveFields = ['password', 'paymentPassword', 'token', 'secret', 'creditCard', 'idCard'];
  const sanitized = { ...body };
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '***';
    }
  });
  return sanitized;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const duration = Date.now() - (req.metadata?.startTime || Date.now());
  const requestId = req.metadata?.requestId || 'unknown';
  
  logger.error(`[${requestId}] Error occurred:`, {
    message: err.message,
    stack: err.stack,
    type: err.type,
    url: req.url,
    method: req.method,
    client: req.client,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    },
    duration: `${duration}ms`
  });

  reportError(err, {
    url: req.url,
    method: req.method,
    userAgent: req.headers['user-agent'],
    client: req.client,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    },
    requestId
  });

  // const isTest = process.env.NODE_ENV === 'test';
  // const isProduction = process.env.NODE_ENV === 'production';

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.type,
      errors: err.errors,
      error: {
        code: err.type,
        message: err.message,
        details: err.details
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse = {
    success: false,
    message: message,
    code: err.type || 'INTERNAL_SERVER_ERROR',
    error: {
      code: err.type || 'INTERNAL_SERVER_ERROR',
      message
    }
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
