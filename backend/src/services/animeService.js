// Anime Catalog & Discovery Service
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const { SORT_OPTIONS, PAGINATION_DEFAULTS } = require('../config/constants');
const AniListProvider = require('./external/anilistProvider');
const cache = require('../utils/cache');

class AnimeService {
  constructor() {
    this.externalProvider = new AniListProvider();
  }

  async getAnimeList({
    page = PAGINATION_DEFAULTS.PAGE,
    limit = PAGINATION_DEFAULTS.LIMIT,
    q,
    genre,
    status,
    season,
    seasonYear,
    type,
    letter,
    sortBy = SORT_OPTIONS.POPULARITY,
    sortOrder = 'desc',
  }) {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;

    const cacheKey = `anime_list_${JSON.stringify({
      page,
      limit,
      q,
      genre,
      status,
      season,
      seasonYear,
      type,
      letter,
      sortBy,
      sortOrder,
    })}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;
    const where = {};

    // Text search in title, englishTitle, or japaneseTitle
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { englishTitle: { contains: q, mode: 'insensitive' } },
        { japaneseTitle: { contains: q, mode: 'insensitive' } },
      ];
    }

    // A-Z or # Alphabetical letter filter
    if (letter) {
      const upperLetter = letter.toUpperCase();
      if (upperLetter === '#') {
        where.OR = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].flatMap((digit) => [
          { title: { startsWith: digit, mode: 'insensitive' } },
          { englishTitle: { startsWith: digit, mode: 'insensitive' } },
        ]);
      } else {
        where.OR = [
          { title: { startsWith: upperLetter, mode: 'insensitive' } },
          { englishTitle: { startsWith: upperLetter, mode: 'insensitive' } },
        ];
      }
    }

    // Genre filter
    if (genre) {
      where.genres = {
        some: {
          genre: {
            OR: [
              { slug: { equals: genre.toLowerCase() } },
              { name: { equals: genre, mode: 'insensitive' } },
            ],
          },
        },
      };
    }

    // Status filter
    if (status) {
      where.status = { equals: status.toUpperCase() };
    }

    // Season filter
    if (season) {
      where.season = { equals: season.toUpperCase() };
    }

    // Year filter
    if (seasonYear) {
      where.seasonYear = parseInt(seasonYear, 10);
    }

    // Type filter (TV, MOVIE, OVA, etc.)
    if (type) {
      where.type = { equals: type.toUpperCase() };
    }

    // Sort mapping
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    let orderBy = [];

    switch (sortBy) {
      case SORT_OPTIONS.SCORE:
        orderBy = [{ score: { sort: direction, nulls: 'last' } }, { popularity: 'desc' }];
        break;
      case SORT_OPTIONS.RANK:
        orderBy = [{ rank: { sort: direction === 'desc' ? 'asc' : 'desc', nulls: 'last' } }];
        break;
      case SORT_OPTIONS.NEWEST:
        orderBy = [{ startDate: { sort: direction, nulls: 'last' } }, { createdAt: 'desc' }];
        break;
      case SORT_OPTIONS.OLDEST:
        orderBy = [{ startDate: { sort: direction === 'desc' ? 'asc' : 'desc', nulls: 'last' } }];
        break;
      case SORT_OPTIONS.ALPHABETICAL:
        orderBy = [{ title: direction }];
        break;
      case SORT_OPTIONS.POPULARITY:
      default:
        orderBy = [{ popularity: { sort: direction, nulls: 'last' } }, { score: 'desc' }];
        break;
    }

    let [total, animes] = await Promise.all([
      prisma.anime.count({ where }),
      prisma.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
          _count: {
            select: {
              userAnimes: true,
              reviews: true,
            },
          },
        },
      }),
    ]);

    // If local results are sparse (e.g. searching or querying high pages), fetch live from external provider and cache in DB
    if (animes.length === 0 || (q && animes.length < limit)) {
      try {
        let externalSort = 'POPULARITY_DESC';
        if (sortBy === SORT_OPTIONS.SCORE) externalSort = 'SCORE_DESC';
        if (sortBy === SORT_OPTIONS.NEWEST) externalSort = 'START_DATE_DESC';

        const externalResult = await this.externalProvider.getAnimeList({
          page,
          limit,
          sort: externalSort,
          status,
          season,
          seasonYear,
          genre,
          search: q,
        });

        if (externalResult.animes && externalResult.animes.length > 0) {
          // Sync new anime to DB asynchronously
          const upsertPromises = externalResult.animes.map((ext) =>
            this.upsertFromExternalData(ext).catch((err) => {
              console.warn(`Failed to upsert external anime ${ext.title}:`, err.message);
              return null;
            })
          );
          const upserted = (await Promise.all(upsertPromises)).filter(Boolean);

          if (upserted.length > 0) {
            animes = upserted;
            total = Math.max(total, externalResult.meta?.total || animes.length);
          }
        }
      } catch (externalErr) {
        console.warn('External API fallback fetch failed:', externalErr.message);
      }
    }

    const formattedAnimes = animes.map((anime) => this.formatAnime(anime));

    const result = {
      animes: formattedAnimes,
      meta: {
        total: Math.max(total, formattedAnimes.length),
        page,
        limit,
        totalPages: Math.ceil(Math.max(total, formattedAnimes.length) / limit) || 1,
        hasNextPage: page * limit < total || (formattedAnimes.length === limit),
        hasPrevPage: page > 1,
      },
    };

    // Cache list result for 3 minutes
    cache.set(cacheKey, result, 180000);
    return result;
  }

  async searchAnime({ q, page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT }) {
    return this.getAnimeList({ q, page, limit, sortBy: SORT_OPTIONS.POPULARITY });
  }

  async getAllGenres() {
    const cached = cache.get('all_genres');
    if (cached) return cached;

    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });

    cache.set('all_genres', genres, 600000); // 10 minutes cache
    return genres;
  }

  async getWeeklySchedule() {
    const cached = cache.get('weekly_schedule');
    if (cached) return cached;

    try {
      const schedule = await this.externalProvider.getWeeklySchedule();

      // Collect all external anime in schedule and ensure they have valid DB IDs
      const externalAnimes = [];
      Object.values(schedule).forEach((dayList) => {
        if (Array.isArray(dayList)) {
          dayList.forEach((item) => {
            if (item.anime && item.anime.externalId) {
              externalAnimes.push(item.anime);
            }
          });
        }
      });

      if (externalAnimes.length > 0) {
        const externalIds = externalAnimes.map((a) => a.externalId);
        const existingDbAnimes = await prisma.anime.findMany({
          where: { externalId: { in: externalIds } },
          select: { id: true, externalId: true },
        });

        const idMap = new Map();
        existingDbAnimes.forEach((dbA) => idMap.set(dbA.externalId, dbA.id));

        // For missing anime, upsert in background so they are persisted in DB
        const missing = externalAnimes.filter((a) => !idMap.has(a.externalId));
        if (missing.length > 0) {
          const upsertPromises = missing.slice(0, 15).map(async (m) => {
            try {
              const saved = await this.upsertFromExternalData(m);
              if (saved) idMap.set(m.externalId, saved.id);
            } catch (e) {}
          });
          await Promise.allSettled(upsertPromises);
        }

        // Assign DB IDs to all schedule anime
        Object.values(schedule).forEach((dayList) => {
          if (Array.isArray(dayList)) {
            dayList.forEach((item) => {
              if (item.anime) {
                item.anime.id = idMap.get(item.anime.externalId) || String(item.anime.externalId);
              }
            });
          }
        });
      }

      cache.set('weekly_schedule', schedule, 300000); // 5 minutes cache
      return schedule;
    } catch (err) {
      console.warn('Failed to fetch live schedule:', err.message);
      return {};
    }
  }

  async getRecommendations(userId, limit = 12) {
    let topGenreIds = [];
    let trackedAnimeIds = [];

    if (userId) {
      const userList = await prisma.userAnime.findMany({
        where: { userId },
        include: {
          anime: {
            include: {
              genres: true,
            },
          },
        },
      });

      trackedAnimeIds = userList.map((entry) => entry.animeId);

      const genreCounts = {};
      userList.forEach((entry) => {
        if ((entry.score && entry.score >= 7.5) || entry.isFavorite || entry.status === 'COMPLETED') {
          entry.anime?.genres?.forEach((ag) => {
            genreCounts[ag.genreId] = (genreCounts[ag.genreId] || 0) + 1;
          });
        }
      });

      topGenreIds = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id);
    }

    const where = {};
    if (trackedAnimeIds.length > 0) {
      where.id = { notIn: trackedAnimeIds };
    }
    if (topGenreIds.length > 0) {
      where.genres = {
        some: {
          genreId: { in: topGenreIds },
        },
      };
    }

    const recommendations = await prisma.anime.findMany({
      where,
      take: limit,
      orderBy: [{ score: 'desc' }, { popularity: 'desc' }],
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        _count: {
          select: {
            userAnimes: true,
            reviews: true,
          },
        },
      },
    });

    return recommendations.map((a) => this.formatAnime(a));
  }

  async upsertFromExternalData(externalData) {
    if (!externalData || !externalData.externalId) return null;

    const { id, genres = [], studio, characters, ...animeFields } = externalData;

    // Ensure genres exist in DB
    const genreRecords = [];
    for (const g of genres) {
      if (!g.slug || !g.name) continue;
      const record = await prisma.genre.upsert({
        where: { slug: g.slug },
        update: { name: g.name },
        create: { name: g.name, slug: g.slug },
      });
      genreRecords.push(record);
    }

    // Upsert Anime
    const anime = await prisma.anime.upsert({
      where: { externalId: externalData.externalId },
      update: {
        ...animeFields,
      },
      create: {
        ...animeFields,
        genres: {
          create: genreRecords.map((g) => ({ genreId: g.id })),
        },
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        _count: {
          select: {
            userAnimes: true,
            reviews: true,
          },
        },
      },
    });

    return anime;
  }

  async getAnimeById(id) {
    if (!id || id === 'undefined' || id === 'null') {
      throw ApiError.notFound('Anime ID is required');
    }

    const cacheKey = `anime_detail_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Try finding by internal cuid ID or externalId
    const isNumber = !isNaN(Number(id));
    const condition = isNumber
      ? { OR: [{ id }, { externalId: parseInt(id, 10) }] }
      : { id };

    let anime = await prisma.anime.findFirst({
      where: condition,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        _count: {
          select: {
            userAnimes: true,
            reviews: true,
          },
        },
      },
    });

