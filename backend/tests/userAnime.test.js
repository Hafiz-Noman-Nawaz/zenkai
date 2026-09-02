// User Anime Tracking & Rating Integration Tests
const request = require('supertest');
const app = require('../src/app');
const { createTestUser, createTestAnime } = require('./testHelpers');

describe('User Anime List Validation & Protection', () => {
  let token;
  let testAnime;

  beforeAll(async () => {
    const userRes = await createTestUser();
    token = userRes.token;
    testAnime = await createTestAnime({ episodes: 24 });
  });

  describe('Route protection', () => {
    it('GET /api/my-anime should require Bearer token', async () => {
      const res = await request(app).get('/api/my-anime');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/my-anime should require Bearer token', async () => {
      const res = await request(app).post('/api/my-anime').send({ animeId: testAnime.id });
      expect(res.status).toBe(401);
    });

    it('PATCH /api/my-anime/123/progress should require Bearer token', async () => {
      const res = await request(app).patch('/api/my-anime/123/progress').send({ progress: 5 });
      expect(res.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('POST /api/my-anime should validate rating scale (1.0 to 10.0)', async () => {
      const res = await request(app)
        .post('/api/my-anime')
        .set('Authorization', `Bearer ${token}`)
        .send({
          animeId: testAnime.id,
          score: 11.5, // Exceeds max rating 10.0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/my-anime should reject negative scores', async () => {
      const res = await request(app)
        .post('/api/my-anime')
        .set('Authorization', `Bearer ${token}`)
        .send({
          animeId: testAnime.id,
          score: -1.0,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /api/my-anime/123/progress should reject negative progress', async () => {
      const res = await request(app)
        .patch(`/api/my-anime/${testAnime.id}/progress`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          progress: -5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
