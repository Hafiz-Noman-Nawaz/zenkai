// Centralized Error Handling Middleware
const ApiError = require('../utils/apiError');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  // Handle Prisma unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'Field';
    error = ApiError.conflict(`${target} already exists`);
  }

  // Handle Prisma record not found (P2025)
  if (err.code === 'P2025') {
    error = ApiError.notFound('Requested resource not found');
  }

  // If error is not an instance of ApiError, wrap as 500
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, null, false);
  }

  const response = {
    success: false,
    message: error.message,
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  // Include stack trace only in development
  if (env.isDevelopment && !error.isOperational) {
    response.stack = err.stack;
  }

  // In production, log internal unexpected errors
  if (env.isProduction && !error.isOperational) {
    console.error('Unhandled Internal Error:', err);
  }

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
