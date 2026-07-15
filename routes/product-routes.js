const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/product-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const authorize = require('../middleware/authorize-middleware');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
const imageUrl = (value) => value.startsWith('/assets/') || /^https:\/\//i.test(value);
function productFields(partial = false) {
  const field = (name) => (partial ? body(name).optional() : body(name));
  return [
    field('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters'),
    field('description').trim().isLength({ min: 20, max: 1200 }).withMessage('Description must be 20–1200 characters'),
    field('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category is required'),
    body('collection').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
    field('price').isFloat({ min: 0, max: 1000000 }).toFloat().withMessage('Enter a valid price'),
    field('costPrice').isFloat({ min: 0, max: 1000000 }).toFloat().withMessage('Enter a valid cost price'),
    body('oldPrice').optional({ nullable: true }).isFloat({ min: 0, max: 1000000 }).toFloat(),
    field('stock').isInt({ min: 0, max: 100000 }).toInt().withMessage('Enter a valid stock quantity'),
    body('isManuallyUnavailable').optional().isBoolean().toBoolean(),
    field('imageUrl').trim().custom(imageUrl).withMessage('Use an /assets path or HTTPS image URL'),
    body('gallery').optional().isArray({ max: 8 }).withMessage('Gallery may contain up to 8 images'),
    body('gallery.*').optional().custom(imageUrl).withMessage('Gallery images must use /assets paths or HTTPS URLs'),
    body('featured').optional().isBoolean().toBoolean(),
    body('isNewArrival').optional().isBoolean().toBoolean(),
  ];
}

router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 48 }).toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('sort').optional().isIn(['newest', 'priceAsc', 'priceDesc', 'name']),
  validate,
], controller.getAllProducts);
router.post('/', authenticate, authorize('admin'), productFields(), validate, controller.createProduct);

router.get('/:id/recommendations', param('id').isMongoId(), query('limit').optional().isInt({ min: 1, max: 12 }).toInt(), validate, controller.getRecommendations);
router.get('/:id', param('id').isMongoId(), validate, controller.getProductById);
router.put('/:id', authenticate, authorize('admin'), param('id').isMongoId(), productFields(), validate, controller.updateProduct);
router.patch('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId(),
  ...productFields(true),
  validate,
], controller.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), param('id').isMongoId(), validate, controller.deleteProduct);

module.exports = router;
