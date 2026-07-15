const mongoose = require('mongoose');

const supportSettingSchema = new mongoose.Schema({
  key: { type: String, default: 'support', unique: true, immutable: true },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  hours: { type: String, trim: true, maxlength: 160, default: 'Sunday–Thursday, 9:00–17:00 Cairo time' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.SupportSetting || mongoose.model('SupportSetting', supportSettingSchema);
