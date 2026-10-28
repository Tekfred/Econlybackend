const { Router } = require('express');
const cartController = require('./cart.controller');
const { authenticate } = require('../../middleware/authenticate');

const router = Router();
router.get('/', authenticate, cartController.getCart);

module.exports = router;
