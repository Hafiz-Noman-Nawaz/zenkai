// Zod Validation Schemas for User Profile
const { z } = require('zod');

const updateProfileSchema = {
  body: z.object({
    displayName: z
      .string()
      .trim()
      .max(50, 'Display name cannot exceed 50 characters')
      .optional()
      .nullable(),
    bio: z
      .string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional()
      .nullable(),
    avatar: z
      .string()
      .url('Avatar must be a valid URL')
      .max(500, 'Avatar URL too long')
      .optional()
      .nullable(),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and hyphens')
      .optional(),
  }),
};

module.exports = {
  updateProfileSchema,
};
