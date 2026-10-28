const cartService = require('./cart.service');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.auth.userId);
    return res.status(200).json({ data: cart });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getCart };
