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
const HomepageSetting = require('../models/homepage-setting-model');
const SiteMedia = require('../models/site-media-model');
const Category = require('../models/category-model');
const SupportSetting = require('../models/support-setting-model');
const SupportTicket = require('../models/support-ticket-model');

describe('Vellora API production flow', () => {
  const unique = Date.now();
  const email = `integration-${unique}@example.com`;
  const password = 'Customer-Test!2026';
  const customer = request.agent(app);
  const admin = request.agent(app);
  let userId;
  let productId;
  let orderId;
  let offlineSaleId;
  let uploadedMediaId;
  let uploadedProductMediaId;
  let categoryId;
  let subcategoryId;
  let supportTicketId;
  let originalHomepage;
  let originalSupportSettings;
  const categoryName = `integration testing ${unique}`;

  beforeAll(async () => { await connectDatabase(); originalHomepage = await HomepageSetting.findOne({ key: 'homepage' }).lean(); originalSupportSettings = await SupportSetting.findOne({ key: 'support' }).lean(); });

  afterAll(async () => {
    if (userId) {
      await Promise.all([Cart.deleteMany({ user: userId }), Order.deleteMany({ user: userId }), User.deleteOne({ _id: userId })]);
    }
    await OfflineSale.deleteMany({ customerName: `Integration Debt ${unique}` });
    if (uploadedMediaId) await SiteMedia.deleteOne({ _id: uploadedMediaId });
    if (uploadedProductMediaId) await SiteMedia.deleteOne({ _id: uploadedProductMediaId });
    if (supportTicketId) await SupportTicket.deleteOne({ _id: supportTicketId });
    if (subcategoryId) await Category.deleteOne({ _id: subcategoryId });
    if (categoryId) await Category.deleteOne({ _id: categoryId });
    if (originalHomepage) await HomepageSetting.replaceOne({ key: 'homepage' }, originalHomepage, { upsert: true });
    else await HomepageSetting.deleteOne({ key: 'homepage' });
    if (originalSupportSettings) await SupportSetting.replaceOne({ key: 'support' }, originalSupportSettings, { upsert: true });
    else await SupportSetting.deleteOne({ key: 'support' });
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
    const category = await admin.post('/api/v1/admin/categories').send({ name: `  ${categoryName}  ` }).expect(201);
    categoryId = category.body.data.category._id;
    const subcategoryName = `integration subcategory ${unique}`;
    const subcategory = await admin.post('/api/v1/admin/categories').send({ name: subcategoryName, parent: categoryName }).expect(201);
    subcategoryId = subcategory.body.data.category._id;
    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const productMedia = await admin.post('/api/v1/admin/product-media').send({ dataUrl: tinyPng }).expect(201);
    uploadedProductMediaId = productMedia.body.data.imageUrl.split('/').pop();
    const imageResponse = await request(app).get(productMedia.body.data.imageUrl).expect(200).expect('Content-Type', /image\/png/);
    expect(Buffer.isBuffer(imageResponse.body)).toBe(true);
    expect([...imageResponse.body.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const created = await admin.post('/api/v1/products').send({
      name: `Integration Test ${unique}`,
      description: 'A temporary catalog product used to verify the complete production API workflow.',
      category: `  ${categoryName}  `, subcategory: `  ${subcategoryName}  `, price: 79, costPrice: 40, stock: 3,
      imageUrl: productMedia.body.data.imageUrl, gallery: [], featured: false, isNewArrival: false, isManuallyUnavailable: false,
    }).expect(201);
    productId = created.body.data.product._id;
    expect(created.body.data.product.category).toBe(categoryName);
    expect(created.body.data.product.subcategory).toBe(subcategoryName);
    expect(created.body.data.product.imageUrl).toContain('/api/v1/site/media/');
    const updated = await admin.put(`/api/v1/products/${productId}`).send({ ...created.body.data.product, price: 82, stock: 4 }).expect(200);
    expect(updated.body.data.product.price).toBe(82);
    const filtered = await request(app).get('/api/v1/products').query({ category: categoryName, subcategory: subcategoryName }).expect(200);
    expect(filtered.body.data.products.some((product) => product._id === productId)).toBe(true);
    expect(filtered.body.data.categoryTree.find((item) => item.name === categoryName)?.subcategories).toContain(subcategoryName);
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
    expect(dashboard.body.data).toHaveProperty('productSales');
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
      paymentMethod: 'instapay',
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

  it('records a fully manual store debt without a catalog product or quantity', async () => {
    const manual = await admin.post('/api/v1/admin/offline-sales').send({
      customerName: `Integration Debt ${unique}`,
      manualProductName: 'Unlisted showroom item',
      totalAmount: 125,
      amountPaid: 25,
      paymentMethod: 'vodafone_cash',
      saleDate: new Date().toISOString(),
    }).expect(201);
    expect(manual.body.data.sale.product).toBeNull();
    expect(manual.body.data.sale.quantity).toBeNull();
    expect(manual.body.data.sale.productName).toBe('Unlisted showroom item');
    expect(manual.body.data.sale.balanceDue).toBe(100);
    await OfflineSale.deleteOne({ _id: manual.body.data.sale._id });
  });

  it('manages homepage product choices and persistent uploaded media', async () => {
    const baseline = await request(app).get('/api/v1/site/homepage').expect(200);
    expect(baseline.body.data.heroSlides).toHaveLength(3);
    expect(baseline.body.data.editorialImages).toHaveLength(2);

    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const uploaded = await admin.post('/api/v1/admin/homepage-media').send({ dataUrl: tinyPng }).expect(201);
    const mediaUrl = uploaded.body.data.imageUrl;
    uploadedMediaId = mediaUrl.split('/').pop();
    await request(app).get(mediaUrl).expect(200).expect('Content-Type', /image\/png/);

    try {
      await admin.put('/api/v1/admin/homepage-settings').send({
        heroMode: 'products', heroProductIds: [productId, productId, productId], heroImages: [],
        editorialMode: 'custom', editorialProductIds: [], editorialImages: [mediaUrl, mediaUrl],
      }).expect(200);
      const managed = await request(app).get('/api/v1/site/homepage').expect(200);
      expect(managed.body.data.heroSlides.every((slide) => slide.image.includes('/api/v1/site/media/'))).toBe(true);
      expect(managed.body.data.editorialImages.every((image) => image.image === mediaUrl)).toBe(true);
    } finally {
      if (originalHomepage) await HomepageSetting.replaceOne({ key: 'homepage' }, originalHomepage, { upsert: true });
      else await HomepageSetting.deleteOne({ key: 'homepage' });
    }
  });

  it('creates and resolves a customer support ticket with editable contact details', async () => {
    const contact = await request(app).get('/api/v1/support/contact').expect(200);
    expect(contact.body.data.settings).toHaveProperty('email');
    const created = await customer.post('/api/v1/support/tickets').send({
      name: 'Integration Customer', email, phone: '+201000000099', category: 'order',
      subject: 'Integration support request', message: 'Please verify that this temporary support ticket reaches the admin console.',
    }).expect(201);
    supportTicketId = created.body.data.ticket._id;
    const mine = await customer.get('/api/v1/support/my-tickets').expect(200);
    expect(mine.body.data.tickets.some((ticket) => ticket._id === supportTicketId)).toBe(true);
    const adminView = await admin.get('/api/v1/admin/support').expect(200);
    expect(adminView.body.data.tickets.some((ticket) => ticket._id === supportTicketId)).toBe(true);
    await admin.put('/api/v1/admin/support/settings').send({ email: 'qa-support@vellora.store', phone: '+201000000077', hours: 'Integration hours' }).expect(200);
    const resolved = await admin.patch(`/api/v1/admin/support/tickets/${supportTicketId}`).send({ status: 'resolved', adminNote: 'Resolved by automated verification.' }).expect(200);
    expect(resolved.body.data.ticket.status).toBe('resolved');
    expect(resolved.body.data.ticket.adminNote).toContain('automated verification');
    if (originalSupportSettings) await SupportSetting.replaceOne({ key: 'support' }, originalSupportSettings, { upsert: true });
    else await SupportSetting.deleteOne({ key: 'support' });
  });

  it('deletes the temporary product and clears sessions', async () => {
    if (offlineSaleId) { await OfflineSale.deleteOne({ _id: offlineSaleId }); offlineSaleId = undefined; }
    await admin.delete(`/api/v1/products/${productId}`).expect(200);
    productId = undefined;
    if (subcategoryId) { await admin.delete(`/api/v1/admin/categories/${subcategoryId}`).expect(200); subcategoryId = undefined; }
    if (categoryId) { await admin.delete(`/api/v1/admin/categories/${categoryId}`).expect(200); categoryId = undefined; }
    await customer.post('/api/v1/auth/logout').send({}).expect(200);
    await customer.get('/api/v1/auth/me').expect(401);
  });
});
