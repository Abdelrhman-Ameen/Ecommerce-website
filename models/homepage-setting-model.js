const mongoose = require('mongoose');

const homepageSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'homepage' },
  heroMode: { type: String, enum: ['default', 'products', 'custom'], default: 'default' },
  heroProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  heroImages: [{ type: String, trim: true, maxlength: 500 }],
  editorialMode: { type: String, enum: ['default', 'products', 'custom'], default: 'default' },
  editorialProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  editorialImages: [{ type: String, trim: true, maxlength: 500 }],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.HomepageSetting || mongoose.model('HomepageSetting', homepageSettingSchema);
