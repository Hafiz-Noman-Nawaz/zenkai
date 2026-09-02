// Statistics Integration Tests
const request = require('supertest');
const app = require('../src/app');

describe('Statistics API Endpoints', () => {
  describe('Access Control', () => {
    it('GET /api/statistics/me should require authentication', async () => {
      const res = await request(app).get('/api/statistics/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/users/me/statistics should require authentication', async () => {
      const res = await request(app).get('/api/users/me/statistics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
