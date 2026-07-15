const mongoose = require('mongoose');

const siteMediaSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
  byteLength: { type: Number, required: true, min: 1, max: 550000 },
  purpose: { type: String, enum: ['homepage', 'product'], required: true, default: 'homepage', index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

siteMediaSchema.index({ createdAt: -1 });

module.exports = mongoose.models.SiteMedia || mongoose.model('SiteMedia', siteMediaSchema);
