const Cart = require("../models/cart-model");
const Product = require("../models/product-model");

const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: req.userId, items: [] });
  res.status(200).json({ status: "success", data: { cart } });
};

const addToCart = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity) || 1;
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });
    if (quantity < 1 || quantity > product.stock) return res.status(400).json({ status: "fail", message: "Requested quantity is not available" });
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) cart = new Cart({ user: req.userId, items: [] });
    const item = cart.items.find((entry) => entry.product.toString() === product.id);
    if (item) item.quantity = Math.min(item.quantity + quantity, product.stock);
    else cart.items.push({ product: product.id, quantity });
    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ status: "success", message: "Product added to cart", data: { cart } });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

const updateCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    const item = cart?.items.find((entry) => entry.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ status: "fail", message: "Cart item not found" });
    const product = await Product.findById(req.params.productId);
    const quantity = Number(req.body.quantity);
    if (quantity < 1 || quantity > product.stock) return res.status(400).json({ status: "fail", message: "Requested quantity is not available" });
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ status: "success", data: { cart } });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

const removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.status(404).json({ status: "fail", message: "Cart not found" });
  cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product");
  res.status(200).json({ status: "success", data: { cart } });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
