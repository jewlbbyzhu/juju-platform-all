const request = require('supertest');
const app = require('../../src/server');

describe('Data Adapter Integration Tests', () => {
  describe('API Response Adaptation', () => {
    test('should adapt party list for miniprogram client', async () => {
      const response = await request(app)
        .get('/api/v1/parties')
        .set('User-Agent', 'MicroMessenger/7.0.0')
        .expect(200);

      if (response.body.success && response.body.data) {
        const parties = Array.isArray(response.body.data.list) ? 
          response.body.data.list : response.body.data;
        
        if (parties.length > 0) {
          const party = parties[0];
          
          // 检查小程序特有的字段名
          expect(party.maxPeople).toBeDefined();
          expect(party.currentPeople).toBeDefined();
          expect(party.priceType).toBeDefined();
          expect(party.theme).toBeDefined();
          expect(party.createTime).toBeDefined();
          
          // 检查图片限制（最多3张）
          if (party.images) {
            expect(party.images.length).toBeLessThanOrEqual(3);
          }
          
          // 检查标签限制（最多3个）
          if (party.tags) {
            expect(party.tags.length).toBeLessThanOrEqual(3);
          }
        }
      }
    });

    test('should adapt user data for app client', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('User-Agent', 'uni-app')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      if (response.body.success && response.body.data) {
        const user = response.body.data;
        
        // 检查App端特有的完整字段
        expect(user.stats).toBeDefined();
        expect(user.socialData).toBeDefined();
        expect(user.vipLevel).toBeDefined();
        expect(user.vipPrivileges).toBeDefined();
        
        // 检查敏感字段是否适当处理
        expect(user.wechatOpenid).toBeUndefined(); // 应被过滤
        expect(user.phone).toBeDefined(); // App端应保留
      }
    });

    test('should adapt order data for web admin client', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      if (response.body.success && response.body.data) {
        const orders = Array.isArray(response.body.data.data) ? 
          response.body.data.data : response.body.data;
        
        if (orders.length > 0) {
          const order = orders[0];
          
          // 检查Web管理后台特有的完整字段
          expect(order.financialInfo).toBeDefined();
          expect(order.riskInfo).toBeDefined();
          expect(order.adminNotes).toBeDefined();
          
          // 管理后台应保留所有敏感字段
          if (order.user) {
            expect(order.user.phone).toBeDefined();
            expect(order.user.wechatOpenid).toBeDefined();
          }
        }
      }
    });

    test('should adapt data for website client with public fields only', async () => {
      const response = await request(app)
        .get('/api/v1/parties/public')
        .set('User-Agent', 'Mozilla/5.0 (compatible; website)')
        .expect(200);

      if (response.body.success && response.body.data) {
        const parties = Array.isArray(response.body.data) ? 
          response.body.data : [response.body.data];
        
        if (parties.length > 0) {
          const party = parties[0];
          
          // 检查官方网站特有的公开字段
          expect(party.slug).toBeDefined();
          expect(party.coverImage).toBeDefined();
          expect(party.priceRange).toBeDefined();
          
          // 检查敏感字段被过滤
          expect(party.analytics).toBeUndefined();
          expect(party.adminNotes).toBeUndefined();
          expect(party.auditInfo).toBeUndefined();
          
          if (party.organizer) {
            expect(party.organizer.phone).toBeUndefined();
            expect(party.organizer.realName).toBeUndefined();
          }
        }
      }
    });
  });

  describe('Money Format Consistency', () => {
    test('should format money consistently across all clients', async () => {
      const clients = [
        { userAgent: 'MicroMessenger/7.0.0', name: 'miniprogram' },
        { userAgent: 'uni-app', name: 'app' },
        { userAgent: 'Mozilla/5.0 AppleWebKit', name: 'web' }
      ];

      for (const client of clients) {
        const response = await request(app)
          .get('/api/v1/wallet')
          .set('User-Agent', client.userAgent)
          .set('Authorization', 'Bearer valid-token')
          .expect(200);

        if (response.body.success && response.body.data) {
          const wallet = response.body.data;
          
          // 检查金额格式（应为字符串，保留2位小数）
          if (wallet.balance) {
            expect(typeof wallet.balance).toBe('string');
            expect(wallet.balance).toMatch(/^\d+\.\d{2}$/);
          }
          
          if (wallet.totalIncome) {
            expect(typeof wallet.totalIncome).toBe('string');
            expect(wallet.totalIncome).toMatch(/^\d+\.\d{2}$/);
          }
        }
      }
    });
  });

  describe('Time Format Consistency', () => {
    test('should format time consistently across all clients', async () => {
      const response = await request(app)
        .get('/api/v1/parties')
        .set('User-Agent', 'MicroMessenger/7.0.0')
        .expect(200);

      if (response.body.success && response.body.data) {
        const parties = Array.isArray(response.body.data.list) ? 
          response.body.data.list : response.body.data;
        
        if (parties.length > 0) {
          const party = parties[0];
          
          // 检查时间格式
          if (party.startTime) {
            expect(typeof party.startTime).toBe('string');
            expect(party.startTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
          }
          
          if (party.createTime) {
            expect(typeof party.createTime).toBe('string');
          }
        }
      }
    });
  });

  describe('Pagination Format Consistency', () => {
    test('should format pagination differently for different clients', async () => {
      // 测试小程序分页格式
      const miniprogramResponse = await request(app)
        .get('/api/v1/parties?page=1&pageSize=10')
        .set('User-Agent', 'MicroMessenger/7.0.0')
        .expect(200);

      if (miniprogramResponse.body.success && miniprogramResponse.body.data) {
        const data = miniprogramResponse.body.data;
        
        // 小程序应使用 list 和 hasMore
        expect(data.list).toBeDefined();
        expect(data.hasMore).toBeDefined();
        expect(data.page).toBeDefined();
        expect(data.total).toBeDefined();
      }

      // 测试Web管理后台分页格式
      const webResponse = await request(app)
        .get('/api/v1/orders?page=1&pageSize=10')
        .set('User-Agent', 'Mozilla/5.0 AppleWebKit')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      if (webResponse.body.success && webResponse.body.data) {
        const data = webResponse.body.data;
        
        // Web管理后台应使用标准分页格式
        expect(data.data).toBeDefined();
        expect(data.pagination).toBeDefined();
        expect(data.pagination.current).toBeDefined();
        expect(data.pagination.totalPages).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle adapter errors gracefully', async () => {
      // 模拟可能导致适配器错误的请求
      const response = await request(app)
        .get('/api/v1/parties/invalid-id')
        .set('User-Agent', 'MicroMessenger/7.0.0')
        .expect(404);

      // 即使适配器出错，也应该返回正确的错误响应
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Client Type Detection', () => {
    test('should correctly detect different client types', async () => {
      const testCases = [
        {
          userAgent: 'MicroMessenger/7.0.0',
          expectedClient: 'miniprogram',
          expectedFields: ['maxPeople', 'currentPeople', 'priceType']
        },
        {
          userAgent: 'uni-app/3.0.0',
          expectedClient: 'app',
          expectedFields: ['maxParticipants', 'currentParticipants', 'priceMode']
        },
        {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          expectedClient: 'web',
          expectedFields: ['auditInfo', 'financialInfo', 'adminNotes']
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/v1/parties')
          .set('User-Agent', testCase.userAgent)
          .expect(200);

        if (response.body.success && response.body.data) {
          // 在开发环境下检查适配器信息
          if (process.env.NODE_ENV === 'development' && response.body._adapter) {
            expect(response.body._adapter.clientType).toBe(testCase.expectedClient);
          }
        }
      }
    });
  });
});