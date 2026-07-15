const OfflineSale = require('../models/offline-sale-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

async function getOfflineSales(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
  const [sales, totals, debtors] = await Promise.all([
    OfflineSale.find().sort({ saleDate: -1, createdAt: -1 }).limit(limit).lean(),
    OfflineSale.aggregate([{ $group: {
      _id: null,
      revenue: { $sum: '$totalAmount' },
      collected: { $sum: '$amountPaid' },
      outstandingDebt: { $sum: '$balanceDue' },
      salesCount: { $sum: 1 },
    } }]),
    OfflineSale.aggregate([
      { $group: {
        _id: '$customerKey',
        customerName: { $first: '$customerName' },
        phone: { $first: '$phone' },
        totalSales: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$amountPaid' },
        balanceDue: { $sum: '$balanceDue' },
        saleCount: { $sum: 1 },
        lastActivityAt: { $max: '$saleDate' },
      } },
      { $match: { balanceDue: { $gt: 0 } } },
      { $sort: { balanceDue: -1, lastActivityAt: -1 } },
      { $limit: 20 },
    ]),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      sales,
      summary: totals[0] || { revenue: 0, collected: 0, outstandingDebt: 0, salesCount: 0 },
      debtors,
    },
  });
}

async function createOfflineSale(req, res) {
  const quantity = Number(req.body.quantity);
  const product = await Product.findOneAndUpdate(
    { _id: req.body.productId, stock: { $gte: quantity }, isManuallyUnavailable: { $ne: true } },
    { $inc: { stock: -quantity } },
    { returnDocument: 'after' },
  );
  if (!product) throw new AppError('Product is unavailable or does not have enough stock', 409);

  const unitPrice = req.body.unitPrice === undefined ? product.price : Number(req.body.unitPrice);
  const totalAmount = Math.round(quantity * unitPrice * 100) / 100;
  const initialPayment = Number(req.body.amountPaid || 0);
  if (initialPayment > totalAmount) {
    await Product.updateOne({ _id: product._id }, { $inc: { stock: quantity } });
    throw new AppError('Amount paid cannot exceed the sale total', 422);
  }

  try {
    const payments = initialPayment > 0 ? [{
      amount: initialPayment,
      method: req.body.paymentMethod || 'cash',
      paidAt: req.body.paymentDate || req.body.saleDate || new Date(),
      note: req.body.paymentNote || '',
      recordedBy: req.userId,
    }] : [];
    const sale = await OfflineSale.create({
      customerName: req.body.customerName,
      customerKey: 'pending',
      phone: req.body.phone || '',
      product: product._id,
      productName: product.name,
      imageUrl: product.imageUrl,
      quantity,
      unitPrice,
      totalAmount,
      saleDate: req.body.saleDate || new Date(),
      payments,
      note: req.body.note || '',
      recordedBy: req.userId,
    });
    res.status(201).json({ status: 'success', message: 'Store sale recorded', data: { sale } });
  } catch (error) {
    await Product.updateOne({ _id: product._id }, { $inc: { stock: quantity } });
    throw error;
  }
}

async function addPayment(req, res) {
  const sale = await OfflineSale.findById(req.params.id);
  if (!sale) throw new AppError('Store sale not found', 404);
  const amount = Number(req.body.amount);
  if (amount > sale.balanceDue) throw new AppError('Payment cannot exceed the remaining debt', 422);

  sale.payments.push({
    amount,
    method: req.body.method,
    paidAt: req.body.paidAt || new Date(),
    note: req.body.note || '',
    recordedBy: req.userId,
  });
  await sale.save();
  res.status(200).json({ status: 'success', message: 'Payment recorded', data: { sale } });
}

module.exports = { getOfflineSales, createOfflineSale, addPayment };
