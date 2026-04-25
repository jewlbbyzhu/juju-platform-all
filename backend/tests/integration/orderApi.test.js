const request = require('supertest');
const app = require('../../src/server');
const { User, Wallet, Party, TicketType, Order, OrderItem, Payment } = require('../../src/models');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_12345678901234567890123456789';

describe('Order API Integration Tests', () => {
  let authToken;
  let testUser;
  let testParty;
  let testTicketType;
  let testOrder;

  beforeAll(async () => {
    try {
      await User.sync({ force: true });
      await Wallet.sync({ force: true });
      await Party.sync({ force: true });
      await TicketType.sync({ force: true });
      await Order.sync({ force: true });
      await OrderItem.sync({ force: true });
      await Payment.sync({ force: true });
    } catch (error) {
      console.error('Database sync error:', error);
    }
  });

  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await Wallet.destroy({ where: {} });
      await Party.destroy({ where: {} });
      await TicketType.destroy({ where: {} });
      await Order.destroy({ where: {} });
      await OrderItem.destroy({ where: {} });
      await Payment.destroy({ where: {} });
    } catch (error) {
      console.error('Database cleanup error:', error);
    }
  });

  beforeEach(async () => {
    try {
      if (!testUser) {
        const user = await User.create({
          openid: `test_openid_order_${Date.now()}_${Math.random()}`,
          nickname: 'Test User Order',
          status: 1
        });
        testUser = user;
        
        await Wallet.create({
          user_id: user.id,
          balance: 200.00,
          frozen_balance: 0.00,
          total_income: 200.00,
          total_expense: 0.00,
          status: 1
        });
        
        const jwt = require('jsonwebtoken');
        authToken = jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      }
      
      if (!testParty) {
        testParty = await Party.create({
          user_id: testUser.id,
          title: 'Test Party Order',
          category: 'music',
          start_time: new Date('2026-02-01 10:00:00'),
          end_time: new Date('2026-02-01 18:00:00'),
          registration_deadline: new Date('2026-01-31 23:59:59'),
          location: 'Test Location Order',
          max_participants: 50,
          current_participants: 0,
          min_price: 50.00,
          max_price: 100.00,
          status: 1
        });
      }
      
      if (!testTicketType) {
        testTicketType = await TicketType.create({
          party_id: testParty.id,
          name: 'Regular Ticket',
          description: 'Regular ticket description',
          type: 1,
          price: 50.00,
          original_price: 60.00,
          available_count: 100,
          sold_count: 0,
          max_per_user: 5,
          status: 1,
          sort_order: 1
        });
      }
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  afterEach(async () => {
    try {
      await Order.destroy({ where: {} });
      await OrderItem.destroy({ where: {} });
      await Payment.destroy({ where: {} });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('POST /api/v1/orders', () => {
    it('should create an order', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          party_id: testParty.id,
          items: [
            {
              ticket_type_id: testTicketType.id,
              quantity: 2
            }
          ]
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.party_id).toBe(testParty.id);
      expect(response.body.data.final_amount).toBe('100.00');
      testOrder = response.body.data;
    });

    it('should not create order without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .send({
          party_id: testParty.id,
          items: [
            {
              ticket_type_id: testTicketType.id,
              quantity: 1
            }
          ]
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('should not create order with invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          party_id: testParty.id
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders', () => {
    beforeEach(async () => {
      try {
        testOrder = await Order.create({
          order_no: 'ORD20260116100001',
          user_id: testUser.id,
          party_id: testParty.id,
          total_amount: 100.00,
          discount_amount: 0.00,
          final_amount: 100.00,
          payment_method: 'wechat',
          payment_status: 0,
          status: 0
        });
      } catch (error) {
        console.error('Setup order error:', error);
      }
    });

    it('should get orders list', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get orders with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBeDefined();
      expect(response.body.page).toBe(1);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/orders?status=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    beforeEach(async () => {
      try {
        testOrder = await Order.create({
          order_no: 'ORD20260116100002',
          user_id: testUser.id,
          party_id: testParty.id,
          total_amount: 100.00,
          discount_amount: 0.00,
          final_amount: 100.00,
          payment_method: 'wechat',
          payment_status: 0,
          status: 0
        });
      } catch (error) {
        console.error('Setup order error:', error);
      }
    });

    it('should get order by id', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testOrder.id);
      expect(response.body.data.order_no).toBe('ORD20260116100002');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/v1/orders/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/orders/:id/cancel', () => {
    beforeEach(async () => {
      try {
        testOrder = await Order.create({
          order_no: 'ORD20260116100003',
          user_id: testUser.id,
          party_id: testParty.id,
          total_amount: 100.00,
          discount_amount: 0.00,
          final_amount: 100.00,
          payment_method: 'wechat',
          payment_status: 0,
          status: 0
        });
      } catch (error) {
        console.error('Setup order error:', error);
      }
    });

    it('should cancel order', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cancel_reason: 'Changed my mind'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(3);
    });

    it('should not cancel order without auth token', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${testOrder.id}/cancel`)
        .send({
          cancel_reason: 'Changed my mind'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
});
