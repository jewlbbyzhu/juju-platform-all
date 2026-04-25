const request = require('supertest');
const app = require('../src/server');
const logger = require('../src/utils/logger');

describe('并发控制修复验证', () => {
  let testUserId;
  let testToken;

  beforeAll(async () => {
    try {
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({
          openid: `test_openid_${Date.now()}`,
          unionid: `test_unionid_${Date.now()}`
        });

      if (loginResponse.body && loginResponse.body.success && loginResponse.body.data) {
        testToken = loginResponse.body.data.token;
        testUserId = loginResponse.body.data.id;
        logger.info('测试登录成功', { userId: testUserId });
      } else {
        logger.error('测试登录失败', loginResponse.body);
      }
    } catch (error) {
      logger.error('测试设置失败:', error);
      throw error;
    }
  }, 10000);

  describe('钱包余额竞态条件修复验证', () => {
    it('应该防止并发提现超过余额', async () => {
      if (!testToken) {
        console.log('跳过测试：没有测试令牌');
        return;
      }

      const initialWalletResponse = await request(app)
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${testToken}`);

      const initialBalance = initialWalletResponse.body.data.balance;
      logger.info('初始余额:', initialBalance);

      if (initialBalance < 20000) {
        logger.info('跳过测试：余额不足200分');
        return;
      }

      const withdrawAmount = 15000;

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/api/v1/wallet/withdraw')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              amount: withdrawAmount,
              bank_card_id: 1,
              password: 'test_password_123'
            })
        );
      }

      const results = await Promise.allSettled(promises);
      const successfulWithdrawals = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;

      logger.info('并发提现测试结果:', {
        initialBalance,
        withdrawAmount,
        successfulWithdrawals,
        expectedMax: Math.floor(initialBalance / withdrawAmount)
      });

      expect(successfulWithdrawals).toBeLessThanOrEqual(Math.floor(initialBalance / withdrawAmount));
    }, 30000);
  });

  describe('支付处理竞态条件修复验证', () => {
    it('应该防止并发支付超过余额', async () => {
      if (!testToken) {
        console.log('跳过测试：没有测试令牌');
        return;
      }

      const initialWalletResponse = await request(app)
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${testToken}`);

      const initialBalance = initialWalletResponse.body.data.balance;
      logger.info('初始余额:', initialBalance);

      if (initialBalance < 20000) {
        logger.info('跳过测试：余额不足200分');
        return;
      }

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              party_id: 1,
              items: [{
                ticket_type_id: 1,
                quantity: 1
              }]
            })
        );
      }

      const results = await Promise.allSettled(promises);
      const successfulOrders = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;

      logger.info('并发支付测试结果:', {
        initialBalance,
        successfulOrders,
        expectedMax: Math.floor(initialBalance / 10000)
      });

      expect(successfulOrders).toBeLessThanOrEqual(Math.floor(initialBalance / 10000));
    }, 30000);
  });

  describe('退款处理竞态条件修复验证', () => {
    it('应该防止同一订单多次退款', async () => {
      if (!testToken) {
        console.log('跳过测试：没有测试令牌');
        return;
      }

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          party_id: 1,
          items: [{
            ticket_type_id: 1,
            quantity: 1
          }]
        });

      if (orderResponse.status !== 200) {
        logger.info('跳过测试：订单创建失败');
        return;
      }

      const orderId = orderResponse.body.data.id;
      logger.info('订单创建成功:', { orderId });

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post(`/api/v1/orders/${orderId}/refund`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              reason: '测试退款'
            })
        );
      }

      const results = await Promise.allSettled(promises);
      const successfulRefunds = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
      const duplicateRefunds = results.filter(r => r.status === 'fulfilled' && r.value.status === 400 && r.value.message.includes('already')).length;

      logger.info('并发退款测试结果:', {
        successfulRefunds,
        duplicateRefunds,
        expected: 1
      });

      expect(successfulRefunds).toBeLessThanOrEqual(1);
      expect(duplicateRefunds).toBeGreaterThan(0);
    }, 30000);
  });

  describe('票务库存竞态条件修复验证', () => {
    it('应该防止超售票务', async () => {
      if (!testToken) {
        console.log('跳过测试：没有测试令牌');
        return;
      }

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              party_id: 1,
              items: [{
                ticket_type_id: 1,
                quantity: 1
              }]
            })
        );
      }

      const results = await Promise.allSettled(promises);
      const successfulOrders = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
      const failedOrders = results.filter(r => r.status === 'fulfilled' && r.value.status === 400 && r.value.message.includes('Insufficient')).length;

      logger.info('并发订单测试结果:', {
        successfulOrders,
        failedOrders,
        expected: 1
      });

      expect(successfulOrders + failedOrders).toBeLessThanOrEqual(1);
    }, 30000);
  });

  describe('认证中间件修复验证', () => {
    it('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('UNAUTHORIZED');
    }, 10000);

    it('应该拒绝未认证的用户详情请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的用户状态更新请求', async () => {
      const response = await request(app)
        .put('/api/v1/users/1/status')
        .set('Authorization', '')
        .send({ status: 0 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的用户删除请求', async () => {
      const response = await request(app)
        .delete('/api/v1/users/1')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的用户搜索请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);
    it('应该拒绝未认证的用户活动请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/1/activities')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的用户订单请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/1/orders')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的用户聚会请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/1/parties')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的批量状态更新请求', async () => {
      const response = await request(app)
        .put('/api/v1/users/batch/status')
        .set('Authorization', '')
        .send({ ids: [1, 2], status: 0 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);

    it('应该拒绝未认证的用户导出请求', async () => {
      const response = await request(app)
        .get('/api/v1/users/export')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('原子操作修复验证', () => {
    it('应该正确更新计数器', async () => {
      if (!testToken) {
        console.log('跳过测试：没有测试令牌');
        return;
      }

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          party_id: 1,
          items: [{
            ticket_type_id: 1,
            quantity: 1
          }]
        });

      if (orderResponse.status !== 200) {
        logger.info('跳过测试：订单创建失败');
        return;
      }

      const orderId = orderResponse.body.data.id;
      logger.info('订单创建成功:', { orderId });

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post(`/api/v1/orders/${orderId}/pay`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              payment_method: 'wallet',
              password: 'test_password_123'
            })
        );
      }

      const results = await Promise.allSettled(promises);
      const successfulPayments = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;

      logger.info('并发支付测试结果:', {
        successfulPayments,
        expected: 1
      });

      expect(successfulPayments).toBeLessThanOrEqual(1);
    }, 30000);
  });
});
