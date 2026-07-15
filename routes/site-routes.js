const express = require('express');
const { param } = require('express-validator');
const controller = require('../controllers/homepage-controllers');
const validate = require('../middleware/validate-middleware');

const router = express.Router();
router.get('/homepage', controller.getHomepage);
router.get('/media/:id', param('id').isMongoId(), validate, controller.getMedia);

module.exports = router;
