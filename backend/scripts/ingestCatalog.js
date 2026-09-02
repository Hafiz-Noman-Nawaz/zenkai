// Catalog Ingestion Script - Deep Catalog Expansion
const { PrismaClient } = require('@prisma/client');
const AniListProvider = require('../src/services/external/anilistProvider');

const prisma = new PrismaClient();
const provider = new AniListProvider();

async function ingest() {
  console.log('🚀 Deep Ingesting 500+ rich anime into Zenkai database...');

  const queries = [
    { sort: 'POPULARITY_DESC', page: 1, limit: 40 },
    { sort: 'POPULARITY_DESC', page: 2, limit: 40 },
    { sort: 'POPULARITY_DESC', page: 3, limit: 40 },
    { sort: 'POPULARITY_DESC', page: 4, limit: 40 },
    { sort: 'POPULARITY_DESC', page: 5, limit: 40 },
    { sort: 'SCORE_DESC', page: 1, limit: 40 },
    { sort: 'SCORE_DESC', page: 2, limit: 40 },
    { sort: 'SCORE_DESC', page: 3, limit: 40 },
    { sort: 'TRENDING_DESC', page: 1, limit: 40 },
    { status: 'RELEASING', page: 1, limit: 30 },
    { status: 'RELEASING', page: 2, limit: 30 },
    { status: 'NOT_YET_RELEASED', page: 1, limit: 30 },
    { season: 'WINTER', seasonYear: 2026, page: 1, limit: 30 },
    { season: 'FALL', seasonYear: 2025, page: 1, limit: 30 },
    { season: 'SUMMER', seasonYear: 2025, page: 1, limit: 30 },
    { season: 'SPRING', seasonYear: 2025, page: 1, limit: 30 },
    { season: 'WINTER', seasonYear: 2025, page: 1, limit: 30 },
    { genre: 'Action', sort: 'POPULARITY_DESC', page: 1, limit: 30 },
    { genre: 'Sci-Fi', sort: 'POPULARITY_DESC', page: 1, limit: 30 },
    { genre: 'Psychological', sort: 'POPULARITY_DESC', page: 1, limit: 30 },
    { genre: 'Romance', sort: 'POPULARITY_DESC', page: 1, limit: 30 },
    { genre: 'Fantasy', sort: 'POPULARITY_DESC', page: 1, limit: 30 },
    { genre: 'Comedy', sort: 'POPULARITY_DESC', page: 1, limit: 30 },
  ];

  for (const q of queries) {
    try {
      console.log(`Ingesting batch: ${JSON.stringify(q)}...`);
      const result = await provider.getAnimeList(q);
      const animes = result.animes || [];

      for (const animeData of animes) {
        if (!animeData || !animeData.externalId) continue;
        const { genres = [], ...fields } = animeData;

        // Upsert genres
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

        // Upsert Anime
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
      console.warn('Batch skipped/warning:', err.message);
    }
  }

  const dbCount = await prisma.anime.count();
  console.log(`\n🎉 Deep Ingestion Complete! Total unique anime in database: ${dbCount}`);
}

ingest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
