/* eslint-disable no-unused-vars */
const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'External service error') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  } else {
    sendErrorDev(err, res);
  }
}

function sendErrorDev(err, res) {
  const errorResponse = {
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code
    }
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(err.statusCode).json(errorResponse);
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        code: err.code
      }
    });
  } else {
    logger.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}

function notFound(req, res, next) {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function handleSequelizeError(error) {
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(err => err.message);
    return new ValidationError(messages.join(', '));
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path;
    return new ConflictError(`${field} already exists`);
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Invalid reference to related resource');
  }
  
  if (error.name === 'SequelizeConnectionError') {
    return new DatabaseError('Database connection failed');
  }
  
  return new DatabaseError('Database operation failed');
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  errorHandler,
  notFound,
  asyncHandler,
  handleSequelizeError
};
