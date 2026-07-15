const AppError = require('../utils/app-error');

function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404));
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong';
  let details = error.details;

  if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
  } else if (error.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(error.keyValue || {})[0] || 'Value'} already exists`;
  } else if (error.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (statusCode >= 500) {
    console.error(`[${req.id || 'request'}]`, error);
    if (process.env.NODE_ENV === 'production') message = 'An unexpected server error occurred';
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(details ? { details } : {}),
    requestId: req.id,
  });
}

module.exports = { notFound, errorHandler };
