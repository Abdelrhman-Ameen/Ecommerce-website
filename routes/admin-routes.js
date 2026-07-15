const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/admin-controllers');
const offlineSales = require('../controllers/offline-sales-controllers');
const homepage = require('../controllers/homepage-controllers');
const categories = require('../controllers/category-controllers');
const support = require('../controllers/support-controllers');
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
router.post('/product-media', body('dataUrl').isString().isLength({ min: 100, max: 750000 }), validate, homepage.uploadProductMedia);
router.get('/categories', categories.getCategories);
router.post('/categories', body('name').trim().isLength({ min: 2, max: 50 }), body('parent').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 50 }), validate, categories.createCategory);
router.delete('/categories/:id', param('id').isMongoId(), validate, categories.deleteCategory);
router.get('/support', query('status').optional().isIn(['all', 'open', 'in_progress', 'resolved']), validate, support.getAdminSupport);
router.put('/support/settings', [
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 160 }),
  body('phone').trim().isLength({ min: 5, max: 30 }),
  body('hours').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  validate,
], support.updateSettings);
router.patch('/support/tickets/:id', [
  param('id').isMongoId(),
  body('status').isIn(['open', 'in_progress', 'resolved']),
  body('adminNote').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }),
  validate,
], support.updateTicket);
router.get('/offline-sales', query('limit').optional().isInt({ min: 1, max: 250 }), validate, offlineSales.getOfflineSales);
router.post('/offline-sales', [
  body('customerName').optional({ values: 'falsy' }).trim().isLength({ min: 2, max: 100 }),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^\+?[0-9]{10,15}$/),
  body('productId').optional({ values: 'falsy' }).isMongoId(),
  body('manualProductName').optional({ values: 'falsy' }).trim().isLength({ min: 2, max: 120 }),
  body('quantity').optional({ values: 'falsy' }).isInt({ min: 1, max: 1000 }),
  body('unitPrice').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1000000 }),
  body('totalAmount').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1000000000 }),
  body('amountPaid').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1000000000 }),
  body('paymentMethod').optional().isIn(['cash', 'instapay', 'vodafone_cash']),
  body('saleDate').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('paymentDate').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('note').optional().trim().isLength({ max: 500 }),
  body('paymentNote').optional().trim().isLength({ max: 240 }),
  validate,
], offlineSales.createOfflineSale);
router.patch('/offline-sales/:id/payments', [
  param('id').isMongoId(),
  body('amount').isFloat({ min: 0.01, max: 1000000 }),
  body('method').isIn(['cash', 'instapay', 'vodafone_cash']),
  body('paidAt').optional().isISO8601().toDate(),
  body('note').optional().trim().isLength({ max: 240 }),
  validate,
], offlineSales.addPayment);

module.exports = router;
