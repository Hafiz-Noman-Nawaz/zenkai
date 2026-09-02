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
      },
    });

    if (!user) {
      throw ApiError.notFound(`User '@${username}' not found`);
    }

    // Compute basic list distribution for public profile summary
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

    return {
      ...user,
      statsSummary: {
        totalAnime: user._count.userAnimes,
        reviewsCount: user._count.reviews,
        favoriteCount,
        ...statusMap,
      },
    };
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
