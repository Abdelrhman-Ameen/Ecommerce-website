const User = require('../models/user-model');
const Product = require('../models/product-model');
const Order = require('../models/order-model');

async function getDashboard(req, res) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5, 1);
  sixMonthsAgo.setUTCHours(0, 0, 0, 0);

  const [usersCount, productsCount, ordersCount, lowStockProducts, sales, cancelled, monthlySales, statusBreakdown, inventory, recentOrders, latestProducts] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Product.find({ $or: [{ stock: { $lte: 5 } }, { isManuallyUnavailable: true }] }).select('name stock imageUrl price isManuallyUnavailable').sort('stock').limit(8).lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: {
        _id: null,
        revenue: { $sum: '$totalPrice' },
        productRevenue: { $sum: '$subtotal' },
        shippingRevenue: { $sum: '$shippingPrice' },
        costOfGoods: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', { $multiply: [{ $ifNull: ['$$this.costPrice', 0] }, '$$this.quantity'] }] } } } },
        unitsSold: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.quantity'] } } } },
        activeOrders: { $sum: 1 },
        deliveredRevenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0] } },
      } },
    ]),
    Order.aggregate([
      { $match: { status: 'cancelled' } },
      { $group: { _id: null, value: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: sixMonthsAgo } } },
      { $project: {
        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: '$totalPrice',
        productRevenue: '$subtotal',
        cost: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', { $multiply: [{ $ifNull: ['$$this.costPrice', 0] }, '$$this.quantity'] }] } } },
      } },
      { $group: { _id: '$month', revenue: { $sum: '$revenue' }, profit: { $sum: { $subtract: ['$productRevenue', '$cost'] } }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$totalPrice' } } }]),
    Product.aggregate([{ $group: {
      _id: null,
      units: { $sum: '$stock' },
      costValue: { $sum: { $multiply: ['$stock', { $ifNull: ['$costPrice', 0] }] } },
      retailValue: { $sum: { $multiply: ['$stock', '$price'] } },
      unavailableProducts: { $sum: { $cond: [{ $or: [{ $eq: ['$stock', 0] }, '$isManuallyUnavailable'] }, 1, 0] } },
    } }]),
    Order.find().populate('user', 'firstName lastName email phone').sort('-createdAt').limit(6).lean(),
    Product.find().sort('-createdAt').limit(4).lean(),
  ]);

  const salesData = sales[0] || {};
  const grossProfit = (salesData.productRevenue || 0) - (salesData.costOfGoods || 0);
  const profitMargin = salesData.productRevenue ? (grossProfit / salesData.productRevenue) * 100 : 0;

  res.status(200).json({
    status: 'success',
    data: {
      usersCount,
      productsCount,
      ordersCount,
      totalRevenue: salesData.revenue || 0,
      productRevenue: salesData.productRevenue || 0,
      shippingRevenue: salesData.shippingRevenue || 0,
      costOfGoods: salesData.costOfGoods || 0,
      grossProfit,
      profitMargin,
      averageOrderValue: salesData.activeOrders ? salesData.revenue / salesData.activeOrders : 0,
      unitsSold: salesData.unitsSold || 0,
      deliveredRevenue: salesData.deliveredRevenue || 0,
      cancelledValue: cancelled[0]?.value || 0,
      cancelledOrders: cancelled[0]?.count || 0,
      monthlySales: monthlySales.map((item) => ({ month: item._id, revenue: item.revenue, profit: item.profit, orders: item.orders })),
      statusBreakdown: statusBreakdown.map((item) => ({ status: item._id, count: item.count, value: item.value })),
      inventory: inventory[0] || { units: 0, costValue: 0, retailValue: 0, unavailableProducts: 0 },
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
