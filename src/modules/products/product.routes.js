const { Router } = require('express');
const productController = require('./product.controller');
const { validateProductId } = require('./product.validation');

const router = Router();
router.get('/:id', validateProductId, productController.getProductById);

module.exports = router;