    // If not found locally and ID could be an external ID, fetch from AniList and cache in DB
    if (!anime && isNumber) {
      try {
        const externalData = await this.externalProvider.getAnimeById(parseInt(id, 10));
        if (externalData) {
          anime = await this.upsertFromExternalData(externalData);
        }
      } catch (err) {
        console.warn(`External sync failed for ID ${id}:`, err.message);
      }
    }

    if (!anime) {
      throw ApiError.notFound(`Anime with id '${id}' not found`);
    }

    const formatted = this.formatAnime(anime);
    cache.set(cacheKey, formatted, 300000); // 5 minutes cache
    return formatted;
  }

  async getAnimeGenres(animeId) {
    if (!animeId || animeId === 'undefined' || animeId === 'null') {
      throw ApiError.notFound('Anime ID is required');
    }

    const anime = await prisma.anime.findUnique({
      where: { id: animeId },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!anime) {
      throw ApiError.notFound(`Anime with id '${animeId}' not found`);
    }

    return anime.genres.map((g) => (g.genre ? g.genre : g));
  }

  async getAnimeStats(animeId) {
    if (!animeId || animeId === 'undefined' || animeId === 'null') {
      throw ApiError.notFound('Anime ID is required');
    }

    const anime = await prisma.anime.findUnique({
      where: { id: animeId },
    });

    if (!anime) {
      throw ApiError.notFound(`Anime with id '${animeId}' not found`);
    }

    const [userAnimeEntries, ratingAggregate] = await Promise.all([
      prisma.userAnime.findMany({
        where: { animeId },
        select: { status: true, isFavorite: true },
      }),
      prisma.userAnime.aggregate({
        where: { animeId, score: { not: null } },
        _avg: { score: true },
        _count: { score: true },
      }),
    ]);

    const statusCounts = {
      WATCHING: 0,
      COMPLETED: 0,
      PLAN_TO_WATCH: 0,
      ON_HOLD: 0,
      DROPPED: 0,
    };

    let favoriteCount = 0;
    userAnimeEntries.forEach((entry) => {
      if (statusCounts[entry.status] !== undefined) {
        statusCounts[entry.status] += 1;
      }
      if (entry.isFavorite) favoriteCount += 1;
    });

    const totalTracked = userAnimeEntries.length;

    return {
      totalTracked,
      favoriteCount,
      globalScore: anime.score,
      communityAverageScore: ratingAggregate._avg.score
        ? parseFloat(ratingAggregate._avg.score.toFixed(2))
        : null,
      totalRatings: ratingAggregate._count.score,
      statusDistribution: statusCounts,
    };
  }

  async getFranchiseRelations(id) {
    if (!id || id === 'undefined' || id === 'null') {
      throw ApiError.notFound('Anime ID is required');
    }

    const anime = await prisma.anime.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
      },
    });

    if (!anime) {
      throw ApiError.notFound(`Anime with id '${id}' not found`);
    }

    // Extract root keyword from title to find genuine franchise siblings
    let root = anime.title
      .replace(/:\s*Season\s*\d+/i, '')
      .replace(/:\s*The\s*Final\s*Season/i, '')
      .replace(/\s*Season\s*\d+/i, '')
      .replace(/\s*2nd\s*Season/i, '')
      .replace(/\s*3rd\s*Season/i, '')
      .replace(/\s*4th\s*Season/i, '')
      .replace(/:\s*Part\s*\d+/i, '')
      .replace(/\s*Part\s*\d+/i, '')
      .replace(/:\s*Entertainment\s*District\s*Arc/i, '')
      .replace(/:\s*Mugen\s*Train\s*Arc/i, '')
      .replace(/:\s*Swordsmith\s*Village\s*Arc/i, '')
      .replace(/:\s*Hashira\s*Training\s*Arc/i, '')
      .replace(/:\s*Thousand-Year\s*Blood\s*War/i, '')
      .replace(/:\s*Brotherhood/i, '')
      .replace(/:\s*Shippuden/i, '')
      .replace(/\s*II/i, '')
      .replace(/\s*III/i, '')
      .replace(/\s*IV/i, '')
      .replace(/\s*0$/i, '')
      .split(':')[0]
      .split('-')[0]
      .trim();

    if (root.length < 3) {
      root = anime.title.split(' ')[0] || anime.title;
    }

    // Search for all entries in the same franchise
    const franchiseSiblings = await prisma.anime.findMany({
      where: {
        OR: [
          { title: { contains: root, mode: 'insensitive' } },
          { englishTitle: { contains: root, mode: 'insensitive' } },
          { japaneseTitle: anime.japaneseTitle ? { contains: anime.japaneseTitle.slice(0, 4), mode: 'insensitive' } : undefined },
        ].filter(Boolean),
      },
      include: {
        genres: { include: { genre: true } },
      },
      orderBy: [
        { seasonYear: 'asc' },
        { startDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    if (franchiseSiblings.length <= 1) {
      return {
        isStandalone: true,
        franchiseName: root,
        totalInstallments: 1,
        chronologicalOrder: [
          {
            ...this.formatAnime(anime),
            orderIndex: 1,
            relationType: 'Standalone Complete Story',
            isCurrent: true,
          },
        ],
      };
    }

    // Identify chronological position of current anime
    const currentIdx = franchiseSiblings.findIndex((s) => s.id === anime.id);

    const chronologicalOrder = franchiseSiblings.map((item, idx) => {
      let relationType = 'Installment';
      if (item.id === anime.id) {
        relationType = 'Current Installment';
      } else if (item.type === 'MOVIE') {
        relationType = 'Canon Movie';
      } else if (item.type === 'OVA') {
        relationType = 'Side Story OVA';
      } else if (idx < currentIdx) {
        relationType = currentIdx - idx === 1 ? 'Direct Prequel' : `Prequel (Part ${idx + 1})`;
      } else if (idx > currentIdx) {
        relationType = idx - currentIdx === 1 ? 'Direct Sequel' : `Sequel (Part ${idx + 1})`;
      }

      return {
        ...this.formatAnime(item),
        orderIndex: idx + 1,
        relationType,
        isCurrent: item.id === anime.id,
      };
    });

    return {
      isStandalone: false,
      franchiseName: root,
      totalInstallments: franchiseSiblings.length,
      currentPosition: currentIdx >= 0 ? currentIdx + 1 : 1,
      chronologicalOrder,
    };
  }

  formatAnime(anime) {
    if (!anime) return null;

    const genres = anime.genres ? anime.genres.map((g) => (g.genre ? g.genre : g)) : [];

    return {
      id: anime.id,
      externalId: anime.externalId,
      title: anime.title,
      englishTitle: anime.englishTitle,
      japaneseTitle: anime.japaneseTitle,
      synopsis: anime.synopsis,
      type: anime.type,
      status: anime.status,
      episodes: anime.episodes,
      duration: anime.duration,
      startDate: anime.startDate,
      endDate: anime.endDate,
      season: anime.season,
      seasonYear: anime.seasonYear,
      score: anime.score,
      popularity: anime.popularity,
      rank: anime.rank,
      coverImage: anime.coverImage,
      bannerImage: anime.bannerImage,
      trailerUrl: anime.trailerUrl,
      genres,
      stats: {
        totalTracked: anime._count?.userAnimes || 0,
        reviewsCount: anime._count?.reviews || 0,
      },
      createdAt: anime.createdAt,
      updatedAt: anime.updatedAt,
    };
  }
}

module.exports = new AnimeService();
