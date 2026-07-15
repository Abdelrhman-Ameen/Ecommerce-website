const { validationResult } = require('express-validator');
const AppError = require('../utils/app-error');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return next(new AppError(
    'Please correct the highlighted fields',
    422,
    result.array({ onlyFirstError: true }).map(({ path, msg }) => ({ field: path, message: msg })),
  ));
}

module.exports = validateRequest;
