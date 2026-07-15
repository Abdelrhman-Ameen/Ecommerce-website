const User = require('../models/user-model');
const Product = require('../models/product-model');
const Order = require('../models/order-model');
const OfflineSale = require('../models/offline-sale-model');

async function getDashboard(req, res) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5, 1);
  sixMonthsAgo.setUTCHours(0, 0, 0, 0);

  const [usersCount, productsCount, ordersCount, lowStockProducts, onlineSales, offlineSales, cancelled, monthlyOnline, monthlyOffline, statusBreakdown, inventory, recentOrders, latestProducts, highestDebts] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Product.find({ $or: [{ stock: { $lte: 5 } }, { isManuallyUnavailable: true }] }).select('name stock imageUrl price isManuallyUnavailable').sort('stock').limit(8).lean(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: {
        _id: null,
        revenue: { $sum: '$totalPrice' },
        unitsSold: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.quantity'] } } } },
        activeOrders: { $sum: 1 },
        deliveredRevenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0] } },
      } },
    ]),
    OfflineSale.aggregate([{ $group: {
      _id: null,
      revenue: { $sum: '$totalAmount' },
      collected: { $sum: '$amountPaid' },
      outstandingDebt: { $sum: '$balanceDue' },
      unitsSold: { $sum: '$quantity' },
      salesCount: { $sum: 1 },
    } }]),
    Order.aggregate([
      { $match: { status: 'cancelled' } },
      { $group: { _id: null, value: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: sixMonthsAgo } } },
      { $project: {
        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: '$totalPrice',
      } },
      { $group: { _id: '$month', revenue: { $sum: '$revenue' }, sales: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    OfflineSale.aggregate([
      { $match: { saleDate: { $gte: sixMonthsAgo } } },
      { $project: { month: { $dateToString: { format: '%Y-%m', date: '$saleDate' } }, revenue: '$totalAmount' } },
      { $group: { _id: '$month', revenue: { $sum: '$revenue' }, sales: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$totalPrice' } } }]),
    Product.aggregate([{ $group: {
      _id: null,
      units: { $sum: '$stock' },
      retailValue: { $sum: { $multiply: ['$stock', '$price'] } },
      unavailableProducts: { $sum: { $cond: [{ $or: [{ $eq: ['$stock', 0] }, '$isManuallyUnavailable'] }, 1, 0] } },
    } }]),
    Order.find().populate('user', 'firstName lastName email phone').sort('-createdAt').limit(6).lean(),
    Product.find().sort('-createdAt').limit(4).lean(),
    OfflineSale.aggregate([
      { $group: { _id: '$customerKey', customerName: { $first: '$customerName' }, phone: { $first: '$phone' }, balanceDue: { $sum: '$balanceDue' }, lastActivityAt: { $max: '$saleDate' } } },
      { $match: { balanceDue: { $gt: 0 } } },
      { $sort: { balanceDue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const online = onlineSales[0] || {};
  const offline = offlineSales[0] || {};
  const monthMap = new Map();
  for (const item of monthlyOnline) monthMap.set(item._id, { month: item._id, onlineRevenue: item.revenue, offlineRevenue: 0, revenue: item.revenue, sales: item.sales });
  for (const item of monthlyOffline) {
    const current = monthMap.get(item._id) || { month: item._id, onlineRevenue: 0, offlineRevenue: 0, revenue: 0, sales: 0 };
    current.offlineRevenue += item.revenue;
    current.revenue += item.revenue;
    current.sales += item.sales;
    monthMap.set(item._id, current);
  }
  const monthlySales = [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month));
  const totalTransactions = (online.activeOrders || 0) + (offline.salesCount || 0);
  const totalRevenue = (online.revenue || 0) + (offline.revenue || 0);

  res.status(200).json({
    status: 'success',
    data: {
      usersCount,
      productsCount,
      ordersCount,
      offlineSalesCount: offline.salesCount || 0,
      totalTransactions,
      totalRevenue,
      onlineRevenue: online.revenue || 0,
      offlineRevenue: offline.revenue || 0,
      collectedOfflineRevenue: offline.collected || 0,
      outstandingDebt: offline.outstandingDebt || 0,
      averageSaleValue: totalTransactions ? totalRevenue / totalTransactions : 0,
      unitsSold: (online.unitsSold || 0) + (offline.unitsSold || 0),
      deliveredRevenue: online.deliveredRevenue || 0,
      cancelledValue: cancelled[0]?.value || 0,
      cancelledOrders: cancelled[0]?.count || 0,
      monthlySales,
      statusBreakdown: statusBreakdown.map((item) => ({ status: item._id, count: item.count, value: item.value })),
      inventory: inventory[0] || { units: 0, retailValue: 0, unavailableProducts: 0 },
      lowStockProducts,
      recentOrders,
      latestProducts,
      highestDebts,
    },
  });
}

async function getUsers(req, res) {
  const users = await User.find().sort('-createdAt').lean();
  res.status(200).json({ status: 'success', data: { users } });
}

module.exports = { getDashboard, getUsers };
