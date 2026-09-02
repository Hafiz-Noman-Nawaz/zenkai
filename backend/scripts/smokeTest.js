// Smoke & Verification Test Script
// Verifies route resolution, middleware, JWT signing/verifying, Zod schemas, and error handling

const app = require('../src/app');
const request = require('supertest');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const { hashPassword, comparePassword } = require('../src/utils/password');

async function runSmokeTests() {
  console.log('🧪 Starting Zenkai Backend Smoke Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Password Hashing & Verification
    console.log('1️⃣ Password Utility:');
    const hash = await hashPassword('SecretPass123!');
    const match = await comparePassword('SecretPass123!', hash);
    const wrongMatch = await comparePassword('WrongPassword', hash);
    assert(match === true, 'Password hashes and matches correctly');
    assert(wrongMatch === false, 'Rejects invalid password comparison');

    // 2. JWT Generation & Verification
    console.log('\n2️⃣ JWT Utility:');
    const token = generateToken({ userId: 'user_cuid_test_123', role: 'USER' });
    const decoded = verifyToken(token);
    assert(decoded.userId === 'user_cuid_test_123', 'JWT signs and decodes payload reliably');

    // 3. Health Check API
    console.log('\n3️⃣ Health Check Endpoint:');
    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'healthy', 'GET /api/health returns 200 OK');

    // 4. Welcome API
    console.log('\n4️⃣ Root Welcome Endpoint:');
    const rootRes = await request(app).get('/');
    assert(rootRes.status === 200 && rootRes.body.success === true, 'GET / returns 200 OK with Welcome metadata');

    // 5. Auth Input Validation
    console.log('\n5️⃣ Auth Validation:');
    const emptyRegRes = await request(app).post('/api/auth/register').send({});
    assert(emptyRegRes.status === 400 && emptyRegRes.body.errors?.length > 0, 'POST /api/auth/register rejects empty payloads');

    const invalidEmailRes = await request(app).post('/api/auth/register').send({
      username: 'zenkai_otaku',
      email: 'notanemail',
      password: 'password123',
    });
    assert(invalidEmailRes.status === 400, 'POST /api/auth/register rejects malformed email');

    const shortPassRes = await request(app).post('/api/auth/register').send({
      username: 'zenkai_otaku',
      email: 'valid@zenkai.dev',
      password: '123',
    });
    assert(shortPassRes.status === 400, 'POST /api/auth/register rejects passwords < 6 characters');

    // 6. Route Protection & Auth Middleware
    console.log('\n6️⃣ Auth Guard & Middleware:');
    const unauthMe = await request(app).get('/api/auth/me');
    assert(unauthMe.status === 401, 'GET /api/auth/me blocks unauthenticated requests');

    const unauthMyAnime = await request(app).get('/api/my-anime');
    assert(unauthMyAnime.status === 401, 'GET /api/my-anime blocks unauthenticated requests');

    const unauthWatching = await request(app).get('/api/my-anime/watching');
    assert(unauthWatching.status === 401, 'GET /api/my-anime/watching blocks unauthenticated requests');

    const unauthCompleted = await request(app).get('/api/my-anime/completed');
    assert(unauthCompleted.status === 401, 'GET /api/my-anime/completed blocks unauthenticated requests');

    const unauthStats = await request(app).get('/api/users/me/statistics');
    assert(unauthStats.status === 401, 'GET /api/users/me/statistics blocks unauthenticated requests');

    // 7. Rating & Progress Schema Validation
    console.log('\n7️⃣ Tracking List & Rating Bounds:');
    const badRatingRes = await request(app)
      .post('/api/my-anime')
      .set('Authorization', `Bearer ${token}`)
      .send({
        animeId: 'anime_clx123',
        score: 12.5, // > 10.0
      });
    assert(badRatingRes.status === 400, 'Rejects personal score > 10.0');

    const negRatingRes = await request(app)
      .post('/api/my-anime')
      .set('Authorization', `Bearer ${token}`)
      .send({
        animeId: 'anime_clx123',
        score: -2.0, // < 1.0
      });
    assert(negRatingRes.status === 400, 'Rejects personal score < 1.0');

    const negProgressRes = await request(app)
      .patch('/api/my-anime/anime_clx123/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ progress: -1 });
    assert(negProgressRes.status === 400, 'Rejects negative episode progress');

    // 8. Review Input Bounds
    console.log('\n8️⃣ Review Validation:');
    const shortReviewRes = await request(app)
      .post('/api/anime/anime_clx123/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Hi', // < 3 chars
        content: 'Too short', // < 10 chars
        rating: 9.0,
      });
    assert(shortReviewRes.status === 400, 'Rejects review with title < 3 or content < 10 characters');

    // 9. 404 Route Handler
    console.log('\n9️⃣ 404 Handler:');
    const notFoundRes = await request(app).get('/api/non-existent-endpoint-xyz');
    assert(notFoundRes.status === 404 && notFoundRes.body.success === false, 'Returns structured 404 JSON for invalid routes');

    console.log(`\n========================================`);
    console.log(`🎉 SMOKE TESTS SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Smoke test run crashed:', error);
    process.exit(1);
  }
}

runSmokeTests();
