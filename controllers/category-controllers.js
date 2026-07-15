const Category = require('../models/category-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

function normalize(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';
}

async function getCategories(req, res) {
  const [managed, catalog] = await Promise.all([
    Category.find().select('name createdAt').sort('name').lean(),
    Product.distinct('category'),
  ]);
  const managedMap = new Map(managed.map((category) => [category.name, category]));
  const categories = [...new Set([...catalog, ...managedMap.keys()].map(normalize).filter(Boolean))]
    .sort()
    .map((name) => managedMap.get(name) || { _id: null, name, inUse: true, createdAt: null });
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((item) => [item._id, item.count]));
  res.status(200).json({ status: 'success', data: { categories: categories.map((category) => ({ ...category, productCount: countMap.get(category.name) || 0 })) } });
}

async function createCategory(req, res) {
  const name = normalize(req.body.name);
  const existing = await Category.findOne({ name });
  if (existing) throw new AppError('That category already exists', 409);
  const category = await Category.create({ name, createdBy: req.userId });
  res.status(201).json({ status: 'success', message: 'Category created', data: { category: { ...category.toJSON(), productCount: 0 } } });
}

async function deleteCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  if (await Product.exists({ category: category.name })) throw new AppError('Move or delete the products in this category first', 409);
  await category.deleteOne();
  res.status(200).json({ status: 'success', message: 'Category deleted' });
}

module.exports = { getCategories, createCategory, deleteCategory };
