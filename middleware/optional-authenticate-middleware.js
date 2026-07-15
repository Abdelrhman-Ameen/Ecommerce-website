const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const AppError = require('../utils/app-error');

async function optionalAuthenticate(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
    const token = req.cookies.luxestudio_session || bearer;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) throw new AppError('This account is no longer available', 401);
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError('Your session is invalid or has expired', 401));
  }
}

module.exports = optionalAuthenticate;
