// User Profile Service
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

class UserService {
  static async getUserByUsername(username) {
    const user = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            userAnimes: true,
            reviews: true,
          },
        },
        userAnimes: {
          take: 1500,
          orderBy: [{ isFavorite: 'desc' }, { score: 'desc' }, { updatedAt: 'desc' }],
          include: {
            anime: {
              include: {
                genres: {
                  include: {
                    genre: true,
                  },
                },
              },
            },
          },
        },
        customLists: {
          where: { title: '__top4_pins__' },
          include: {
            entries: {
              orderBy: { order: 'asc' },
              include: {
                anime: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound(`User '@${username}' not found`);
    }

    const pinnedAnimes = user.customLists?.[0]?.entries?.map((e) => e.anime).filter(Boolean) || [];

    // Compute comprehensive list distribution for public profile summary
    const statusCounts = await prisma.userAnime.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: { status: true },
    });

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

    const favoriteCount = await prisma.userAnime.count({
      where: { userId: user.id, isFavorite: true },
    });

    const ratingAggregate = await prisma.userAnime.aggregate({
      where: { userId: user.id, score: { not: null } },
      _avg: { score: true },
      _count: { score: true },
    });

    const epAggregate = await prisma.userAnime.aggregate({
      where: { userId: user.id },
      _sum: { progress: true },
    });

    const totalEps = epAggregate._sum.progress || 0;
    const daysWatched = Number(((totalEps * 24) / 1440).toFixed(1));

    return {
      ...user,
      pinnedAnimes,
      statsSummary: {
        totalAnime: user._count.userAnimes,
        reviewsCount: user._count.reviews,
        favoriteCount,
        episodesWatched: totalEps,
        daysWatched,
        meanScore: ratingAggregate._avg.score ? Number(ratingAggregate._avg.score.toFixed(1)) : null,
        ...statusMap,
      },
    };
  }

  static async updateUserPins(userId, animeIds = []) {
    // Find or create the __top4_pins__ custom list
    let list = await prisma.customList.findFirst({
      where: { userId, title: '__top4_pins__' },
    });

    if (!list) {
      list = await prisma.customList.create({
        data: {
          userId,
          title: '__top4_pins__',
          description: 'Top 4 Masterpiece Anime Milestone Pins',
          isPublic: true,
        },
      });
    }

    // Clear old entries
    await prisma.customListEntry.deleteMany({
      where: { listId: list.id },
    });

    // Insert new entries in order (up to 4)
    const validIds = (animeIds || []).filter(Boolean).slice(0, 4);

    if (validIds.length > 0) {
      await prisma.customListEntry.createMany({
        data: validIds.map((animeId, order) => ({
          listId: list.id,
          animeId,
          order,
        })),
      });
    }

    // Fetch and return populated entries with anime data
    const updatedEntries = await prisma.customListEntry.findMany({
      where: { listId: list.id },
      orderBy: { order: 'asc' },
      include: {
        anime: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
    });

    return updatedEntries.map((e) => e.anime).filter(Boolean);
  }

  static async updateProfile(userId, { displayName, bio, avatar, username }) {
    const updateData = {};

    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (username) {
      // Check if new username is taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: 'insensitive' },
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw ApiError.conflict('Username is already taken');
      }

      updateData.username = username;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

module.exports = UserService;
