const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedLists() {
  console.log('Seeding custom curated collections...');

  const users = await prisma.user.findMany();
  const animes = await prisma.anime.findMany({ take: 20 });

  if (users.length === 0 || animes.length < 8) {
    console.log('Not enough users or animes to seed lists');
    return;
  }

  const demoUser = users[0];

  const sampleLists = [
    {
      title: 'Top 10 Modern Masterpieces (2020-2026)',
      description: 'The definitive ranking of pinnacle animation, writing, and emotional catharsis in contemporary anime.',
      isPublic: true,
      animeIndices: [0, 1, 2, 3, 4, 5],
    },
    {
      title: 'Dark Fantasy & Existential Journeys',
      description: 'Bleak worlds, high stakes, philosophical dilemmas, and unforgettable character journeys.',
      isPublic: true,
      animeIndices: [2, 4, 6, 7],
    },
    {
      title: 'Peak Shonen Hype & Fight Choreography',
      description: 'High-octane animation, legendary power systems, and world-class sakuga battles.',
      isPublic: true,
      animeIndices: [1, 3, 5, 8],
    },
  ];

  for (const s of sampleLists) {
    const list = await prisma.customList.create({
      data: {
        userId: demoUser.id,
        title: s.title,
        description: s.description,
        isPublic: s.isPublic,
        entries: {
          create: s.animeIndices.map((idx, order) => ({
            animeId: animes[idx % animes.length].id,
            order,
          })),
        },
      },
    });
    console.log(`Created list: ${list.title}`);
  }

  console.log('✅ Curated collections seeded successfully!');
}

seedLists()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
