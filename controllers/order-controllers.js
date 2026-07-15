const mongoose = require('mongoose');
const Cart = require('../models/cart-model');
const Order = require('../models/order-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

async function createOrder(req, res) {
  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.userId }).populate('items.product').session(session);
      if (!cart?.items.length) throw new AppError('Your cart is empty', 400);

      const items = [];
      let subtotal = 0;
      for (const item of cart.items) {
        if (!item.product) throw new AppError('A product in your cart is no longer available', 409);
        if (item.product.isManuallyUnavailable) throw new AppError(`${item.product.name} is currently unavailable`, 409);
        const updated = await Product.findOneAndUpdate(
          { _id: item.product.id, stock: { $gte: item.quantity }, isManuallyUnavailable: { $ne: true } },
          { $inc: { stock: -item.quantity } },
          { returnDocument: 'after', session },
        );
        if (!updated) throw new AppError(`${item.product.name} does not have enough stock`, 409);
        subtotal += item.product.price * item.quantity;
        items.push({
          product: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          price: item.product.price,
          costPrice: item.product.costPrice || 0,
          quantity: item.quantity,
        });
      }

      const shippingPrice = subtotal >= 500 ? 0 : 25;
      [createdOrder] = await Order.create([{
        user: req.userId,
        items,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: 'cash',
        subtotal,
        shippingPrice,
        totalPrice: subtotal + shippingPrice,
      }], { session });

      cart.items = [];
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json({ status: 'success', message: 'Your order has been placed', data: { order: createdOrder } });
}

async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.userId }).sort('-createdAt').lean();
  res.status(200).json({ status: 'success', data: { orders } });
}

async function getOrderById(req, res) {
  const filter = req.userRole === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.userId };
  const order = await Order.findOne(filter).populate('user', 'firstName lastName email phone role createdAt');
  if (!order) throw new AppError('Order not found', 404);
  res.status(200).json({ status: 'success', data: { order } });
}

async function getAllOrders(req, res) {
  const status = req.query.status;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).populate('user', 'firstName lastName email phone role createdAt').sort('-createdAt').lean();
  res.status(200).json({ status: 'success', data: { orders } });
}

async function updateOrderStatus(req, res) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after', runValidators: true },
  );
  if (!order) throw new AppError('Order not found', 404);
  res.status(200).json({ status: 'success', message: 'Order status updated', data: { order } });
}

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
