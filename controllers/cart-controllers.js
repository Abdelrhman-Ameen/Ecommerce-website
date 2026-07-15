const Cart = require('../models/cart-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

async function populatedCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

async function getCart(req, res) {
  const cart = await populatedCart(req.userId);
  res.status(200).json({ status: 'success', data: { cart } });
}

async function addToCart(req, res) {
  const product = await Product.findById(req.body.productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.isManuallyUnavailable) throw new AppError('This product is currently unavailable', 409);
  if (product.stock < req.body.quantity) throw new AppError('Requested quantity is not available', 409);

  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) cart = new Cart({ user: req.userId, items: [] });
  const existing = cart.items.find((item) => item.product.toString() === product.id);
  const requestedTotal = (existing?.quantity || 0) + req.body.quantity;
  if (requestedTotal > product.stock) throw new AppError(`Only ${product.stock} units are available`, 409);
  if (existing) existing.quantity = requestedTotal;
  else cart.items.push({ product: product.id, quantity: req.body.quantity });
  await cart.save();
  await cart.populate('items.product');
  res.status(200).json({ status: 'success', message: 'Added to your cart', data: { cart } });
}

async function updateCartItem(req, res) {
  const [cart, product] = await Promise.all([
    Cart.findOne({ user: req.userId }),
    Product.findById(req.params.productId),
  ]);
  if (!cart || !product) throw new AppError('Cart item not found', 404);
  if (product.isManuallyUnavailable) throw new AppError('This product is currently unavailable', 409);
  const item = cart.items.find((entry) => entry.product.toString() === product.id);
  if (!item) throw new AppError('Cart item not found', 404);
  if (req.body.quantity > product.stock) throw new AppError(`Only ${product.stock} units are available`, 409);
  item.quantity = req.body.quantity;
  await cart.save();
  await cart.populate('items.product');
  res.status(200).json({ status: 'success', message: 'Cart updated', data: { cart } });
}

async function removeCartItem(req, res) {
  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) throw new AppError('Cart not found', 404);
  cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product');
  res.status(200).json({ status: 'success', message: 'Item removed', data: { cart } });
}

async function clearCart(req, res) {
  const cart = await Cart.findOneAndUpdate({ user: req.userId }, { $set: { items: [] } }, { returnDocument: 'after', upsert: true });
  res.status(200).json({ status: 'success', message: 'Cart cleared', data: { cart } });
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
