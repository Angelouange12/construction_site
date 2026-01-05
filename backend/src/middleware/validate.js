const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware - checks for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);
    return errorResponse(res, messages.join(', '), 400, 'VALIDATION_ERROR');
  }
  
  next();
};

module.exports = validate;

