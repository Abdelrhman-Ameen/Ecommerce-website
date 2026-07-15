const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 2, maxlength: 50 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

categorySchema.pre('validate', function normalizeName() {
  this.name = typeof this.name === 'string' ? this.name.trim().replace(/\s+/g, ' ').toLowerCase() : this.name;
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
