// User Anime Tracking & List Service
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const { WATCH_STATUS, PAGINATION_DEFAULTS } = require('../config/constants');

class UserAnimeService {
  async getUserAnimeList(userId, {
    status,
    isFavorite,
    page = PAGINATION_DEFAULTS.PAGE,
    limit = PAGINATION_DEFAULTS.LIMIT,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    search,
  } = {}) {
    const skip = (page - 1) * limit;
    const where = { userId };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite === true || isFavorite === 'true';
    }

    if (search) {
      where.anime = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { englishTitle: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    let orderBy = [];

    switch (sortBy) {
      case 'score':
        orderBy = [{ score: { sort: direction, nulls: 'last' } }];
        break;
      case 'title':
        orderBy = [{ anime: { title: direction } }];
        break;
      case 'progress':
        orderBy = [{ progress: direction }];
        break;
      case 'startedAt':
        orderBy = [{ startedAt: { sort: direction, nulls: 'last' } }];
        break;
      case 'completedAt':
        orderBy = [{ completedAt: { sort: direction, nulls: 'last' } }];
        break;
      case 'updatedAt':
      default:
        orderBy = [{ updatedAt: direction }];
        break;
    }

    const [total, list] = await Promise.all([
      prisma.userAnime.count({ where }),
      prisma.userAnime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
    ]);

    const formatted = list.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      animeId: entry.animeId,
      status: entry.status,
      score: entry.score,
      progress: entry.progress,
      startedAt: entry.startedAt,
      completedAt: entry.completedAt,
      notes: entry.notes,
      isFavorite: entry.isFavorite,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      anime: {
        id: entry.anime.id,
        externalId: entry.anime.externalId,
        title: entry.anime.title,
        englishTitle: entry.anime.englishTitle,
        japaneseTitle: entry.anime.japaneseTitle,
        type: entry.anime.type,
        status: entry.anime.status,
        episodes: entry.anime.episodes,
        duration: entry.anime.duration,
        score: entry.anime.score,
        coverImage: entry.anime.coverImage,
        genres: entry.anime.genres.map((g) => g.genre),
      },
    }));

    return {
      entries: formatted,
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

  async getUserAnimeEntry(userId, animeId) {
    const entry = await prisma.userAnime.findUnique({
      where: {
        userId_animeId: { userId, animeId },
      },
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

    if (!entry) {
      throw ApiError.notFound('Anime not found in your tracking list');
    }

    return {
      ...entry,
      anime: {
        ...entry.anime,
        genres: entry.anime.genres.map((g) => g.genre),
      },
    };
  }

  async upsertUserAnime(userId, animeId, data) {
    // Verify anime exists (supports internal cuid or numeric externalId)
    const isNumber = !isNaN(Number(animeId));
    let anime = await prisma.anime.findFirst({
      where: isNumber
        ? { OR: [{ id: animeId }, { externalId: parseInt(animeId, 10) }] }
        : { id: animeId },
    });

    if (!anime && isNumber) {
      const animeService = require('./animeService');
      try {
        const externalData = await animeService.externalProvider.getAnimeById(parseInt(animeId, 10));
        if (externalData) {
          anime = await animeService.upsertFromExternalData(externalData);
        }
      } catch (err) {
        console.warn(`Could not sync external anime ${animeId}:`, err.message);
      }
    }

    if (!anime) {
      throw ApiError.notFound(`Anime with id '${animeId}' not found`);
    }

    const targetAnimeId = anime.id;
    const { status, score, progress, notes, isFavorite, startedAt, completedAt } = data;

    // Validate progress against anime episodes
    if (progress !== undefined) {
      if (progress < 0) {
        throw ApiError.badRequest('Progress cannot be negative');
      }
      if (anime.episodes && progress > anime.episodes) {
        throw ApiError.badRequest(`Progress cannot exceed total anime episodes (${anime.episodes})`);
      }
    }

    // Determine smart status and dates
    let finalStatus = status;
    let finalProgress = progress;
    let finalStartedAt = startedAt;
    let finalCompletedAt = completedAt;

    // If progress equals total episodes, mark as COMPLETED
    if (anime.episodes && finalProgress === anime.episodes && (!finalStatus || finalStatus === WATCH_STATUS.WATCHING)) {
      finalStatus = WATCH_STATUS.COMPLETED;
    }

    // If marking as completed, ensure completedAt is set and progress matches episodes
    if (finalStatus === WATCH_STATUS.COMPLETED) {
      if (!finalCompletedAt) {
        finalCompletedAt = new Date();
      }
      if (anime.episodes && (finalProgress === undefined || finalProgress < anime.episodes)) {
        finalProgress = anime.episodes;
      }
    }

    // If status is WATCHING and startedAt is not set, default startedAt
    if (finalStatus === WATCH_STATUS.WATCHING && !finalStartedAt) {
      finalStartedAt = new Date();
    }

    const upsertData = {
      ...(finalStatus !== undefined && { status: finalStatus }),
      ...(score !== undefined && { score }),
      ...(finalProgress !== undefined && { progress: finalProgress }),
      ...(notes !== undefined && { notes }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(finalStartedAt !== undefined && { startedAt: finalStartedAt }),
      ...(finalCompletedAt !== undefined && { completedAt: finalCompletedAt }),
    };

    const entry = await prisma.userAnime.upsert({
      where: {
        userId_animeId: { userId, animeId: targetAnimeId },
      },
      create: {
        userId,
        animeId: targetAnimeId,
        status: finalStatus || WATCH_STATUS.PLAN_TO_WATCH,
        score: score || null,
        progress: finalProgress || 0,
        notes: notes || null,
        isFavorite: isFavorite || false,
        startedAt: finalStartedAt || (finalStatus === WATCH_STATUS.WATCHING ? new Date() : null),
        completedAt: finalCompletedAt || (finalStatus === WATCH_STATUS.COMPLETED ? new Date() : null),
      },
      update: upsertData,
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

    return {
      ...entry,
      anime: {
        ...entry.anime,
        genres: entry.anime.genres.map((g) => g.genre),
      },
    };
  }

  async updateProgress(userId, animeId, progress) {
    const isNumber = !isNaN(Number(animeId));
    const anime = await prisma.anime.findFirst({
      where: isNumber
        ? { OR: [{ id: animeId }, { externalId: parseInt(animeId, 10) }] }
        : { id: animeId },
    });

    if (!anime) {
      throw ApiError.notFound('Anime not found');
    }

    if (progress < 0) {
      throw ApiError.badRequest('Progress cannot be negative');
    }

    if (anime.episodes && progress > anime.episodes) {
      throw ApiError.badRequest(`Progress cannot exceed total anime episodes (${anime.episodes})`);
    }

    const currentEntry = await prisma.userAnime.findUnique({
      where: { userId_animeId: { userId, animeId: anime.id } },
    });

    const updateData = { progress };

    // Auto complete if progress reaches all episodes
    if (anime.episodes && progress === anime.episodes) {
      updateData.status = WATCH_STATUS.COMPLETED;
      if (!currentEntry?.completedAt) {
        updateData.completedAt = new Date();
      }
    } else if (currentEntry && currentEntry.status === WATCH_STATUS.PLAN_TO_WATCH && progress > 0) {
      updateData.status = WATCH_STATUS.WATCHING;
      if (!currentEntry.startedAt) {
        updateData.startedAt = new Date();
      }
    }

    return await this.upsertUserAnime(userId, anime.id, updateData);
  }

  async updateScore(userId, animeId, score) {
    return await this.upsertUserAnime(userId, animeId, { score });
  }

  async toggleFavorite(userId, animeId, isFavorite) {
    return await this.upsertUserAnime(userId, animeId, { isFavorite });
  }

  async removeUserAnime(userId, animeId) {
    const isNumber = !isNaN(Number(animeId));
    const anime = await prisma.anime.findFirst({
      where: isNumber
        ? { OR: [{ id: animeId }, { externalId: parseInt(animeId, 10) }] }
        : { id: animeId },
    });

    const targetAnimeId = anime ? anime.id : animeId;

    const existing = await prisma.userAnime.findUnique({
      where: { userId_animeId: { userId, animeId: targetAnimeId } },
    });

    if (!existing) {
      throw ApiError.notFound('Anime not found in your tracking list');
    }

    await prisma.userAnime.delete({
      where: { userId_animeId: { userId, animeId: targetAnimeId } },
    });

    return { message: 'Anime removed from tracking list successfully' };
  }
}

module.exports = new UserAnimeService();
