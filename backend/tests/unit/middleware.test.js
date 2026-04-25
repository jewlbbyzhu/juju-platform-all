const { auth, adminAuth } = require('../../src/middleware/auth');
const errorHandler = require('../../src/middleware/errorHandler');
const { dataAdapter } = require('../../src/middleware/dataAdapter');
const requestLogger = require('../../src/middleware/logger');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('auth', () => {
    it('should call next if valid token is provided', () => {
      const decodedToken = { id: 1, role: 'user' };
      req.headers.authorization = 'Bearer test-access-token';
      jwt.verify.mockReturnValue(decodedToken);

      auth(req, res, next);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(req.user).toEqual({
        id: 1,
        username: 'test_user',
        role: 'user',
        tokenType: 'access'
      });
      expect(req.token).toBe('test-access-token');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', () => {
      auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: expect.any(String),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: expect.any(String),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('adminAuth', () => {
    it('should call next if user is admin', () => {
      req.user = { id: 1, role: 'admin' };
      req.headers.authorization = 'Bearer test-admin-token';

      adminAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not admin', () => {
      req.user = { id: 1, role: 'user' };

      adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: expect.any(String),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not set', () => {
      adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        code: expect.any(String),
        error: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      url: '/test',
      method: 'GET',
      client: 'web',
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should handle error with status code', () => {
    const error = new Error('Test error');
    error.statusCode = 400;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Test error',
      code: expect.any(String),
      error: expect.any(Object)
    });
  });

  it('should handle error without status code', () => {
    const error = new Error('Internal error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal error',
      code: expect.any(String),
      error: expect.any(Object)
    });
  });

  it('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const error = new Error('Development error');
    error.stack = 'Error stack trace';

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Development error',
      code: expect.any(String),
      error: expect.any(Object)
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const error = new Error('Production error');
    error.stack = 'Error stack trace';

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalled();
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.success).toBe(false);
    expect(jsonCall.message).toBe('Production error');
    expect(jsonCall.code).toBe('INTERNAL_SERVER_ERROR');
    expect(jsonCall.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(jsonCall.error.message).toBe('Production error');
    expect(jsonCall.error).not.toHaveProperty('stack');

    process.env.NODE_ENV = originalEnv;
  });
});

describe('Data Adapter Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      client: 'web'
    };
    res = {
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next without modifying response', () => {
    dataAdapter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(typeof res.json).toBe('function');
  });

  it('should replace res.json with wrapper function', () => {
    const originalJson = res.json;
    dataAdapter(req, res, next);

    expect(res.json).not.toBe(originalJson);
    expect(typeof res.json).toBe('function');
  });

  it('should handle different client types', () => {
    const clients = ['wechat-miniprogram', 'uni-app', 'web-admin', 'unknown'];

    clients.forEach(client => {
      req.client = client;
      res.json = jest.fn();
      dataAdapter(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(typeof res.json).toBe('function');
    });
  });

  it('should handle null client', () => {
    req.client = null;
    dataAdapter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(typeof res.json).toBe('function');
  });
});

describe('Request Logger Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      client: 'web',
      ip: '127.0.0.1'
    };
    res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      })
    };
    next = jest.fn();
  });

  it('should call next', () => {
    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should log request on finish', () => {
    requestLogger(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log request with correct information', () => {
    requestLogger(req, res, next);

    const finishCallback = res.on.mock.calls[0][1];
    finishCallback();

    expect(res.on).toHaveBeenCalled();
  });

  it('should handle different HTTP methods', () => {
    req.method = 'POST';
    req.url = '/api/parties';

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle different status codes', () => {
    res.statusCode = 404;

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
