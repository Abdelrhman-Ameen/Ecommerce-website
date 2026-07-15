const mongoose = require('mongoose');

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'mobile_wallet', 'other'];

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01, max: 1000000 },
  method: { type: String, enum: PAYMENT_METHODS, required: true, default: 'cash' },
  paidAt: { type: Date, required: true, default: Date.now },
  note: { type: String, trim: true, maxlength: 240, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: true });

const offlineSaleSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  customerKey: { type: String, required: true, trim: true, index: true },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true, trim: true, maxlength: 120 },
  imageUrl: { type: String, required: true, trim: true, maxlength: 500 },
  quantity: { type: Number, required: true, min: 1, max: 1000 },
  unitPrice: { type: Number, required: true, min: 0, max: 1000000 },
  totalAmount: { type: Number, required: true, min: 0, max: 1000000000 },
  amountPaid: { type: Number, required: true, min: 0, max: 1000000000, default: 0 },
  balanceDue: { type: Number, required: true, min: 0, max: 1000000000, default: 0 },
  paymentStatus: { type: String, enum: ['paid', 'partial', 'debt'], required: true, default: 'debt', index: true },
  saleDate: { type: Date, required: true, default: Date.now, index: true },
  payments: { type: [paymentSchema], default: [] },
  note: { type: String, trim: true, maxlength: 500, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

offlineSaleSchema.index({ saleDate: -1, createdAt: -1 });

offlineSaleSchema.pre('validate', function calculateBalance() {
  const normalizeName = (value) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  this.customerName = normalizeName(this.customerName);
  this.phone = (this.phone || '').trim();
  this.customerKey = `${this.customerName.toLowerCase()}::${this.phone}`;
  this.totalAmount = Math.round(this.quantity * this.unitPrice * 100) / 100;
  this.amountPaid = Math.round(this.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) * 100) / 100;
  this.balanceDue = Math.max(0, Math.round((this.totalAmount - this.amountPaid) * 100) / 100);
  this.paymentStatus = this.balanceDue === 0 ? 'paid' : this.amountPaid > 0 ? 'partial' : 'debt';
});

offlineSaleSchema.statics.paymentMethods = PAYMENT_METHODS;

module.exports = mongoose.models.OfflineSale || mongoose.model('OfflineSale', offlineSaleSchema);
