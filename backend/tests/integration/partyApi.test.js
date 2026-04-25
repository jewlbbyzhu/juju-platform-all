const request = require('supertest');
const app = require('../../src/server');
const { User, Party, TicketType } = require('../../src/models');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_12345678901234567890123456789';

describe('Party API Integration Tests', () => {
  let authToken;
  let testUser;
  let testParty;

  beforeAll(async () => {
    try {
      await User.sync({ force: true });
      await Party.sync({ force: true });
      await TicketType.sync({ force: true });
    } catch (error) {
      console.error('Database sync error:', error);
    }
  });

  afterAll(async () => {
    try {
      await User.destroy({ where: {} });
      await Party.destroy({ where: {} });
      await TicketType.destroy({ where: {} });
    } catch (error) {
      console.error('Database cleanup error:', error);
    }
  });

  beforeEach(async () => {
    try {
      if (!testUser) {
        const user = await User.create({
          openid: `test_openid_party_${Date.now()}_${Math.random()}`,
          nickname: 'Test User Party',
          status: 1
        });
        testUser = user;
        
        const jwt = require('jsonwebtoken');
        authToken = jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      }
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  afterEach(async () => {
    try {
      await Party.destroy({ where: {} });
      await TicketType.destroy({ where: {} });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('POST /api/v2/parties', () => {
    it('should create a party', async () => {
      const response = await request(app)
        .post('/api/v2/parties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Party',
          description: 'This is a test party',
          category: 'music',
          start_time: '2026-02-01T10:00:00Z',
          end_time: '2026-02-01T18:00:00Z',
          location: 'Test Location',
          max_participants: 50,
          min_price: 50.00,
          max_price: 100.00
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Party');
      expect(response.body.data.user_id).toBe(testUser.id);
      testParty = response.body.data;
    });

    it('should not create party without auth token', async () => {
      const response = await request(app)
        .post('/api/v2/parties')
        .send({
          title: 'Test Party'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('should not create party with invalid data', async () => {
      const response = await request(app)
        .post('/api/v2/parties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Party'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/parties', () => {
    beforeEach(async () => {
      try {
        testParty = await Party.create({
          user_id: testUser.id,
          title: 'Test Party List',
          category: 'music',
          start_time: new Date('2026-02-02 10:00:00'),
          end_time: new Date('2026-02-02 18:00:00'),
          registration_deadline: new Date('2026-02-01 23:59:59'),
          location: 'Test Location List',
          max_participants: 50,
          current_participants: 0,
          min_price: 50.00,
          max_price: 100.00,
          status: 1
        });
      } catch (error) {
        console.error('Setup party error:', error);
      }
    });

    it('should get parties list', async () => {
      const response = await request(app)
        .get('/api/v1/parties')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get parties with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/parties?page=1&limit=10')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBeDefined();
      expect(response.body.page).toBe(1);
    });

    it('should filter parties by category', async () => {
      const response = await request(app)
        .get('/api/v1/parties?category=music')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter parties by status', async () => {
      const response = await request(app)
        .get('/api/v1/parties?status=1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/parties/:id', () => {
    beforeEach(async () => {
      try {
        testParty = await Party.create({
          user_id: testUser.id,
          title: 'Test Party Detail',
          category: 'music',
          start_time: new Date('2026-02-03 10:00:00'),
          end_time: new Date('2026-02-03 18:00:00'),
          registration_deadline: new Date('2026-02-02 23:59:59'),
          location: 'Test Location Detail',
          max_participants: 50,
          current_participants: 0,
          min_price: 50.00,
          max_price: 100.00,
          status: 1
        });
      } catch (error) {
        console.error('Setup party error:', error);
      }
    });

    it('should get party by id', async () => {
      const response = await request(app)
        .get(`/api/v1/parties/${testParty.id}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testParty.id);
      expect(response.body.data.title).toBe('Test Party Detail');
    });

    it('should return 404 for non-existent party', async () => {
      const response = await request(app)
        .get('/api/v1/parties/99999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v2/parties/:id', () => {
    beforeEach(async () => {
      try {
        testParty = await Party.create({
          user_id: testUser.id,
          title: 'Test Party Update',
          category: 'music',
          start_time: new Date('2026-02-04 10:00:00'),
          end_time: new Date('2026-02-04 18:00:00'),
          registration_deadline: new Date('2026-02-03 23:59:59'),
          location: 'Test Location Update',
          max_participants: 50,
          current_participants: 0,
          min_price: 50.00,
          max_price: 100.00,
          status: 0
        });
      } catch (error) {
        console.error('Setup party error:', error);
      }
    });

    it('should update party', async () => {
      const response = await request(app)
        .put(`/api/v2/parties/${testParty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Party Title',
          description: 'Updated description'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Party Title');
    });

    it('should not update party without auth token', async () => {
      const response = await request(app)
        .put(`/api/v2/parties/${testParty.id}`)
        .send({
          title: 'Updated Party Title'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v2/parties/:id', () => {
    beforeEach(async () => {
      try {
        testParty = await Party.create({
          user_id: testUser.id,
          title: 'Test Party Delete',
          category: 'music',
          start_time: new Date('2026-02-05 10:00:00'),
          end_time: new Date('2026-02-05 18:00:00'),
          registration_deadline: new Date('2026-02-04 23:59:59'),
          location: 'Test Location Delete',
          max_participants: 50,
          current_participants: 0,
          min_price: 50.00,
          max_price: 100.00,
          status: 0
        });
      } catch (error) {
        console.error('Setup party error:', error);
      }
    });

    it('should delete party', async () => {
      const response = await request(app)
        .delete(`/api/v2/parties/${testParty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should not delete party without auth token', async () => {
      const response = await request(app)
        .delete(`/api/v2/parties/${testParty.id}`)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
});
