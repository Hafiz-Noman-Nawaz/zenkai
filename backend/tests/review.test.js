// Review Validation & Authorization Integration Tests
const request = require('supertest');
const app = require('../src/app');
const { createTestUser, createTestAnime } = require('./testHelpers');

describe('Review API Validation & Security', () => {
  let token;
  let testAnime;

  beforeAll(async () => {
    const userRes = await createTestUser();
    token = userRes.token;
    testAnime = await createTestAnime();
  });

  describe('Unauthenticated access control', () => {
    it('POST /api/anime/123/reviews should require authentication', async () => {
      const res = await request(app)
        .post('/api/anime/123/reviews')
        .send({
          title: 'Great show',
          content: 'This anime was truly masterfully executed in every way.',
          rating: 9.0,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /api/reviews/rev123 should require authentication', async () => {
      const res = await request(app)
        .patch('/api/reviews/rev123')
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(401);
    });

    it('DELETE /api/reviews/rev123 should require authentication', async () => {
      const res = await request(app)
        .delete('/api/reviews/rev123');

      expect(res.status).toBe(401);
    });
  });

  describe('Review validation constraints', () => {
    it('POST /api/anime/123/reviews should reject short review titles (< 3 chars)', async () => {
      const res = await request(app)
        .post(`/api/anime/${testAnime.id}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Hi',
          content: 'This anime was truly masterfully executed in every way.',
          rating: 9.0,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/anime/123/reviews should reject ratings outside 1.0 - 10.0', async () => {
      const res = await request(app)
        .post(`/api/anime/${testAnime.id}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Awesome Series',
          content: 'This anime was truly masterfully executed in every way.',
          rating: 15.0,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
