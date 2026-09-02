// Zod Validation Schemas for Reviews
const { z } = require('zod');
const { RATING_CONFIG } = require('../config/constants');

const createReviewSchema = {
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, 'Review title must be at least 3 characters long')
      .max(100, 'Review title cannot exceed 100 characters'),
    content: z
      .string()
      .trim()
      .min(10, 'Review content must be at least 10 characters long')
      .max(10000, 'Review content cannot exceed 10,000 characters'),
    rating: z
      .number()
      .min(RATING_CONFIG.MIN, `Rating must be at least ${RATING_CONFIG.MIN}`)
      .max(RATING_CONFIG.MAX, `Rating cannot exceed ${RATING_CONFIG.MAX}`),
  }),
};

const updateReviewSchema = {
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, 'Review title must be at least 3 characters long')
      .max(100, 'Review title cannot exceed 100 characters')
      .optional(),
    content: z
      .string()
      .trim()
      .min(10, 'Review content must be at least 10 characters long')
      .max(10000, 'Review content cannot exceed 10,000 characters')
      .optional(),
    rating: z
      .number()
      .min(RATING_CONFIG.MIN, `Rating must be at least ${RATING_CONFIG.MIN}`)
      .max(RATING_CONFIG.MAX, `Rating cannot exceed ${RATING_CONFIG.MAX}`)
      .optional(),
  }).refine((data) => data.title || data.content || data.rating !== undefined, {
    message: 'At least one field (title, content, or rating) must be provided to update',
  }),
};

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
