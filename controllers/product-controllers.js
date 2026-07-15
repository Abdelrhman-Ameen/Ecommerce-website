const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

const SORTS = {
  newest: '-createdAt',
  priceAsc: 'price',
  priceDesc: '-price',
  rating: '-rating',
  name: 'name',
};

async function getAllProducts(req, res) {
  const filter = {};
  if (req.query.category) filter.category = req.query.category.toLowerCase();
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.isNewArrival === 'true') filter.isNewArrival = true;
  if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
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
  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
    Product.distinct('category'),
  ]);

  res.status(200).json({
    status: 'success',
    data: { products, categories },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function getProductById(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ status: 'success', data: { product } });
}

async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json({ status: 'success', message: 'Product created', data: { product } });
}

async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ status: 'success', message: 'Product updated', data: { product } });
}

async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ status: 'success', message: 'Product deleted' });
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
