const crypto = require('crypto');
const SupportSetting = require('../models/support-setting-model');
const SupportTicket = require('../models/support-ticket-model');
const AppError = require('../utils/app-error');

function defaultSettings() {
  return {
    email: process.env.SUPPORT_EMAIL || 'support@vellora.store',
    phone: process.env.SUPPORT_PHONE || '+20 100 000 0000',
    hours: process.env.SUPPORT_HOURS || 'Sunday–Thursday, 9:00–17:00 Cairo time',
  };
}

async function settingsDocument() {
  return SupportSetting.findOne({ key: 'support' }).lean();
}

async function getContact(req, res) {
  const settings = await settingsDocument();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'success', data: { settings: settings || defaultSettings() } });
}

function ticketNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `VEL-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function createTicket(req, res) {
  const ticket = await SupportTicket.create({
    ticketNumber: ticketNumber(),
    user: req.userId || null,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    category: req.body.category || 'other',
    subject: req.body.subject,
    message: req.body.message,
  });
  res.status(201).json({ status: 'success', message: 'Support ticket created', data: { ticket } });
}

async function getMyTickets(req, res) {
  const tickets = await SupportTicket.find({ user: req.userId }).sort('-createdAt').limit(50).lean();
  res.status(200).json({ status: 'success', data: { tickets } });
}

async function getAdminSupport(req, res) {
  const status = req.query.status;
  const filter = status && status !== 'all' ? { status } : {};
  const [settings, tickets] = await Promise.all([
    settingsDocument(),
    SupportTicket.find(filter).populate('user', 'firstName lastName email phone').sort('-createdAt').limit(250).lean(),
  ]);
  res.status(200).json({ status: 'success', data: { settings: settings || defaultSettings(), tickets } });
}

async function updateSettings(req, res) {
  const settings = await SupportSetting.findOneAndUpdate(
    { key: 'support' },
    { key: 'support', email: req.body.email, phone: req.body.phone, hours: req.body.hours || '', updatedBy: req.userId },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
  res.status(200).json({ status: 'success', message: 'Support contact details saved', data: { settings } });
}

async function updateTicket(req, res) {
  const update = { status: req.body.status, adminNote: req.body.adminNote || '', handledBy: req.userId };
  update.resolvedAt = req.body.status === 'resolved' ? new Date() : null;
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after', runValidators: true });
  if (!ticket) throw new AppError('Support ticket not found', 404);
  res.status(200).json({ status: 'success', message: 'Ticket updated', data: { ticket } });
}

module.exports = { getContact, createTicket, getMyTickets, getAdminSupport, updateSettings, updateTicket };
