const Product = require("../models/product-model");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

const getAllProducts = async (req, res) => {
  try {
    const queryObject = { ...req.query };
    ["sort", "page", "limit", "search"].forEach((field) => delete queryObject[field]);
    const mongoQuery = convertQuery(queryObject);
    if (req.query.search) {
      mongoQuery.$or = ["name", "description", "category"].map((field) => ({ [field]: { $regex: req.query.search, $options: "i" } }));
    }
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const products = await Product.find(mongoQuery)
      .sort(req.query.sort || "-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Product.countDocuments(mongoQuery);
    res.status(200).json({ status: "success", count: products.length, total, page, pages: Math.ceil(total / limit), data: { products } });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });
    res.status(200).json({ status: "success", data: { product } });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

const createProduct = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "fail", message: "Product image is required" });
    const product = await Product.create({ ...req.body, imageUrl: req.file.filename });
    res.status(201).json({ status: "success", message: "Product added successfully", data: { product } });
  } catch (error) {
    if (req.file) deleteUploadedFile("products", req.file.filename);
    res.status(400).json({ status: "error", message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });
    if (req.file) {
      deleteUploadedFile("products", product.imageUrl);
      req.body.imageUrl = req.file.filename;
    }
    Object.assign(product, req.body);
    await product.save();
    res.status(200).json({ status: "success", message: "Product updated successfully", data: { product } });
  } catch (error) {
    if (req.file) deleteUploadedFile("products", req.file.filename);
    res.status(400).json({ status: "error", message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });
    deleteUploadedFile("products", product.imageUrl);
    res.status(200).json({ status: "success", message: "Product deleted successfully" });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

function convertQuery(query) {
  const mongoQuery = {};
  for (const key in query) {
    const match = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);
    if (match) {
      mongoQuery[match[1]] = mongoQuery[match[1]] || {};
      mongoQuery[match[1]][`$${match[2]}`] = Number(query[key]);
    } else if (["featured", "isNewArrival"].includes(key)) mongoQuery[key] = query[key] === "true";
    else mongoQuery[key] = { $regex: query[key], $options: "i" };
  }
  return mongoQuery;
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
