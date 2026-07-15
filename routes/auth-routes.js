const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/auth-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,72}$/;

router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('password').matches(strongPassword).withMessage('Use 10+ characters with uppercase, lowercase, number, and symbol'),
  body('phone').optional({ checkFalsy: true }).matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone number'),
  validate,
], controller.register);

router.post('/login', [
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  validate,
], controller.login);

router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.getProfile);
router.patch('/me', authenticate, [
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('phone').optional({ checkFalsy: true }).matches(/^\+?[0-9]{10,15}$/),
  validate,
], controller.updateProfile);
router.patch('/password', authenticate, [
  body('currentPassword').isString().notEmpty(),
  body('newPassword').matches(strongPassword).withMessage('Use 10+ characters with uppercase, lowercase, number, and symbol'),
  validate,
], controller.changePassword);
router.patch('/favorites/:productId', authenticate, [
  param('productId').isMongoId().withMessage('Invalid product id'),
  validate,
], controller.toggleFavorite);

module.exports = router;
