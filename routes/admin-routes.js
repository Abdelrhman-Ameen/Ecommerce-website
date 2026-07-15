const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/admin-controllers');
const offlineSales = require('../controllers/offline-sales-controllers');
const homepage = require('../controllers/homepage-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const authorize = require('../middleware/authorize-middleware');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.getUsers);
const managedImage = (value) => typeof value === 'string' && (/^\/assets\//.test(value) || /^\/api\/v1\/site\/media\/[a-f0-9]{24}$/i.test(value) || /^https:\/\//i.test(value));
router.get('/homepage-settings', homepage.getHomepage);
router.put('/homepage-settings', [
  body('heroMode').isIn(['default', 'products', 'custom']),
  body('heroProductIds').optional().isArray({ max: 3 }),
  body('heroProductIds.*').optional({ checkFalsy: true }).isMongoId(),
  body('heroImages').optional().isArray({ max: 3 }),
  body('heroImages.*').optional().custom(managedImage),
  body('editorialMode').isIn(['default', 'products', 'custom']),
  body('editorialProductIds').optional().isArray({ max: 2 }),
  body('editorialProductIds.*').optional({ checkFalsy: true }).isMongoId(),
  body('editorialImages').optional().isArray({ max: 2 }),
  body('editorialImages.*').optional().custom(managedImage),
  validate,
], homepage.updateHomepage);
router.post('/homepage-media', body('dataUrl').isString().isLength({ min: 100, max: 245000 }), validate, homepage.uploadMedia);
router.get('/offline-sales', query('limit').optional().isInt({ min: 1, max: 250 }), validate, offlineSales.getOfflineSales);
router.post('/offline-sales', [
  body('customerName').trim().isLength({ min: 2, max: 100 }),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^\+?[0-9]{10,15}$/),
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 1, max: 1000 }),
  body('unitPrice').optional().isFloat({ min: 0, max: 1000000 }),
  body('amountPaid').optional().isFloat({ min: 0, max: 1000000000 }),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'mobile_wallet', 'other']),
  body('saleDate').optional().isISO8601().toDate(),
  body('paymentDate').optional().isISO8601().toDate(),
  body('note').optional().trim().isLength({ max: 500 }),
  body('paymentNote').optional().trim().isLength({ max: 240 }),
  validate,
], offlineSales.createOfflineSale);
router.patch('/offline-sales/:id/payments', [
  param('id').isMongoId(),
  body('amount').isFloat({ min: 0.01, max: 1000000 }),
  body('method').isIn(['cash', 'card', 'bank_transfer', 'mobile_wallet', 'other']),
  body('paidAt').optional().isISO8601().toDate(),
  body('note').optional().trim().isLength({ max: 240 }),
  validate,
], offlineSales.addPayment);

module.exports = router;
