const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/cart-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.getCart);
router.post('/', [
  body('productId').isMongoId().withMessage('Invalid product id'),
  body('quantity').isInt({ min: 1, max: 99 }).toInt().withMessage('Quantity must be between 1 and 99'),
  validate,
], controller.addToCart);
router.delete('/', controller.clearCart);
router.patch('/:productId', [
  param('productId').isMongoId(),
  body('quantity').isInt({ min: 1, max: 99 }).toInt(),
  validate,
], controller.updateCartItem);
router.delete('/:productId', param('productId').isMongoId(), validate, controller.removeCartItem);

module.exports = router;
