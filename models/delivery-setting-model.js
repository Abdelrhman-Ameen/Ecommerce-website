const mongoose = require('mongoose');

const deliverySettingSchema = new mongoose.Schema({
  key: { type: String, default: 'delivery', unique: true, immutable: true },
  deliveryFee: { type: Number, required: true, min: 0, max: 100000, default: 25 },
  freeShippingThreshold: { type: Number, min: 1, max: 10000000, default: 2000 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.models.DeliverySetting || mongoose.model('DeliverySetting', deliverySettingSchema);
