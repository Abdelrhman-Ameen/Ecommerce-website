const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['customer', 'admin'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  body: { type: String, required: true, trim: true, minlength: 1, maxlength: 3000 },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  category: { type: String, enum: ['order', 'product', 'delivery', 'return', 'account', 'other'], default: 'other' },
  subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
  messages: { type: [supportMessageSchema], default: [] },
  status: { type: String, enum: ['open', 'in_progress', 'waiting_admin', 'waiting_customer', 'resolved'], default: 'waiting_admin', index: true },
  adminNote: { type: String, trim: true, maxlength: 2000, default: '' },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastMessageAt: { type: Date, default: Date.now, index: true },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

supportTicketSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
