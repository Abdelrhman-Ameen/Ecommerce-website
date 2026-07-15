const express = require('express');
const controller = require('../controllers/admin-controllers');
const authenticate = require('../middleware/authenticate-middleware');
const authorize = require('../middleware/authorize-middleware');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.getUsers);

module.exports = router;
