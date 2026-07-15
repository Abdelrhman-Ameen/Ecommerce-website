const AppError = require('../utils/app-error');

module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) return next(new AppError('You do not have permission to perform this action', 403));
  return next();
};
