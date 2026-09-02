// Rate limiting middleware for sensitive endpoints
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Standard auth rate limiter (100 requests per 15 minutes in production, generous in dev/test)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isTest ? 1000 : (env.isDevelopment ? 500 : 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

module.exports = {
  authLimiter,
};
