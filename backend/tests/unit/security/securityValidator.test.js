/**
 * 安全验证中间件测试
 */

const request = require('supertest');
const express = require('express');
const { createSecurityValidator, validateFileUpload, securityRules } = require('../../../src/middleware/securityValidator');
const { auditLog } = require('../../../src/utils/auditLogger');

// Mock audit logger
jest.mock('../../../src/utils/auditLogger');

describe('Security Validator Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock client info
    app.use((req, res, next) => {
      req.client = { type: 'app' };
      req.ip = '127.0.0.1';
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSecurityValidator', () => {
    it('should validate valid input successfully', async () => {
      const schema = {
        username: securityRules.username,
        email: securityRules.safeString.email()
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true, data: req.validatedBody });
      });

      const response = await request(app)
        .post('/test')
        .send({
          username: 'testuser123',
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('testuser123');
    });

    it('should reject invalid input with XSS attempt', async () => {
      const schema = {
        content: securityRules.safeString
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({
          content: '<script>alert("xss")</script>'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'VALIDATION_FAILED',
          severity: 'medium'
        })
      );
    });

    it('should reject SQL injection attempts', async () => {
      const schema = {
        query: securityRules.sqlSafeString
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({
          query: '\'; DROP TABLE users; --'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate strong password requirements', async () => {
      const schema = {
        password: securityRules.password
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      // Test weak password
      let response = await request(app)
        .post('/test')
        .send({
          password: '123456'
        });

      expect(response.status).toBe(400);

      // Test strong password
      response = await request(app)
        .post('/test')
        .send({
          password: 'StrongPass123!'
        });

      expect(response.status).toBe(200);
    });

    it('should validate Chinese mobile phone numbers', async () => {
      const schema = {
        phone: securityRules.phone
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      // Valid phone numbers
      const validPhones = ['13812345678', '15987654321', '18666666666'];
      
      for (const phone of validPhones) {
        const response = await request(app)
          .post('/test')
          .send({ phone });
        
        expect(response.status).toBe(200);
      }

      // Invalid phone numbers
      const invalidPhones = ['12345678901', '1381234567', 'abcdefghijk'];
      
      for (const phone of invalidPhones) {
        const response = await request(app)
          .post('/test')
          .send({ phone });
        
        expect(response.status).toBe(400);
      }
    });

    it('should validate Chinese ID card numbers', async () => {
      const schema = {
        idCard: securityRules.idCard
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      // Valid ID card (18 digits)
      const response = await request(app)
        .post('/test')
        .send({
          idCard: '110101199001011234'
        });

      expect(response.status).toBe(200);

      // Invalid ID card
      const invalidResponse = await request(app)
        .post('/test')
        .send({
          idCard: '123456789'
        });

      expect(invalidResponse.status).toBe(400);
    });

    it('should validate bank card numbers', async () => {
      const schema = {
        bankCard: securityRules.bankCard
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      // Valid bank card (16-19 digits)
      const validCards = ['1234567890123456', '1234567890123456789'];
      
      for (const card of validCards) {
        const response = await request(app)
          .post('/test')
          .send({ bankCard: card });
        
        expect(response.status).toBe(200);
      }

      // Invalid bank card
      const response = await request(app)
        .post('/test')
        .send({
          bankCard: '123456'
        });

      expect(response.status).toBe(400);
    });

    it('should validate monetary amounts', async () => {
      const schema = {
        amount: securityRules.amount
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      // Valid amounts (in cents)
      const validAmounts = [100, 50000, 999999999];
      
      for (const amount of validAmounts) {
        const response = await request(app)
          .post('/test')
          .send({ amount });
        
        expect(response.status).toBe(200);
      }

      // Invalid amounts
      const invalidAmounts = [0, -100, 1.5, 'abc'];
      
      for (const amount of invalidAmounts) {
        const response = await request(app)
          .post('/test')
          .send({ amount });
        
        expect(response.status).toBe(400);
      }
    });

    it('should validate coordinates', async () => {
      const schema = {
        latitude: securityRules.latitude,
        longitude: securityRules.longitude
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      // Valid coordinates
      const response = await request(app)
        .post('/test')
        .send({
          latitude: 39.9042,
          longitude: 116.4074
        });

      expect(response.status).toBe(200);

      // Invalid coordinates
      const invalidResponse = await request(app)
        .post('/test')
        .send({
          latitude: 91, // Invalid latitude
          longitude: 181 // Invalid longitude
        });

      expect(invalidResponse.status).toBe(400);
    });

    it('should validate pagination parameters', async () => {
      const schema = {
        page: securityRules.page,
        pageSize: securityRules.pageSize
      };

      app.get('/test', createSecurityValidator(schema, 'query'), (req, res) => {
        res.json({ success: true, data: req.validatedQuery });
      });

      // Valid pagination
      const response = await request(app)
        .get('/test?page=1&pageSize=20');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(20);

      // Invalid pagination
      const invalidResponse = await request(app)
        .get('/test?page=0&pageSize=1001');

      expect(invalidResponse.status).toBe(400);
    });
  });

  describe('validateFileUpload', () => {
    it('should validate file upload successfully', async () => {
      app.post('/upload', validateFileUpload({
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ['image/jpeg', 'image/png'],
        maxFiles: 3
      }), (req, res) => {
        res.json({ success: true });
      });

      // Mock file upload
      app.use((req, res, next) => {
        req.files = [{
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 500 * 1024 // 500KB
        }];
        next();
      });

      const response = await request(app)
        .post('/upload');

      expect(response.status).toBe(200);
    });

    it('should reject files that are too large', async () => {
      app.use((req, res, next) => {
        req.files = [{
          originalname: 'large.jpg',
          mimetype: 'image/jpeg',
          size: 2 * 1024 * 1024 // 2MB
        }];
        next();
      });

      app.post('/upload', validateFileUpload({
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ['image/jpeg'],
        maxFiles: 1
      }), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/upload');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('too large');
    });

    it('should reject invalid file types', async () => {
      app.use((req, res, next) => {
        req.files = [{
          originalname: 'test.exe',
          mimetype: 'application/x-executable',
          size: 1024
        }];
        next();
      });

      app.post('/upload', validateFileUpload({
        maxSize: 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png'],
        maxFiles: 1
      }), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/upload');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not allowed');
    });

    it('should reject too many files', async () => {
      app.use((req, res, next) => {
        req.files = [
          { originalname: 'test1.jpg', mimetype: 'image/jpeg', size: 1024 },
          { originalname: 'test2.jpg', mimetype: 'image/jpeg', size: 1024 },
          { originalname: 'test3.jpg', mimetype: 'image/jpeg', size: 1024 },
          { originalname: 'test4.jpg', mimetype: 'image/jpeg', size: 1024 }
        ];
        next();
      });

      app.post('/upload', validateFileUpload({
        maxSize: 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        maxFiles: 3
      }), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/upload');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Too many files');
    });

    it('should reject dangerous file names', async () => {
      app.use((req, res, next) => {
        req.files = [{
          originalname: '../../../etc/passwd',
          mimetype: 'image/jpeg',
          size: 1024
        }];
        next();
      });

      app.post('/upload', validateFileUpload({
        maxSize: 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        maxFiles: 1
      }), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/upload');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('dangerous characters');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation system errors gracefully', async () => {
      // Create a schema that will cause an error
      const invalidSchema = null;

      app.post('/test', createSecurityValidator(invalidSchema), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ test: 'data' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Validation system error');
    });
  });

  describe('Audit Logging', () => {
    it('should log validation failures', async () => {
      const schema = {
        username: securityRules.username
      };

      app.post('/test', createSecurityValidator(schema), (req, res) => {
        res.json({ success: true });
      });

      await request(app)
        .post('/test')
        .send({
          username: 'invalid<script>'
        });

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'VALIDATION_FAILED',
          severity: 'medium',
          details: expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'username'
              })
            ])
          })
        })
      );
    });

    it('should log file upload rejections', async () => {
      app.use((req, res, next) => {
        req.files = [{
          originalname: 'test.exe',
          mimetype: 'application/x-executable',
          size: 1024
        }];
        next();
      });

      app.post('/upload', validateFileUpload({
        allowedTypes: ['image/jpeg']
      }), (req, res) => {
        res.json({ success: true });
      });

      await request(app)
        .post('/upload');

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'FILE_UPLOAD_REJECTED',
          severity: 'high',
          details: expect.objectContaining({
            reason: 'invalid_file_type'
          })
        })
      );
    });
  });
});
