const mongoose = require('mongoose');

function validateProductId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: { code: 'INVALID_PRODUCT_ID', message: 'Product id is invalid.' },
    });
  }

  return next();
}

module.exports = { validateProductId };
