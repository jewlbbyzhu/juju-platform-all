const request = require('supertest');
const express = require('express');
const { dataAdapter, setAdaptType, skipAdapter } = require('../../../src/middleware/dataAdapter');

// Mock the adapter factory
jest.mock('../../../src/utils/adapters', () => {
  return {
    getAdapter: jest.fn((clientType) => {
      return {
        adaptResponse: jest.fn((data) => {
          // Mock adapter that adds a prefix based on client type
          if (Array.isArray(data)) {
            return data.map(item => ({ ...item, adapted: true, clientType }));
          }
          return { ...data, adapted: true, clientType };
        }),
        constructor: { name: `${clientType}Adapter` }
      };
    })
  };
});

describe('Data Adapter Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock client identifier middleware
    app.use((req, res, next) => {
      req.client = req.headers['x-client-type'] || 'web-admin';
      next();
    });
    
    jest.clearAllMocks();
  });

  describe('dataAdapter middleware', () => {
    test('should adapt response data based on client type', async () => {
      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({
          success: true,
          data: { id: 1, name: 'Test' },
          message: 'Success'
        });
      });

      const response = await request(app)
        .get('/test')
        .set('x-client-type', 'wechat-miniprogram')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.adapted).toBe(true);
      expect(response.body.data.clientType).toBe('miniprogram');
      expect(response.body.message).toBe('Success');
    });

    test('should adapt array data', async () => {
      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({
          success: true,
          data: [{ id: 1 }, { id: 2 }]
        });
      });

      const response = await request(app)
        .get('/test')
        .set('x-client-type', 'uni-app')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].adapted).toBe(true);
      expect(response.body.data[0].clientType).toBe('app');
    });

    test('should adapt direct data without success wrapper', async () => {
      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({
          success: true,
          data: { id: 1, name: 'Test' }
        });
      });

      const response = await request(app)
        .get('/test')
        .set('x-client-type', 'web-admin')
        .expect(200);

      expect(response.body.data.adapted).toBe(true);
      expect(response.body.data.clientType).toBe('web');
    });

    test('should handle adapter errors gracefully', async () => {
      // Mock adapter to throw error
      const AdapterFactory = require('../../../src/utils/adapters');
      AdapterFactory.getAdapter.mockReturnValue({
        adaptResponse: jest.fn(() => {
          throw new Error('Adapter error');
        }),
        constructor: { name: 'TestAdapter' }
      });

      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({ success: true, data: { id: 1 } });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      // Should return original data when adapter fails
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    test('should include adapter info in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({
          success: true,
          data: { id: 1 }
        });
      });

      const response = await request(app)
        .get('/test')
        .set('x-client-type', 'wechat-miniprogram')
        .expect(200);

      expect(response.body._adapter).toBeDefined();
      expect(response.body._adapter.clientType).toBe('miniprogram');
      expect(response.body._adapter.adapterClass).toBe('miniprogramAdapter');

      process.env.NODE_ENV = originalEnv;
    });

    test('should not include adapter info in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({
          success: true,
          data: { id: 1 }
        });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body._adapter).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('setAdaptType middleware', () => {
    test('should set adapt type for request', async () => {
      app.use(setAdaptType('party-list'));
      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        expect(req.adaptType).toBe('party-list');
        res.json({ success: true, data: { id: 1 } });
      });

      await request(app).get('/test').expect(200);
    });
  });

  describe('skipAdapter middleware', () => {
    test('should skip data adaptation', async () => {
      app.use(skipAdapter);
      app.use(dataAdapter);
      app.get('/test', (req, res) => {
        res.json({
          success: true,
          data: { id: 1, name: 'Test' }
        });
      });

      const response = await request(app)
        .get('/test')
        .set('x-client-type', 'wechat-miniprogram')
        .expect(200);

      // Data should not be adapted
      expect(response.body.data.adapted).toBeUndefined();
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Test');
    });
  });

});
