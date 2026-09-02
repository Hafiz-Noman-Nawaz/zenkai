// Request validation middleware using Zod
const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  try {
    const toValidate = {};

    if (schema.body) {
      toValidate.body = req.body;
    }
    if (schema.query) {
      toValidate.query = req.query;
    }
    if (schema.params) {
      toValidate.params = req.params;
    }

    // If schema has individual targets or is a direct object schema
    if (schema.body || schema.query || schema.params) {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
    } else {
      // Default: treat schema as body validator
      req.body = schema.parse(req.body);
    }

    next();
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(ApiError.badRequest('Validation failed', formattedErrors));
    }
    next(error);
  }
};

module.exports = validate;
