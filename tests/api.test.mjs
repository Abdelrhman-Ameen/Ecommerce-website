import 'dotenv/config';
import request from 'supertest';
import mongoose from 'mongoose';
import { createRequire } from 'node:module';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
const require = createRequire(import.meta.url);
const app = require('../app');
const connectDatabase = require('../config/db-connect');
const User = require('../models/user-model');
const Product = require('../models/product-model');
const Cart = require('../models/cart-model');
const Order = require('../models/order-model');
const OfflineSale = require('../models/offline-sale-model');

describe('Ma3rad El Gamila API production flow', () => {
  const unique = Date.now();
  const email = `integration-${unique}@example.com`;
  const password = 'Customer-Test!2026';
  const customer = request.agent(app);
  const admin = request.agent(app);
  let userId;
  let productId;
  let orderId;
  let offlineSaleId;

  beforeAll(async () => { await connectDatabase(); });

  afterAll(async () => {
    if (userId) {
      await Promise.all([Cart.deleteMany({ user: userId }), Order.deleteMany({ user: userId }), User.deleteOne({ _id: userId })]);
    }
    await OfflineSale.deleteMany({ customerName: `Integration Debt ${unique}` });
    await Product.deleteMany({ name: new RegExp(`Integration Test ${unique}`) });
    await mongoose.disconnect();
  });

  it('reports service health', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);
    expect(response.body.status).toBe('success');
  });

  it('registers and restores a customer session', async () => {
    const registered = await customer.post('/api/v1/auth/register').send({ firstName: 'Integration', lastName: 'Customer', email, password, phone: '+201000000099' }).expect(201);
    userId = registered.body.data.user._id;
    const profile = await customer.get('/api/v1/auth/me').expect(200);
    expect(profile.body.data.user.email).toBe(email);
    expect(profile.body.data.user.role).toBe('customer');
  });

  it('enforces admin authorization and supports product CRUD', async () => {
    await customer.post('/api/v1/products').send({}).expect(403);
    await admin.post('/api/v1/auth/login').send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }).expect(200);
    const created = await admin.post('/api/v1/products').send({
      name: `Integration Test ${unique}`,
      description: 'A temporary catalog product used to verify the complete production API workflow.',
      category: '  Testing  ', collection: '  Automated   Checks ', price: 79, costPrice: 40, stock: 3,
      imageUrl: '/assets/catalog/catalog-01.jpg', gallery: [], featured: false, isNewArrival: false, isManuallyUnavailable: false,
    }).expect(201);
    productId = created.body.data.product._id;
    expect(created.body.data.product.category).toBe('testing');
    expect(created.body.data.product.collection).toBe('automated checks');
    const updated = await admin.put(`/api/v1/products/${productId}`).send({ ...created.body.data.product, price: 82, stock: 4 }).expect(200);
    expect(updated.body.data.product.price).toBe(82);
  });

  it('supports favorites, cart CRUD, checkout, and order tracking', async () => {
    await customer.patch(`/api/v1/auth/favorites/${productId}`).send({}).expect(200);
    await customer.post('/api/v1/cart').send({ productId, quantity: 2 }).expect(200);
    const cart = await customer.get('/api/v1/cart').expect(200);
    expect(cart.body.data.cart.items[0].quantity).toBe(2);
    await customer.patch(`/api/v1/cart/${productId}`).send({ quantity: 1 }).expect(200);
    await customer.post('/api/v1/orders').send({ shippingAddress: { fullName: 'Integration Customer', email, phone: '+201000000099', street: '10 Integration Street', city: 'Cairo' } }).expect(422);
    const order = await customer.post('/api/v1/orders').send({ shippingAddress: { fullName: 'Integration Customer', email, phone: '+201000000099', street: '10 Integration Street', governorate: 'Cairo', city: 'Cairo' } }).expect(201);
    orderId = order.body.data.order._id;
    const orders = await customer.get('/api/v1/orders/my-orders').expect(200);
    expect(orders.body.data.orders.some((item) => item._id === orderId)).toBe(true);
    await admin.patch(`/api/v1/orders/${orderId}/status`).send({ status: 'processing' }).expect(200);
    const tracked = await customer.get(`/api/v1/orders/${orderId}`).expect(200);
    expect(tracked.body.data.order.status).toBe('processing');
    expect(tracked.body.data.order.shippingAddress.governorate).toBe('Cairo');
    expect(tracked.body.data.order.items[0].costPrice).toBe(40);
  });

  it('supports recommendations, analytics, and manual stock overrides', async () => {
    const recommendations = await request(app).get(`/api/v1/products/${productId}/recommendations`).expect(200);
    expect(Array.isArray(recommendations.body.data.products)).toBe(true);
    const dashboard = await admin.get('/api/v1/admin/dashboard').expect(200);
    expect(dashboard.body.data).not.toHaveProperty('grossProfit');
    expect(dashboard.body.data).toHaveProperty('offlineRevenue');
    expect(dashboard.body.data).toHaveProperty('monthlySales');
    await admin.patch(`/api/v1/products/${productId}`).send({ isManuallyUnavailable: true }).expect(200);
    await customer.post('/api/v1/cart').send({ productId, quantity: 1 }).expect(409);
    await admin.patch(`/api/v1/products/${productId}`).send({ isManuallyUnavailable: false }).expect(200);
  });

  it('records an offline sale and clears its dated customer debt', async () => {
    const created = await admin.post('/api/v1/admin/offline-sales').send({
      customerName: `Integration Debt ${unique}`,
      phone: '+201000000088',
      productId,
      quantity: 1,
      unitPrice: 60,
      amountPaid: 20,
      paymentMethod: 'card',
      saleDate: new Date().toISOString(),
    }).expect(201);
    offlineSaleId = created.body.data.sale._id;
    expect(created.body.data.sale.paymentStatus).toBe('partial');
    expect(created.body.data.sale.balanceDue).toBe(40);

    const ledger = await admin.get('/api/v1/admin/offline-sales').expect(200);
    expect(ledger.body.data.debtors.some((item) => item.customerName === `Integration Debt ${unique}` && item.balanceDue === 40)).toBe(true);

    const payment = await admin.patch(`/api/v1/admin/offline-sales/${offlineSaleId}/payments`).send({
      amount: 40,
      method: 'cash',
      paidAt: new Date().toISOString(),
    }).expect(200);
    expect(payment.body.data.sale.paymentStatus).toBe('paid');
    expect(payment.body.data.sale.balanceDue).toBe(0);

    const dashboard = await admin.get('/api/v1/admin/dashboard').expect(200);
    expect(dashboard.body.data.offlineRevenue).toBeGreaterThanOrEqual(60);
  });

  it('deletes the temporary product and clears sessions', async () => {
    if (offlineSaleId) { await OfflineSale.deleteOne({ _id: offlineSaleId }); offlineSaleId = undefined; }
    await admin.delete(`/api/v1/products/${productId}`).expect(200);
    productId = undefined;
    await customer.post('/api/v1/auth/logout').send({}).expect(200);
    await customer.get('/api/v1/auth/me').expect(401);
  });
});
