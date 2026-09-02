// Prisma Seed Script for Zenkai
// Populates genres, rich anime catalog from AniList GraphQL, development test users, tracking lists, ratings, and reviews

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const AniListProvider = require('../src/services/external/anilistProvider');

const prisma = new PrismaClient();
const provider = new AniListProvider();

async function main() {
  console.log('🌱 Starting Zenkai database seeding with AniList artwork...');

  // 1. Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.userAnime.deleteMany();
  await prisma.animeGenre.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.anime.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 2. Ingest Rich Catalog across Popular, Top Rated, Airing, and Seasonal
  const batches = [
    { sort: 'POPULARITY_DESC', page: 1, limit: 30 },
    { sort: 'POPULARITY_DESC', page: 2, limit: 30 },
    { sort: 'SCORE_DESC', page: 1, limit: 30 },
    { sort: 'TRENDING_DESC', page: 1, limit: 30 },
    { status: 'RELEASING', page: 1, limit: 25 },
    { status: 'NOT_YET_RELEASED', page: 1, limit: 25 },
    { season: 'WINTER', seasonYear: 2026, page: 1, limit: 25 },
    { season: 'FALL', seasonYear: 2025, page: 1, limit: 25 },
  ];

  for (const b of batches) {
    try {
      const res = await provider.getAnimeList(b);
      for (const anime of res.animes || []) {
        if (!anime || !anime.externalId) continue;
        const { genres = [], ...fields } = anime;

        const genreRecords = [];
        for (const g of genres) {
          if (!g.slug || !g.name) continue;
          const rec = await prisma.genre.upsert({
            where: { slug: g.slug },
            update: { name: g.name },
            create: { name: g.name, slug: g.slug },
          });
          genreRecords.push(rec);
        }

        await prisma.anime.upsert({
          where: { externalId: fields.externalId },
          update: { ...fields },
          create: {
            ...fields,
            genres: {
              create: genreRecords.map((g) => ({ genreId: g.id })),
            },
          },
        });
      }
    } catch (err) {
      console.warn('Batch fetch warning:', err.message);
    }
  }

  const allAnimes = await prisma.anime.findMany();
  console.log(`✅ Seeded ${allAnimes.length} rich real anime catalog entries.`);

  // 3. Seed Development Users (with bcrypt password hash)
  const passwordHash = await bcrypt.hash('password123', 12);

  const usersData = [
    {
      username: 'demo_user',
      email: 'demo@zenkai.dev',
      passwordHash,
      displayName: 'Demo Otaku',
      bio: 'Lifelong anime enthusiast tracking top tier series, psychological thrillers, and seasonal gems on Zenkai.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo',
    },
    {
      username: 'sakura_watcher',
      email: 'sakura@zenkai.dev',
      passwordHash,
      displayName: 'Sakura Haruno',
      bio: 'Binge-watching fantasy, slice of life, and profound character journeys.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sakura',
    },
    {
      username: 'otaku_master',
      email: 'master@zenkai.dev',
      passwordHash,
      displayName: 'Kenji Master',
      bio: 'Reviewer, archivist, and curator of classic sci-fi & seasonal anime milestones.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kenji',
    },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }
  console.log(`✅ Seeded ${createdUsers.length} test users (Password: password123).`);

  const [demoUser, sakuraUser, masterUser] = createdUsers;

  // 4. Seed User Tracking Lists with first few anime
  if (allAnimes.length >= 6) {
    await prisma.userAnime.createMany({
      data: [
        {
          userId: demoUser.id,
          animeId: allAnimes[0].id,
          status: 'COMPLETED',
          score: 9.8,
          progress: allAnimes[0].episodes || 24,
          isFavorite: true,
          startedAt: new Date('2024-01-01'),
          completedAt: new Date('2024-03-25'),
          notes: 'Masterpiece storytelling with flawless execution.',
        },
        {
          userId: demoUser.id,
          animeId: allAnimes[1].id,
          status: 'WATCHING',
          score: 9.0,
          progress: 12,
          isFavorite: true,
          startedAt: new Date('2024-05-01'),
        },
        {
          userId: demoUser.id,
          animeId: allAnimes[2].id,
          status: 'WATCHING',
          score: 8.5,
          progress: 8,
          isFavorite: false,
          startedAt: new Date('2024-05-10'),
        },
        {
          userId: demoUser.id,
          animeId: allAnimes[3].id,
          status: 'PLAN_TO_WATCH',
          progress: 0,
          isFavorite: false,
        },
        {
          userId: sakuraUser.id,
          animeId: allAnimes[0].id,
          status: 'COMPLETED',
          score: 10.0,
          progress: allAnimes[0].episodes || 24,
          isFavorite: true,
          completedAt: new Date('2024-03-30'),
        },
        {
          userId: sakuraUser.id,
          animeId: allAnimes[4].id,
          status: 'COMPLETED',
          score: 9.5,
          progress: allAnimes[4].episodes || 12,
          isFavorite: true,
          completedAt: new Date('2024-02-12'),
        },
        {
          userId: masterUser.id,
          animeId: allAnimes[1].id,
          status: 'COMPLETED',
          score: 9.6,
          progress: allAnimes[1].episodes || 24,
          isFavorite: true,
          completedAt: new Date('2021-08-19'),
        },
      ],
    });
    console.log('✅ Seeded tracking list items.');

    // 5. Seed Reviews
    await prisma.review.createMany({
      data: [
        {
          userId: demoUser.id,
          animeId: allAnimes[0].id,
          title: 'An absolute masterpiece of modern anime',
          content: 'The animation, direction, and character development in this series are of the highest caliber. Every episode delivers deep emotional resonance and stellar visual storytelling.',
          rating: 9.8,
        },
        {
          userId: sakuraUser.id,
          animeId: allAnimes[0].id,
          title: 'A profound journey through time and memory',
          content: 'A breathtaking adaptation with phenomenal music and heartfelt interactions. Truly one of the finest shows ever produced.',
          rating: 10.0,
        },
        {
          userId: masterUser.id,
          animeId: allAnimes[1].id,
          title: 'Peak tension, animation, and thematic complexity',
          content: 'Keeps you at the edge of your seat with brilliant pacing, choreography, and unforgettable character moments.',
          rating: 9.6,
        },
      ],
    });
    console.log('✅ Seeded community reviews.');
  }

  console.log('\n🎉 Zenkai database seeding completed with AniList artwork and 200+ anime!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
