const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, lowercase: true, minlength: 2, maxlength: 50 },
  parent: { type: String, default: null, trim: true, lowercase: true, minlength: 2, maxlength: 50, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

categorySchema.index({ parent: 1, name: 1 }, { unique: true });

categorySchema.pre('validate', function normalizeName() {
  const normalize = (value) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : value;
  this.name = normalize(this.name);
  this.parent = normalize(this.parent) || null;
  if (this.name && this.parent && this.name === this.parent) this.invalidate('parent', 'A category cannot be its own parent');
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
