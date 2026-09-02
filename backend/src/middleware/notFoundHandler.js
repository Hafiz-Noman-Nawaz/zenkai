// 404 Route Not Found Handler
const ApiError = require('../utils/apiError');

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl}`));
};

module.exports = notFoundHandler;
