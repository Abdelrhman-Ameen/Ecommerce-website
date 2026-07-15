const express = require('express');
const { body, param } = require('express-validator');
const { rateLimit } = require('express-rate-limit');
const controller = require('../controllers/support-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const optionalAuthenticate = require('../middleware/optional-authenticate-middleware');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
const ticketLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many support tickets. Please wait before trying again.' },
});
const replyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 40,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many support messages. Please wait before trying again.' },
});

router.get('/contact', controller.getContact);
router.post('/tickets', ticketLimiter, optionalAuthenticate, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 160 }),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  body('category').optional().isIn(['order', 'product', 'delivery', 'return', 'account', 'other']),
  body('subject').trim().isLength({ min: 3, max: 160 }),
  body('message').trim().isLength({ min: 10, max: 3000 }),
  validate,
], controller.createTicket);
router.get('/my-tickets', authenticate, controller.getMyTickets);
router.post('/tickets/:id/messages', replyLimiter, authenticate, [
  param('id').isMongoId(),
  body('message').trim().isLength({ min: 1, max: 3000 }),
  validate,
], controller.addCustomerMessage);

module.exports = router;
