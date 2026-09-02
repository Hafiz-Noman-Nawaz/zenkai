// Zod Validation Schemas for Anime Catalog & Search
const { z } = require('zod');
const { SORT_OPTIONS } = require('../config/constants');

const animeQuerySchema = {
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .transform(Number)
      .refine((n) => n > 0, 'Page must be greater than 0')
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .transform(Number)
      .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('20'),
    q: z.string().trim().optional(),
    search: z.string().trim().optional(),
    genre: z.string().trim().optional(),
    status: z.string().trim().optional(),
    season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL', 'winter', 'spring', 'summer', 'fall']).optional(),
    seasonYear: z
      .string()
      .regex(/^\d{4}$/, 'Year must be a 4-digit number')
      .transform(Number)
      .optional(),
    type: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'tv', 'movie', 'ova', 'ona', 'special']).optional(),
    letter: z.string().trim().optional(),
    sortBy: z.enum(Object.values(SORT_OPTIONS)).optional().default(SORT_OPTIONS.POPULARITY),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional().default('desc'),
  }),
};

const animeSearchQuerySchema = {
  query: z.object({
    q: z.string().trim().min(1, 'Search query is required'),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n > 0 && n <= 50, 'Limit must be between 1 and 50')
      .optional()
      .default('20'),
  }),
};

module.exports = {
  animeQuerySchema,
  animeSearchQuerySchema,
};
