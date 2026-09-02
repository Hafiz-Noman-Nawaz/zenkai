// Test helper utilities
const prisma = require('../src/config/db');
const { hashPassword } = require('../src/utils/password');
const { generateToken } = require('../src/utils/jwt');

async function createTestUser(override = {}) {
  const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
  const passwordHash = await hashPassword('password123');

  const user = await prisma.user.create({
    data: {
      username: override.username || `testuser_${uniqueId}`,
      email: override.email || `test_${uniqueId}@zenkai.dev`,
      passwordHash,
      displayName: override.displayName || 'Test User',
      ...override,
    },
  });

  const token = generateToken({ userId: user.id });

  return { user, token };
}

async function createTestAnime(override = {}) {
  const uniqueId = Math.floor(Math.random() * 100000) + 1000;

  return await prisma.anime.create({
    data: {
      externalId: uniqueId,
      title: override.title || `Test Anime ${uniqueId}`,
      synopsis: 'A test anime synopsis for testing.',
      type: 'TV',
      status: 'FINISHED',
      episodes: override.episodes !== undefined ? override.episodes : 24,
      score: 8.5,
      popularity: 100,
      ...override,
    },
  });
}

async function cleanupDatabase() {
  try {
    await prisma.review.deleteMany();
    await prisma.userAnime.deleteMany();
    await prisma.animeGenre.deleteMany();
    await prisma.genre.deleteMany();
    await prisma.anime.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    // Database might not be populated or connected yet in mock mode
  }
}

module.exports = {
  createTestUser,
  createTestAnime,
  cleanupDatabase,
};
