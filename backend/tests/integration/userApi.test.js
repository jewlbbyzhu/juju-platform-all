const request = require('supertest');
const app = require('../../src/server');
const { User, Wallet, Party, TicketType, Order, Payment } = require('../../src/models');

describe('User API Integration Tests', () => {
  let authToken;
  // eslint-disable-next-line no-unused-vars
  let testUser;

  beforeAll(async () => {
    try {
      await User.sync({ force: false });
      await Wallet.sync({ force: false });
      await Party.sync({ force: false });
      await TicketType.sync({ force: false });
      await Order.sync({ force: false });
      await Payment.sync({ force: false });
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
      await Payment.destroy({ where: {} });
    } catch (error) {
      console.error('Database cleanup error:', error);
    }
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          openid: 'test_openid_001',
          nickname: 'Test User',
          avatar: 'https://example.com/avatar.jpg'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.openid).toBe('test_openid_001');
      expect(response.body.data.nickname).toBe('Test User');
      testUser = response.body.data;
    });

    it('should not register user without openid', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          nickname: 'Test User'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login with openid', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          openid: 'test_openid_001'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.openid).toBe('test_openid_001');
      authToken = response.body.data.token;
    });

    it('should create new user if openid not exists', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          openid: 'test_openid_new'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.openid).toBe('test_openid_new');
    });
  });

  describe('GET /api/v1/users/profile', () => {
    it('should get user profile with auth token', async () => {
      if (!authToken) {
        console.log('No auth token available, skipping test');
        return;
      }

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.openid).toBe('test_openid_001');
      expect(response.body.data.nickname).toBe('Test User');
    });

    it('should not get profile without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update user profile', async () => {
      if (!authToken) {
        console.log('No auth token available, skipping test');
        return;
      }

      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'Updated User',
          avatar: 'https://example.com/new-avatar.jpg'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.nickname).toBe('Updated User');
    });

    it('should not update profile without auth token', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .send({
          nickname: 'Updated User'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
});
