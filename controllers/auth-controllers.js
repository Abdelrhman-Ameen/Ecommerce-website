const User = require('../models/user-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');
const signToken = require('../utils/get-jwt');

const COOKIE_NAME = 'luxestudio_session';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

function sendSession(res, user, statusCode, message) {
  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
  res.status(statusCode).json({ status: 'success', message, data: { user: user.toJSON() } });
}

async function register(req, res) {
  const existing = await User.exists({ email: req.body.email.toLowerCase() });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    role: 'customer',
  });
  sendSession(res, user, 201, 'Your account is ready');
}

async function login(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await user.passwordMatches(req.body.password))) {
    throw new AppError('Email or password is incorrect', 401);
  }
  sendSession(res, user, 200, `Welcome back, ${user.firstName}`);
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.status(200).json({ status: 'success', message: 'You have been signed out' });
}

async function getProfile(req, res) {
  const user = await User.findById(req.userId).populate('favorites');
  res.status(200).json({ status: 'success', data: { user } });
}

async function toggleFavorite(req, res) {
  if (!(await Product.exists({ _id: req.params.productId }))) throw new AppError('Product not found', 404);
  const user = await User.findById(req.userId);
  const index = user.favorites.findIndex((id) => id.toString() === req.params.productId);
  if (index === -1) user.favorites.push(req.params.productId);
  else user.favorites.splice(index, 1);
  await user.save();
  res.status(200).json({ status: 'success', message: index === -1 ? 'Added to favorites' : 'Removed from favorites', data: { favorites: user.favorites } });
}

async function updateProfile(req, res) {
  const user = await User.findByIdAndUpdate(req.userId, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone || undefined,
  }, { returnDocument: 'after', runValidators: true });
  res.status(200).json({ status: 'success', message: 'Profile updated', data: { user } });
}

async function changePassword(req, res) {
  const user = await User.findById(req.userId).select('+password');
  if (!(await user.passwordMatches(req.body.currentPassword))) throw new AppError('Current password is incorrect', 401);
  user.password = req.body.newPassword;
  await user.save();
  sendSession(res, user, 200, 'Password changed successfully');
}

module.exports = { register, login, logout, getProfile, toggleFavorite, updateProfile, changePassword };
