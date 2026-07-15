const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/order-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const authorize = require('../middleware/authorize-middleware');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
router.use(authenticate);

router.get('/delivery-settings', controller.getDeliverySettings);

router.post('/', [
  body('shippingAddress.fullName').trim().isLength({ min: 3, max: 100 }).withMessage('Full name is required'),
  body('shippingAddress.email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email'),
  body('shippingAddress.phone').trim().matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone'),
  body('shippingAddress.street').trim().isLength({ min: 5, max: 180 }).withMessage('Street address is required'),
  body('shippingAddress.governorate').trim().isLength({ min: 2, max: 80 }).withMessage('Governorate is required'),
  body('shippingAddress.city').trim().isLength({ min: 2, max: 80 }).withMessage('City is required'),
  validate,
], controller.createOrder);
router.get('/my-orders', controller.getMyOrders);
router.get('/', authorize('admin'), query('status').optional().isIn(['ordered', 'processing', 'shipped', 'delivered', 'cancelled']), validate, controller.getAllOrders);
router.patch('/:id/status', authorize('admin'), [
  param('id').isMongoId(),
  body('status').isIn(['ordered', 'processing', 'shipped', 'delivered', 'cancelled']),
  validate,
], controller.updateOrderStatus);
router.get('/:id', param('id').isMongoId(), validate, controller.getOrderById);

module.exports = router;
