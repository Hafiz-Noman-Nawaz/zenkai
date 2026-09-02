// Anime Reviews Service
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const { PAGINATION_DEFAULTS } = require('../config/constants');

// In-memory persistent vote store
const reviewHelpfulVotes = new Map();

class ReviewService {
  async voteHelpful(userId, reviewId) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (!reviewHelpfulVotes.has(reviewId)) {
      reviewHelpfulVotes.set(reviewId, new Set());
    }

    const votes = reviewHelpfulVotes.get(reviewId);
    let isVoted = false;

    if (votes.has(userId)) {
      votes.delete(userId);
      isVoted = false;
    } else {
      votes.add(userId);
      isVoted = true;
    }

    return {
      reviewId,
      helpfulCount: votes.size,
      isVoted,
      message: isVoted ? 'Voted review as helpful' : 'Removed helpful vote',
    };
  }

  async getAnimeReviews(animeId, { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, userId } = {}) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { animeId } }),
      prisma.review.findMany({
        where: { animeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const formatted = reviews.map((r) => {
      const votes = reviewHelpfulVotes.get(r.id) || new Set();
      return {
        ...r,
        helpfulCount: votes.size,
        isHelpfulByMe: userId ? votes.has(userId) : false,
      };
    });

    return {
      reviews: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getRecentReviews({ page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT } = {}) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count(),
      prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
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
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async createReview(userId, animeId, { title, content, rating }) {
    // Check if anime exists
    const anime = await prisma.anime.findUnique({
      where: { id: animeId },
    });

    if (!anime) {
      throw ApiError.notFound(`Anime with id '${animeId}' not found`);
    }

    // Check if user already reviewed this anime
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_animeId: { userId, animeId },
      },
    });

    if (existingReview) {
      throw ApiError.conflict('You have already written a review for this anime. Please edit your existing review.');
    }

    const review = await prisma.review.create({
      data: {
        userId,
        animeId,
        title,
        content,
        rating,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        anime: {
          select: {
            id: true,
            title: true,
            englishTitle: true,
            coverImage: true,
          },
        },
      },
    });

    return review;
  }

  async updateReview(userId, reviewId, updateData) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound(`Review with id '${reviewId}' not found`);
    }

    // Check authorization: only the author can update their review
    if (review.userId !== userId) {
      throw ApiError.forbidden('You are not authorized to edit this review');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(updateData.title !== undefined && { title: updateData.title }),
        ...(updateData.content !== undefined && { content: updateData.content }),
        ...(updateData.rating !== undefined && { rating: updateData.rating }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        anime: {
          select: {
            id: true,
            title: true,
            englishTitle: true,
            coverImage: true,
          },
        },
      },
    });

    return updatedReview;
  }

  async deleteReview(userId, reviewId) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound(`Review with id '${reviewId}' not found`);
    }

    // Check authorization: only author can delete
    if (review.userId !== userId) {
      throw ApiError.forbidden('You are not authorized to delete this review');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}

module.exports = new ReviewService();
