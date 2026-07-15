const Category = require('../models/category-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

function normalize(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';
}

async function getCategories(req, res) {
  const [managed, catalogPairs] = await Promise.all([
    Category.find().select('name parent createdAt').sort({ parent: 1, name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } }]),
  ]);
  const managedMap = new Map(managed.map((category) => [`${category.parent || ''}:${category.name}`, category]));
  const rootNames = new Set(managed.filter((category) => !category.parent).map((category) => category.name));
  const childPairs = new Set(managed.filter((category) => category.parent).map((category) => `${category.parent}:${category.name}`));
  const rootCounts = new Map();
  const childCounts = new Map();
  for (const item of catalogPairs) {
    const parent = normalize(item._id.category);
    const child = normalize(item._id.subcategory);
    if (!parent) continue;
    rootNames.add(parent);
    rootCounts.set(parent, (rootCounts.get(parent) || 0) + item.count);
    if (child) {
      childPairs.add(`${parent}:${child}`);
      childCounts.set(`${parent}:${child}`, item.count);
    }
  }
  const roots = [...rootNames].sort().map((name) => {
    const category = managedMap.get(`:${name}`) || { _id: null, name, parent: null, createdAt: null };
    return { ...category, parent: null, productCount: rootCounts.get(name) || 0, subcategoryCount: [...childPairs].filter((pair) => pair.startsWith(`${name}:`)).length };
  });
  const children = [...childPairs].sort().map((pair) => {
    const separator = pair.indexOf(':');
    const parent = pair.slice(0, separator);
    const name = pair.slice(separator + 1);
    const category = managedMap.get(pair) || { _id: null, name, parent, createdAt: null };
    return { ...category, parent, productCount: childCounts.get(pair) || 0, subcategoryCount: 0 };
  });
  res.status(200).json({ status: 'success', data: { categories: [...roots, ...children] } });
}

async function createCategory(req, res) {
  const name = normalize(req.body.name);
  const parent = normalize(req.body.parent) || null;
  if (parent && parent === name) throw new AppError('A category cannot be its own parent', 400);
  const existing = await Category.findOne({ name });
  if (existing) throw new AppError('That category already exists', 409);
  if (parent) {
    const parentExists = await Category.exists({ name: parent, parent: null }) || await Product.exists({ category: parent });
    if (!parentExists) throw new AppError('Choose an existing main category first', 400);
  }
  const category = await Category.create({ name, parent, createdBy: req.userId });
  res.status(201).json({ status: 'success', message: 'Category created', data: { category: { ...category.toJSON(), productCount: 0 } } });
}

async function deleteCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  if (category.parent) {
    if (await Product.exists({ category: category.parent, subcategory: category.name })) throw new AppError('Move or delete the products in this subcategory first', 409);
  } else {
    if (await Product.exists({ category: category.name })) throw new AppError('Move or delete the products in this category first', 409);
    if (await Category.exists({ parent: category.name })) throw new AppError('Delete its subcategories first', 409);
  }
  await category.deleteOne();
  res.status(200).json({ status: 'success', message: 'Category deleted' });
}

module.exports = { getCategories, createCategory, deleteCategory };
