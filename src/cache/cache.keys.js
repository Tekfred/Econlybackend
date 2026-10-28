const CacheKeys = Object.freeze({
  productById: (id) => `product:${id}`,
});

module.exports = { CacheKeys };
