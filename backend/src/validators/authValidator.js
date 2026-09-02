// Zod Validation Schemas for Authentication
const { z } = require('zod');

const registerSchema = {
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and hyphens'),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .max(100, 'Email cannot exceed 100 characters')
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(128, 'Password cannot exceed 128 characters'),
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name cannot be empty')
      .max(50, 'Display name cannot exceed 50 characters')
      .optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .optional(),
    username: z
      .string()
      .trim()
      .optional(),
    password: z
      .string()
      .min(1, 'Password is required'),
  }).refine((data) => data.email || data.username, {
    message: 'Either email or username is required to login',
    path: ['email'],
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
};
