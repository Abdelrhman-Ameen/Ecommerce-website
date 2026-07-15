const Product = require('../models/product-model');
const Order = require('../models/order-model');
const AppError = require('../utils/app-error');

const SORTS = {
  newest: '-createdAt',
  priceAsc: 'price',
  priceDesc: '-price',
  name: 'name',
};

function normalizeCatalogValue(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : value;
}

function normalizeProductPayload(payload) {
  return {
    ...payload,
    category: normalizeCatalogValue(payload.category),
    collection: normalizeCatalogValue(payload.collection),
  };
}

async function getAllProducts(req, res) {
  const filter = {};
  if (req.query.category) filter.category = req.query.category.toLowerCase();
  if (req.query.collection) filter.collection = req.query.collection.toLowerCase();
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.isNewArrival === 'true') filter.isNewArrival = true;
  if (req.query.inStock === 'true') {
    filter.stock = { $gt: 0 };
    filter.isManuallyUnavailable = { $ne: true };
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.search?.trim()) {
    const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['name', 'description', 'category', 'collection'].map((field) => ({
      [field]: { $regex: escaped, $options: 'i' },
    }));
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48);
  const sort = SORTS[req.query.sort] || SORTS.newest;
  const [products, total, categories, collections, priceBounds] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
    Product.distinct('category'),
    Product.distinct('collection', { collection: { $nin: [null, ''] } }),
    Product.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
  ]);

  res.status(200).json({
    status: 'success',
    data: { products, categories: categories.sort(), collections: collections.sort(), priceBounds: priceBounds[0] || { min: 0, max: 1000 } },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function getProductById(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ status: 'success', data: { product } });
}

async function createProduct(req, res) {
  const product = await Product.create(normalizeProductPayload(req.body));
  res.status(201).json({ status: 'success', message: 'Product created', data: { product } });
}

async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, normalizeProductPayload(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ status: 'success', message: 'Product updated', data: { product } });
}

async function getRecommendations(req, res) {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new AppError('Product not found', 404);

  const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 12);
  const coPurchased = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, 'items.product': product._id } },
    { $unwind: '$items' },
    { $match: { 'items.product': { $ne: product._id } } },
    { $group: { _id: '$items.product', count: { $sum: '$items.quantity' } } },
  ]);
  const coPurchaseScore = new Map(coPurchased.map((item) => [String(item._id), item.count]));
  const candidates = await Product.find({ _id: { $ne: product._id }, stock: { $gt: 0 }, isManuallyUnavailable: { $ne: true } }).lean();
  const normalizedPrice = Math.max(product.price, 1);
  const scored = candidates.map((candidate) => {
    const priceDistance = Math.abs(candidate.price - product.price) / normalizedPrice;
    let score = (coPurchaseScore.get(String(candidate._id)) || 0) * 12;
    if (candidate.category === product.category) score += 8;
    if (candidate.collection && candidate.collection === product.collection) score += 6;
    if (priceDistance <= 0.2) score += 4;
    else if (priceDistance <= 0.5) score += 2;
    if (candidate.featured) score += 1.5;
    if (candidate.isNewArrival) score += 1;
    return { candidate, score };
  });

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      Number(b.candidate.featured) - Number(a.candidate.featured) ||
      new Date(b.candidate.createdAt).getTime() - new Date(a.candidate.createdAt).getTime()
  );
  res.status(200).json({ status: 'success', data: { products: scored.slice(0, limit).map((item) => item.candidate) } });
}

async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ status: 'success', message: 'Product deleted' });
}

module.exports = { getAllProducts, getProductById, getRecommendations, createProduct, updateProduct, deleteProduct };
