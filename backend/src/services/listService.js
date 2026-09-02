// Curated Custom Lists Service
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

class ListService {
  async getPublicLists({ page = 1, limit = 20, search }) {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where = { isPublic: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, lists] = await Promise.all([
      prisma.customList.count({ where }),
      prisma.customList.findMany({
        where,
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
          entries: {
            take: 4,
            orderBy: { order: 'asc' },
            include: {
              anime: {
                select: {
                  id: true,
                  title: true,
                  coverImage: true,
                  score: true,
                },
              },
            },
          },
          _count: {
            select: { entries: true },
          },
        },
      }),
    ]);

    return {
      lists: lists.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        isPublic: l.isPublic,
        totalItems: l._count.entries,
        createdAt: l.createdAt,
        user: l.user,
        previewAnime: l.entries.map((e) => e.anime),
      })),
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

  async getListById(id) {
    const list = await prisma.customList.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        entries: {
          orderBy: { order: 'asc' },
          include: {
            anime: true,
          },
        },
      },
    });

    if (!list) {
      throw ApiError.notFound('Collection list not found');
    }

    return {
      id: list.id,
      title: list.title,
      description: list.description,
      isPublic: list.isPublic,
      user: list.user,
      createdAt: list.createdAt,
      totalItems: list.entries.length,
      entries: list.entries.map((e) => ({
        id: e.id,
        order: e.order,
        anime: e.anime,
      })),
    };
  }

  async createList(userId, { title, description, isPublic = true, animeIds = [] }) {
    if (!title || !title.trim()) {
      throw ApiError.badRequest('List title is required');
    }

    const list = await prisma.customList.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
        entries: {
          create: animeIds.map((animeId, idx) => ({
            animeId,
            order: idx,
          })),
        },
      },
      include: {
        entries: {
          include: {
            anime: true,
          },
        },
      },
    });

    return list;
  }

  async deleteList(userId, id) {
    const list = await prisma.customList.findUnique({
      where: { id },
    });

    if (!list) {
      throw ApiError.notFound('List not found');
    }

    if (list.userId !== userId) {
      throw ApiError.forbidden('You are not authorized to delete this list');
    }

    await prisma.customList.delete({
      where: { id },
    });

    return { message: 'List deleted successfully' };
  }
}

module.exports = new ListService();
