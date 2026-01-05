const { errorResponse } = require('../utils/response');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return errorResponse(res, messages.join(', '), 400, 'VALIDATION_ERROR');
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return errorResponse(res, `${field} already exists`, 409, 'DUPLICATE_ERROR');
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Referenced record does not exist', 400, 'FOREIGN_KEY_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token has expired', 401, 'TOKEN_EXPIRED');
  }

  // Custom application error
  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode, err.code || 'APP_ERROR');
  }

  // Default server error
  return errorResponse(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500,
    'SERVER_ERROR'
  );
};

/**
 * Not found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};

