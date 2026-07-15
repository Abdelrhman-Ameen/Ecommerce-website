const User = require('../models/user-model');
const Product = require('../models/product-model');
const Order = require('../models/order-model');

async function getDashboard(req, res) {
  const [usersCount, productsCount, ordersCount, lowStockProducts, revenue, recentOrders, latestProducts] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Product.find({ stock: { $lte: 5 } }).select('name stock imageUrl price').sort('stock').limit(8).lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().populate('user', 'firstName lastName email').sort('-createdAt').limit(6).lean(),
    Product.find().sort('-createdAt').limit(4).lean(),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      usersCount,
      productsCount,
      ordersCount,
      totalRevenue: revenue[0]?.total || 0,
      lowStockProducts,
      recentOrders,
      latestProducts,
    },
  });
}

async function getUsers(req, res) {
  const users = await User.find().sort('-createdAt').lean();
  res.status(200).json({ status: 'success', data: { users } });
}

module.exports = { getDashboard, getUsers };
