const Cart = require("../models/cart-model");
const Order = require("../models/order-model");
const Product = require("../models/product-model");

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.status(400).json({ status: "fail", message: "Cart is empty" });
    for (const item of cart.items) {
      if (!item.product || item.quantity > item.product.stock) return res.status(400).json({ status: "fail", message: `${item.product?.name || "A product"} is out of stock` });
    }
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingPrice = subtotal >= 2000 ? 0 : 25;
    const items = cart.items.map((item) => ({ product: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity }));
    const order = await Order.create({
      user: req.userId,
      items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      shippingPrice,
      totalPrice: subtotal + shippingPrice,
    });
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product.id, { $inc: { stock: -item.quantity } });
    }
    cart.items = [];
    await cart.save();
    res.status(201).json({ status: "success", message: "Order placed successfully", data: { order } });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort("-createdAt");
  res.status(200).json({ status: "success", count: orders.length, data: { orders } });
};

const getOrderById = async (req, res) => {
  const query = req.userRole === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.userId };
  const order = await Order.findOne(query).populate("items.product");
  if (!order) return res.status(404).json({ status: "fail", message: "Order not found" });
  res.status(200).json({ status: "success", data: { order } });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "firstName lastName email").sort("-createdAt");
  res.status(200).json({ status: "success", count: orders.length, data: { orders } });
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ status: "fail", message: "Order not found" });
    res.status(200).json({ status: "success", message: "Order status updated", data: { order } });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
