const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  category: { type: String, required: true, trim: true, lowercase: true },
  collection: { type: String, trim: true, lowercase: true },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  imageUrl: { type: String, required: true },
  processedImageUrl: { type: String },
  imageQuality: {
    score: Number,
    status: { type: String, enum: ["good", "warning", "poor"] },
    noiseLevel: Number,
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewsCount: { type: Number, min: 0, default: 0 },
  featured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
}, { timestamps: true, suppressReservedKeysWarning: true });

module.exports = mongoose.model("Product", productSchema);
