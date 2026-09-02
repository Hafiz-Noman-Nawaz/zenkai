// Authentication Integration Tests
const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {
  describe('Health check endpoint', () => {
    it('GET /api/health should return 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Input validation tests', () => {
    it('POST /api/auth/register should reject empty body', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/auth/register should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'validuser',
        email: 'not-an-email',
        password: 'password123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'validuser',
        email: 'valid@example.com',
        password: '123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should reject missing password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'valid@example.com',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should reject invalid Bearer tokens', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
