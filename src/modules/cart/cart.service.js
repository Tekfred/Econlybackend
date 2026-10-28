const Cart = require('./cart.model');

async function getCart(userId) {
  const cart = await Cart.findOne({ userId })
    .populate('items.productId')
    .lean();
  return cart || { userId, items: [] };
}

module.exports = { getCart };
