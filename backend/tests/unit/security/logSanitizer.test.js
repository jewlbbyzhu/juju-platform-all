/**
 * 日志脱敏工具测试
 */

const {
  sanitizeForLog,
  sanitizeObject,
  sanitizeString,
  sanitizeRequest,
  sanitizeResponse,
  createSanitizationMiddleware
} = require('../../../src/utils/logSanitizer');

describe('Log Sanitizer', () => {
  describe('sanitizeString', () => {
    it('should sanitize phone numbers in strings', () => {
      const input = 'User phone: 13812345678, contact: 15987654321';
      const result = sanitizeString(input);
      
      expect(result).not.toContain('13812345678');
      expect(result).not.toContain('15987654321');
      expect(result).toContain('138****5678');
      expect(result).toContain('159****4321');
    });

    it('should sanitize ID card numbers', () => {
      const input = 'ID: 110101199001011234';
      const result = sanitizeString(input);
      
      expect(result).not.toContain('110101199001011234');
      expect(result).toContain('110101********1234');
    });

    it('should sanitize email addresses', () => {
      const input = 'Email: user@example.com';
      const result = sanitizeString(input);
      
      expect(result).not.toContain('user@example.com');
      expect(result).toContain('us***r@example.com');
    });

    it('should sanitize JWT tokens', () => {
      const input = 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = sanitizeString(input);
      
      expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result).toContain('ey***');
    });

    it('should sanitize bank card numbers', () => {
      const input = 'Card: 6222021234567890123';
      const result = sanitizeString(input);
      
      expect(result).not.toContain('6222021234567890123');
      expect(result).toContain('622202****90123');
    });

    it('should sanitize IP addresses', () => {
      const input = 'IP: 192.168.1.100';
      const result = sanitizeString(input);
      
      expect(result).not.toContain('192.168.1.100');
      expect(result).toContain('192***');
    });

    it('should not modify non-sensitive strings', () => {
      const input = 'This is a normal string without sensitive data';
      const result = sanitizeString(input);
      
      expect(result).toBe(input);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize sensitive fields by name', () => {
      const input = {
        username: 'testuser',
        password: 'secret123',
        phone: '13812345678',
        email: 'user@example.com',
        normalField: 'normal value'
      };

      const result = sanitizeObject(input);

      expect(result.username).toBe('testuser'); // Not sensitive
      expect(result.password).toBe('[HIDDEN]'); // Sensitive field
      expect(result.phone).toBe('138****5678'); // Partial hide
      expect(result.email).toBe('us***r@example.com'); // Partial hide
      expect(result.normalField).toBe('normal value'); // Not sensitive
    });

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          id: 123,
          phone: '13812345678',
          profile: {
            idCard: '110101199001011234',
            address: 'Beijing Chaoyang District'
          }
        },
        metadata: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
          timestamp: Date.now()
        }
      };

      const result = sanitizeObject(input);

      expect(result.user.id).toBe(123);
      expect(result.user.phone).toBe('138****5678');
      expect(result.user.profile.idCard).toBe('110101********1234');
      expect(result.user.profile.address).toBe('[SANITIZED]');
      expect(result.metadata.token).toBe('[SANITIZED]');
      expect(result.metadata.timestamp).toBe(input.metadata.timestamp);
    });

    it('should handle arrays', () => {
      const input = {
        users: [
          { phone: '13812345678', name: 'User1' },
          { phone: '15987654321', name: 'User2' }
        ]
      };

      const result = sanitizeObject(input);

      expect(result.users).toHaveLength(2);
      expect(result.users[0].phone).toBe('138****5678');
      expect(result.users[0].name).toBe('User1');
      expect(result.users[1].phone).toBe('159****4321');
      expect(result.users[1].name).toBe('User2');
    });

    it('should handle null and undefined values', () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined,
        phone: null,
        password: undefined
      };

      const result = sanitizeObject(input);

      expect(result.nullValue).toBeNull();
      expect(result.undefinedValue).toBeUndefined();
      expect(result.phone).toBeNull();
      expect(result.password).toBeUndefined();
    });

    it('should handle Date objects', () => {
      const date = new Date();
      const input = {
        createdAt: date,
        phone: '13812345678'
      };

      const result = sanitizeObject(input);

      expect(result.createdAt).toBe(date);
      expect(result.phone).toBe('138****5678');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error with phone 13812345678');
      const input = {
        error: error,
        message: 'Error occurred'
      };

      const result = sanitizeObject(input);

      expect(result.error.name).toBe('Error');
      expect(result.error.message).toContain('138****5678');
      expect(result.error.stack).toBeDefined();
      expect(result.message).toBe('Error occurred');
    });

    it('should prevent infinite recursion', () => {
      const input = { phone: '13812345678' };
      input.self = input; // Circular reference

      const result = sanitizeObject(input);

      expect(result.phone).toBe('138****5678');
      // Test that circular references are detected and depth limit is enforced
      expect(result.self.self).toBe('[MAX_DEPTH_REACHED]');
    });

    it('should handle values matching sensitive patterns', () => {
      const input = {
        description: 'Contact me at 13812345678 or user@example.com',
        notes: 'ID card: 110101199001011234'
      };

      const result = sanitizeObject(input);

      expect(result.description).toContain('138****5678');
      expect(result.description).toContain('us***r@example.com');
      expect(result.notes).toContain('110101********1234');
    });
  });

  describe('sanitizeRequest', () => {
    it('should sanitize HTTP request data', () => {
      const req = {
        method: 'POST',
        url: '/api/users?token=secret123',
        headers: {
          'user-agent': 'Mozilla/5.0',
          'content-type': 'application/json',
          'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
          'cookie': 'session=abc123'
        },
        body: {
          phone: '13812345678',
          password: 'secret123'
        },
        query: {
          search: 'user@example.com'
        },
        params: {
          id: '123'
        },
        ip: '192.168.1.100',
        client: { type: 'app' }
      };

      const result = sanitizeRequest(req);

      expect(result.method).toBe('POST');
      expect(result.url).toContain('token=***');
      expect(result.headers.authorization).toBe('[HIDDEN]');
      expect(result.headers.cookie).toBe('[HIDDEN]');
      expect(result.body.phone).toBe('138****5678');
      expect(result.body.password).toBe('[HIDDEN]');
      expect(result.query.search).toContain('us***r@example.com');
      expect(result.params.id).toBe('123');
      expect(result.ip).toBe('192***');
      expect(result.client).toEqual({ type: 'app' });
    });
  });

  describe('sanitizeResponse', () => {
    it('should sanitize HTTP response data', () => {
      const res = {
        statusCode: 200,
        getHeader: jest.fn((name) => {
          const headers = {
            'content-type': 'application/json',
            'content-length': '150'
          };
          return headers[name];
        })
      };

      const data = {
        success: true,
        data: {
          user: {
            id: 123,
            phone: '13812345678',
            email: 'user@example.com'
          }
        }
      };

      const result = sanitizeResponse(res, data);

      expect(result.statusCode).toBe(200);
      expect(result.headers['content-type']).toBe('application/json');
      expect(result.data.data.user.id).toBe(123);
      expect(result.data.data.user.phone).toBe('138****5678');
      expect(result.data.data.user.email).toBe('us***r@example.com');
    });
  });

  describe('createSanitizationMiddleware', () => {
    it('should create middleware that sanitizes request logs', () => {
      const middleware = createSanitizationMiddleware({
        logRequests: true,
        logResponses: false
      });

      const req = {
        method: 'POST',
        url: '/api/test',
        headers: { 'user-agent': 'test' },
        body: { phone: '13812345678' },
        query: {},
        params: {},
        ip: '127.0.0.1',
        client: { type: 'app' }
      };

      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.sanitizedLog).toBeDefined();
      expect(req.sanitizedLog.body.phone).toBe('138****5678');
      expect(next).toHaveBeenCalled();
    });

    it('should create middleware that sanitizes response logs', () => {
      const middleware = createSanitizationMiddleware({
        logRequests: false,
        logResponses: true,
        maxBodySize: 1000
      });

      const req = {};
      const res = {
        send: jest.fn(),
        getHeader: jest.fn(() => 'application/json')
      };
      const next = jest.fn();

      middleware(req, res, next);

      const testData = JSON.stringify({
        success: true,
        data: { phone: '13812345678' }
      });

      res.send(testData);

      expect(res.sanitizedResponse).toBeDefined();
      expect(res.sanitizedResponse.data.data.phone).toBe('138****5678');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle sanitization errors gracefully', () => {
      const input = {
        // Create a circular reference that might cause issues
        toString: () => { throw new Error('toString error'); }
      };

      const result = sanitizeForLog(input);
      expect(result).toBe('[SANITIZATION_ERROR]');
    });

    it('should handle non-string, non-object inputs', () => {
      expect(sanitizeForLog(123)).toBe(123);
      expect(sanitizeForLog(true)).toBe(true);
      expect(sanitizeForLog(null)).toBeNull();
      expect(sanitizeForLog(undefined)).toBeUndefined();
    });

    it('should handle empty objects and arrays', () => {
      expect(sanitizeForLog({})).toEqual({});
      expect(sanitizeForLog([])).toEqual([]);
    });

    it('should handle very large objects within depth limits', () => {
      const largeObject = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`field${i}`] = `value${i}`;
      }
      largeObject.phone = '13812345678';

      const result = sanitizeForLog(largeObject);
      expect(result.phone).toBe('138****5678');
      expect(Object.keys(result)).toHaveLength(1001);
    });
  });
});