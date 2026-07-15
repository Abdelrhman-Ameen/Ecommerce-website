const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 1200 },
  category: { type: String, required: true, trim: true, lowercase: true, maxlength: 50, index: true },
  collection: { type: String, trim: true, lowercase: true, maxlength: 80 },
  price: { type: Number, required: true, min: 0, max: 1000000 },
  costPrice: { type: Number, required: true, min: 0, max: 1000000, default: 0 },
  oldPrice: { type: Number, min: 0, max: 1000000 },
  stock: { type: Number, required: true, min: 0, max: 100000, default: 0 },
  isManuallyUnavailable: { type: Boolean, default: false, index: true },
  imageUrl: { type: String, required: true, trim: true, maxlength: 500 },
  gallery: [{ type: String, trim: true, maxlength: 500 }],
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

productSchema.pre('validate', function normalizeCatalogFields() {
  const normalize = (value) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : value;
  this.category = normalize(this.category);
  this.collection = normalize(this.collection);
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
