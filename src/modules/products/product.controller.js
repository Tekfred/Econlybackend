const productService = require('./product.service');

async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({ data: product });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProductById };
