const User = require("../models/user-model");
const Product = require("../models/product-model");
const Order = require("../models/order-model");

const getDashboard = async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, lowStockProducts, revenue] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Product.find({ stock: { $lte: 5 } }).select("name stock imageUrl").sort("stock"),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      data: { usersCount, productsCount, ordersCount, totalRevenue: revenue[0]?.total || 0, lowStockProducts },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt");
    res.status(200).json({ status: "success", count: users.length, data: { users } });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

module.exports = { getDashboard, getUsers };
