const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 1200 },
  category: { type: String, required: true, trim: true, lowercase: true, maxlength: 50, index: true },
  collection: { type: String, trim: true, lowercase: true, maxlength: 80 },
  price: { type: Number, required: true, min: 0, max: 1000000 },
  oldPrice: { type: Number, min: 0, max: 1000000 },
  stock: { type: Number, required: true, min: 0, max: 100000, default: 0 },
  imageUrl: { type: String, required: true, trim: true, maxlength: 500 },
  gallery: [{ type: String, trim: true, maxlength: 500 }],
  rating: { type: Number, min: 0, max: 5, default: 4.8 },
  reviewsCount: { type: Number, min: 0, default: 0 },
  featured: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false, index: true },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
