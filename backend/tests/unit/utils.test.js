const cacheManager = require('../../src/utils/cacheManager');
const { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, DatabaseError, ExternalServiceError, errorHandler, notFound } = require('../../src/utils/errorHandler');
const logger = require('../../src/utils/logger');

jest.mock('../../src/utils/logger');

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with default message', () => {
      const error = new AppError('User not found', 404);
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
      expect(error.isOperational).toBe(true);
    });

    it('should create error with custom message and code', () => {
      const error = new AppError('Custom user not found message', 404, 'USER_NOT_FOUND');
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Custom user not found message');
      expect(error.code).toBe('USER_NOT_FOUND');
    });

    it('should create error with default status for 4xx', () => {
      const error = new AppError('Bad request', 400);
      expect(error.status).toBe('fail');
    });

    it('should create error with default status for 5xx', () => {
      const error = new AppError('Internal error', 500);
      expect(error.status).toBe('error');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Email is required', 'email');
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Email is required');
      expect(error.field).toBe('email');
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication failed');
    });

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('You do not have permission to perform this action');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Database operation failed');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error', () => {
      const error = new ExternalServiceError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.message).toBe('External service error');
    });
  });

  describe('errorHandler', () => {
    let req, res, next;
    let originalNodeEnv;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      req = {
        url: '/test',
        method: 'GET',
        body: {},
        query: {},
        params: {},
        originalUrl: '/test',
        ip: '127.0.0.1'
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle AppError', () => {
      const error = new AppError('User not found', 404, 'USER_NOT_FOUND');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'User not found',
            statusCode: 404,
            code: 'USER_NOT_FOUND'
          })
        })
      );
    });

    it('should handle ValidationError', () => {
      const error = new ValidationError('Email is required', 'email');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Email is required',
            statusCode: 400,
            code: 'VALIDATION_ERROR'
          })
        })
      );
    });

    it('should handle AuthenticationError', () => {
      const error = new AuthenticationError();
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Authentication failed',
            statusCode: 401,
            code: 'AUTHENTICATION_ERROR'
          })
        })
      );
    });

    it('should handle AuthorizationError', () => {
      const error = new AuthorizationError();
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'You do not have permission to perform this action',
            statusCode: 403,
            code: 'AUTHORIZATION_ERROR'
          })
        })
      );
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError();
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Resource not found',
            statusCode: 404,
            code: 'NOT_FOUND'
          })
        })
      );
    });

    it('should handle ConflictError', () => {
      const error = new ConflictError();
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Resource already exists',
            statusCode: 409,
            code: 'CONFLICT'
          })
        })
      );
    });

    it('should handle DatabaseError', () => {
      const error = new DatabaseError();
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Database operation failed',
          statusCode: 500,
          code: 'DATABASE_ERROR',
          stack: expect.any(String)
        }
      });
    });

    it('should handle ExternalServiceError', () => {
      const error = new ExternalServiceError();
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'External service error',
          statusCode: 502,
          code: 'EXTERNAL_SERVICE_ERROR',
          stack: expect.any(String)
        }
      });
    });

    it('should handle unknown error', () => {
      const error = new Error('Unknown error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unknown error',
          statusCode: 500,
          code: undefined,
          stack: expect.any(String)
        }
      });
    });
  });

  describe('notFound', () => {
    it('should return 404 response', () => {
      const req = {
        originalUrl: '/test'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      notFound(req, res, next);

      expect(next).toHaveBeenCalled();
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(NotFoundError);
      expect(errorArg.message).toContain('/test');
    });
  });
});

describe('Logger', () => {
  it('should export logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});

describe('Cache Manager', () => {
  describe('getCacheKey', () => {
    it('should generate cache key with prefix and identifier', () => {
      const key = cacheManager.getCacheKey('user', 123);
      expect(key).toBe('user:123');
    });

    it('should generate user cache key', () => {
      const key = cacheManager.getUserCacheKey(456);
      expect(key).toBe('user:456');
    });

    it('should generate party cache key', () => {
      const key = cacheManager.getPartyCacheKey(789);
      expect(key).toBe('party:789');
    });

    it('should generate order cache key', () => {
      const key = cacheManager.getOrderCacheKey(100);
      expect(key).toBe('order:100');
    });

    it('should generate ticket cache key', () => {
      const key = cacheManager.getTicketCacheKey(200);
      expect(key).toBe('ticket:200');
    });

    it('should generate hot parties cache key', () => {
      const key = cacheManager.getHotPartiesCacheKey(1, 20);
      expect(key).toBe('hot_parties:1:20');
    });

    it('should generate featured parties cache key', () => {
      const key = cacheManager.getFeaturedPartiesCacheKey(1, 10);
      expect(key).toBe('featured_parties:1:10');
    });

    it('should generate user stats cache key', () => {
      const key = cacheManager.getUserStatsCacheKey(300);
      expect(key).toBe('user_stats:300');
    });

    it('should generate party stats cache key', () => {
      const key = cacheManager.getPartyStatsCacheKey(400);
      expect(key).toBe('party_stats:400');
    });
  });

  describe('cache operations when disconnected', () => {
    beforeEach(() => {
      cacheManager.isConnected = false;
    });

    it('should return null when getting cache while disconnected', async () => {
      const result = await cacheManager.get('test_key');
      expect(result).toBeNull();
    });

    it('should return false when setting cache while disconnected', async () => {
      const result = await cacheManager.set('test_key', { data: 'test' });
      expect(result).toBe(false);
    });

    it('should return false when deleting cache while disconnected', async () => {
      const result = await cacheManager.del('test_key');
      expect(result).toBe(false);
    });

    it('should return false when checking exists while disconnected', async () => {
      const result = await cacheManager.exists('test_key');
      expect(result).toBe(false);
    });

    it('should return null when incrementing while disconnected', async () => {
      const result = await cacheManager.incr('counter');
      expect(result).toBeNull();
    });

    it('should return null when decrementing while disconnected', async () => {
      const result = await cacheManager.decr('counter');
      expect(result).toBeNull();
    });

    it('should return empty array when mget while disconnected', async () => {
      const result = await cacheManager.mget(['key1', 'key2']);
      expect(result).toEqual([]);
    });

    it('should return false when mset while disconnected', async () => {
      const result = await cacheManager.mset([
        ['key1', { data: 'test1' }, 3600],
        ['key2', { data: 'test2' }, 3600]
      ]);
      expect(result).toBe(false);
    });

    it('should return false when flushing db while disconnected', async () => {
      const result = await cacheManager.flushDb();
      expect(result).toBe(false);
    });
  });
});
