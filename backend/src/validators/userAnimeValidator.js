// Zod Validation Schemas for User Anime List Management
const { z } = require('zod');
const { VALID_STATUSES, RATING_CONFIG } = require('../config/constants');

const createUserAnimeSchema = {
  body: z.object({
    animeId: z.string().min(1, 'animeId is required'),
    status: z.enum(VALID_STATUSES).optional().default('PLAN_TO_WATCH'),
    score: z
      .number()
      .min(RATING_CONFIG.MIN, `Score must be at least ${RATING_CONFIG.MIN}`)
      .max(RATING_CONFIG.MAX, `Score cannot exceed ${RATING_CONFIG.MAX}`)
      .optional()
      .nullable(),
    progress: z
      .number()
      .int('Progress must be an integer')
      .min(0, 'Progress cannot be negative')
      .optional()
      .default(0),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
    isFavorite: z.boolean().optional().default(false),
    startedAt: z.string().datetime().optional().nullable(),
    completedAt: z.string().datetime().optional().nullable(),
  }),
};

const updateUserAnimeSchema = {
  body: z.object({
    status: z.enum(VALID_STATUSES).optional(),
    score: z
      .number()
      .min(RATING_CONFIG.MIN, `Score must be at least ${RATING_CONFIG.MIN}`)
      .max(RATING_CONFIG.MAX, `Score cannot exceed ${RATING_CONFIG.MAX}`)
      .optional()
      .nullable(),
    progress: z
      .number()
      .int('Progress must be an integer')
      .min(0, 'Progress cannot be negative')
      .optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
    isFavorite: z.boolean().optional(),
    startedAt: z.string().datetime().optional().nullable(),
    completedAt: z.string().datetime().optional().nullable(),
  }),
};

const updateProgressSchema = {
  body: z.object({
    progress: z
      .number()
      .int('Progress must be an integer')
      .min(0, 'Progress cannot be negative'),
  }),
};

const updateScoreSchema = {
  body: z.object({
    score: z
      .number()
      .min(RATING_CONFIG.MIN, `Score must be at least ${RATING_CONFIG.MIN}`)
      .max(RATING_CONFIG.MAX, `Score cannot exceed ${RATING_CONFIG.MAX}`)
      .nullable(),
  }),
};

const updateFavoriteSchema = {
  body: z.object({
    isFavorite: z.boolean(),
  }),
};

module.exports = {
  createUserAnimeSchema,
  updateUserAnimeSchema,
  updateProgressSchema,
  updateScoreSchema,
  updateFavoriteSchema,
};
