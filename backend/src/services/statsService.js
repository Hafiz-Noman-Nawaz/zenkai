// User Anime Statistics Service
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

class StatsService {
  async getUserStatistics(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, displayName: true },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Run parallel aggregation queries for high performance
    const [
      statusCounts,
      ratingAggregate,
      favoriteCount,
      episodesWatchedAggregate,
      highestRatedList,
      lowestRatedList,
      userAnimesWithGenres,
    ] = await Promise.all([
      // Status breakdown
      prisma.userAnime.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      // Personal score statistics (avg, count)
      prisma.userAnime.aggregate({
        where: { userId, score: { not: null } },
        _avg: { score: true },
        _count: { score: true },
      }),
      // Favorites count
      prisma.userAnime.count({
        where: { userId, isFavorite: true },
      }),
      // Total episodes watched sum
      prisma.userAnime.aggregate({
        where: { userId },
        _sum: { progress: true },
        _count: { id: true },
      }),
      // Highest rated anime (top 3)
      prisma.userAnime.findMany({
        where: { userId, score: { not: null } },
        orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }],
        take: 3,
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              englishTitle: true,
              coverImage: true,
              score: true,
            },
          },
        },
      }),
      // Lowest rated anime (bottom 3)
      prisma.userAnime.findMany({
        where: { userId, score: { not: null } },
        orderBy: [{ score: 'asc' }, { updatedAt: 'desc' }],
        take: 3,
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              englishTitle: true,
              coverImage: true,
              score: true,
            },
          },
        },
      }),
      // User's genres for distribution calculation
      prisma.userAnime.findMany({
        where: { userId },
        select: {
          anime: {
            select: {
              genres: {
                select: {
                  genre: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Build status breakdown map
    const statusMap = {
      WATCHING: 0,
      COMPLETED: 0,
      PLAN_TO_WATCH: 0,
      ON_HOLD: 0,
      DROPPED: 0,
    };

    statusCounts.forEach((item) => {
      statusMap[item.status] = item._count.status;
    });

    // Compute genre distribution
    const genreCountMap = {};
    userAnimesWithGenres.forEach((ua) => {
      if (ua.anime?.genres) {
        ua.anime.genres.forEach((g) => {
          const name = g.genre.name;
          genreCountMap[name] = (genreCountMap[name] || 0) + 1;
        });
      }
    });

    const genreDistribution = Object.entries(genreCountMap)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    return {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      overview: {
        totalAnime: episodesWatchedAggregate._count.id || 0,
        watching: statusMap.WATCHING,
        completed: statusMap.COMPLETED,
        planToWatch: statusMap.PLAN_TO_WATCH,
        onHold: statusMap.ON_HOLD,
        dropped: statusMap.DROPPED,
        totalEpisodesWatched: episodesWatchedAggregate._sum.progress || 0,
        favoriteCount,
        averageRating: ratingAggregate._avg.score
          ? parseFloat(ratingAggregate._avg.score.toFixed(2))
          : null,
        ratedAnimeCount: ratingAggregate._count.score,
      },
      genreDistribution,
      highlights: {
        highestRated: highestRatedList.map((entry) => ({
          animeId: entry.anime.id,
          title: entry.anime.title,
          englishTitle: entry.anime.englishTitle,
          coverImage: entry.anime.coverImage,
          userScore: entry.score,
          globalScore: entry.anime.score,
        })),
        lowestRated: lowestRatedList.map((entry) => ({
          animeId: entry.anime.id,
          title: entry.anime.title,
          englishTitle: entry.anime.englishTitle,
          coverImage: entry.anime.coverImage,
          userScore: entry.score,
          globalScore: entry.anime.score,
        })),
      },
    };
  }
}

module.exports = new StatsService();
