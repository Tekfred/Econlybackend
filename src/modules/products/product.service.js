const Product = require('./product.model');
const cacheService = require('../../cache/cache.service');
const { CacheKeys } = require('../../cache/cache.keys');
const { CacheTtl } = require('../../cache/cache.ttl');

async function getProductById(id) {
  const key = CacheKeys.productById(id);
  const cached = await cacheService.get(key);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      await cacheService.del(key);
    }
  }

  const product = await Product.findById(id).lean();
  if (!product || !product.isActive) {
    const error = new Error('Product was not found.');
    error.code = 'PRODUCT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  await cacheService.set(key, JSON.stringify(product), CacheTtl.product);
  return product;
}

module.exports = { getProductById };
