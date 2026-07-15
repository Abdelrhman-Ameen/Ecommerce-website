const crypto = require('crypto');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  },
  paymentMethod: { type: String, enum: ['cash'], default: 'cash' },
  subtotal: { type: Number, required: true, min: 0 },
  shippingPrice: { type: Number, default: 25, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['ordered', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'ordered',
    index: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

orderSchema.pre('validate', function addOrderNumber() {
  if (!this.orderNumber) {
    this.orderNumber = `LX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
