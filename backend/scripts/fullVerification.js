// Full End-to-End Verification Test Script
// Runs against real PostgreSQL database and Express API

const app = require('../src/app');
const request = require('supertest');
const prisma = require('../src/config/db');

async function runVerification() {
  console.log('🚀 Starting Zenkai Full E2E Verification...\n');
  let passedCount = 0;
  let failedCount = 0;

  function check(passed, description, details = '') {
    if (passed) {
      console.log(`  ✅ [PASS] ${description}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${description} ${details ? '- ' + JSON.stringify(details) : ''}`);
      failedCount++;
    }
  }

  try {
    // 1. Health Check
    console.log('\n--- 1. Health & Welcome Endpoints ---');
    const healthRes = await request(app).get('/api/health');
    check(healthRes.status === 200 && healthRes.body.status === 'healthy', 'GET /api/health returns 200 OK');

    // 2. Auth Flow
    console.log('\n--- 2. Authentication Flow ---');
    const testUsername = `user_${Date.now()}`;
    const testEmail = `${testUsername}@zenkai.test`;
    const regRes = await request(app).post('/api/auth/register').send({
      username: testUsername,
      email: testEmail,
      password: 'StrongPassword123',
      displayName: 'Test Auditor',
    });
    check(regRes.status === 201 && regRes.body.data?.token, 'POST /api/auth/register creates user and returns JWT');
    check(!regRes.body.data?.user?.passwordHash, 'Registration does NOT expose passwordHash');

    const token = regRes.body.data?.token;
    const userId = regRes.body.data?.user?.id;

    // Login with username
    const loginUsernameRes = await request(app).post('/api/auth/login').send({
      username: testUsername,
      password: 'StrongPassword123',
    });
    check(loginUsernameRes.status === 200 && loginUsernameRes.body.data?.token, 'POST /api/auth/login works with username');

    // Login with email
    const loginEmailRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'StrongPassword123',
    });
    check(loginEmailRes.status === 200 && loginEmailRes.body.data?.token, 'POST /api/auth/login works with email');

    // GET /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    check(meRes.status === 200 && meRes.body.data?.user?.username === testUsername, 'GET /api/auth/me returns current user');

    // 3. User Profile
    console.log('\n--- 3. User Profile Endpoints ---');
    const publicProfileRes = await request(app).get(`/api/users/${testUsername}`);
    check(publicProfileRes.status === 200 && publicProfileRes.body.data?.profile?.username === testUsername, 'GET /api/users/:username returns public profile');

    const updateProfileRes = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Updated Auditor Name',
        bio: 'Updated bio testing audit.',
      });
    check(updateProfileRes.status === 200 && updateProfileRes.body.data?.user?.displayName === 'Updated Auditor Name', 'PATCH /api/users/me updates profile');

    // 4. Anime Catalog & Discovery
    console.log('\n--- 4. Anime Catalog & Discovery ---');
    const catalogRes = await request(app).get('/api/anime?page=1&limit=5');
    check(catalogRes.status === 200 && catalogRes.body.data?.anime?.length > 0, 'GET /api/anime returns paginated catalog');
    const firstAnime = catalogRes.body.data.anime[0];

    const searchRes = await request(app).get('/api/anime/search?q=Frieren');
    check(searchRes.status === 200 && searchRes.body.data?.anime?.length > 0, 'GET /api/anime/search finds matching anime');

    const detailRes = await request(app).get(`/api/anime/${firstAnime.id}`);
    check(detailRes.status === 200 && detailRes.body.data?.anime?.id === firstAnime.id, 'GET /api/anime/:id returns anime details');

    const animeGenresRes = await request(app).get(`/api/anime/${firstAnime.id}/genres`);
    check(animeGenresRes.status === 200 && Array.isArray(animeGenresRes.body.data?.genres), 'GET /api/anime/:id/genres returns genres');

    const animeStatsRes = await request(app).get(`/api/anime/${firstAnime.id}/stats`);
    check(animeStatsRes.status === 200 && animeStatsRes.body.data?.stats?.statusDistribution, 'GET /api/anime/:id/stats returns status distribution');

    const scheduleRes = await request(app).get('/api/anime/schedule');
    check(scheduleRes.status === 200 && scheduleRes.body.data?.schedule, 'GET /api/anime/schedule returns weekly airing schedule');

    const listsRes = await request(app).get('/api/lists');
    check(listsRes.status === 200 && Array.isArray(listsRes.body.data?.lists), 'GET /api/lists returns curated public collections');

    const recsRes = await request(app).get('/api/anime/recommendations');
    check(recsRes.status === 200 && Array.isArray(recsRes.body.data?.recommendations), 'GET /api/anime/recommendations returns personalized recommendations');

    // 5. User Tracking Lists & Progress
    console.log('\n--- 5. User Tracking Lists & Progress ---');
    // Add to WATCHING
    const addAnimeRes = await request(app)
      .post('/api/my-anime')
      .set('Authorization', `Bearer ${token}`)
      .send({
        animeId: firstAnime.id,
        status: 'WATCHING',
        progress: 3,
        score: 8.5,
        notes: 'Great opening episode!',
        isFavorite: true,
      });
    check(addAnimeRes.status === 200 && addAnimeRes.body.data?.entry?.status === 'WATCHING', 'POST /api/my-anime adds anime to watching');

    // Update Progress
    const progressRes = await request(app)
      .patch(`/api/my-anime/${firstAnime.id}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({ progress: 10 });
    check(progressRes.status === 200 && progressRes.body.data?.entry?.progress === 10, 'PATCH /api/my-anime/:id/progress updates episode count');

    // Update Score (Decimal)
    const scoreRes = await request(app)
      .patch(`/api/my-anime/${firstAnime.id}/score`)
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 9.7 });
    check(scoreRes.status === 200 && scoreRes.body.data?.entry?.score === 9.7, 'PATCH /api/my-anime/:id/score supports decimal ratings (9.7)');

    // Toggle Favorite
    const favRes = await request(app)
      .patch(`/api/my-anime/${firstAnime.id}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isFavorite: true });
    check(favRes.status === 200 && favRes.body.data?.entry?.isFavorite === true, 'PATCH /api/my-anime/:id/favorite toggles favorite');

    // Check list endpoints
    const watchingListRes = await request(app)
      .get('/api/my-anime/watching')
      .set('Authorization', `Bearer ${token}`);
    check(watchingListRes.status === 200 && watchingListRes.body.data?.list?.length >= 1, 'GET /api/my-anime/watching returns watching list');

    const favListRes = await request(app)
      .get('/api/my-anime/favorites')
      .set('Authorization', `Bearer ${token}`);
    check(favListRes.status === 200 && favListRes.body.data?.list?.length >= 1, 'GET /api/my-anime/favorites returns favorites');

    // 6. Review System & Ownership Enforcement
    console.log('\n--- 6. Reviews & Authorization ---');
    const reviewRes = await request(app)
      .post(`/api/anime/${firstAnime.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Masterpiece in execution',
        content: 'This show has redefined pacing and emotional impact for me.',
        rating: 9.5,
      });
    check(reviewRes.status === 201 && reviewRes.body.data?.review?.id, 'POST /api/anime/:id/reviews publishes review');
    const reviewId = reviewRes.body.data?.review?.id;

    // Vote Helpful on Review
    const helpfulVoteRes = await request(app)
      .post(`/api/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${token}`);
    check(helpfulVoteRes.status === 200 && helpfulVoteRes.body.data?.isVoted === true, 'POST /api/reviews/:id/helpful toggles helpful vote');

    // Edit own review
    const editReviewRes = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Masterpiece Title',
        rating: 9.8,
      });
    check(editReviewRes.status === 200 && editReviewRes.body.data?.review?.title === 'Updated Masterpiece Title', 'PATCH /api/reviews/:id edits own review');

    // Register 2nd user to test unauthorized modification
    const user2Name = `user2_${Date.now()}`;
    const user2Res = await request(app).post('/api/auth/register').send({
      username: user2Name,
      email: `${user2Name}@zenkai.test`,
      password: 'Password123!',
    });
    const token2 = user2Res.body.data.token;

    // User 2 attempts to edit User 1's review -> Must be 403 Forbidden
    const unauthEditRes = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'Hacked Title' });
    check(unauthEditRes.status === 403, 'Unauthorized user CANNOT edit another user review (403 Forbidden)');

    // User 2 attempts to delete User 1's review -> Must be 403 Forbidden
    const unauthDelRes = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token2}`);
    check(unauthDelRes.status === 403, 'Unauthorized user CANNOT delete another user review (403 Forbidden)');

    // 7. Statistics
    console.log('\n--- 7. User Statistics ---');
    const statsRes = await request(app)
      .get('/api/users/me/statistics')
      .set('Authorization', `Bearer ${token}`);
    check(
      statsRes.status === 200 &&
      statsRes.body.data?.statistics?.overview?.totalEpisodesWatched === 10 &&
      statsRes.body.data?.statistics?.overview?.averageRating === 9.7,
      'GET /api/users/me/statistics returns exact aggregated stats'
    );

    // 8. Delete Anime from List
    console.log('\n--- 8. Removal & Cleanup ---');
    const delAnimeRes = await request(app)
      .delete(`/api/my-anime/${firstAnime.id}`)
      .set('Authorization', `Bearer ${token}`);
    check(delAnimeRes.status === 200, 'DELETE /api/my-anime/:id removes anime from tracking list');

    // Clean up test review
    await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    console.log('\n======================================================');
    console.log(`🏁 E2E VERIFICATION COMPLETED: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('======================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ E2E Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
