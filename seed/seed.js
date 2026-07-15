require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db-connect');
const User = require('../models/user-model');
const Product = require('../models/product-model');

const products = [
  {
    name: 'Aeris Sculptural Vase', category: 'home decor', collection: 'minimalist decor', price: 145, oldPrice: 175, stock: 18,
    imageUrl: '/assets/catalog/catalog-01.jpg', gallery: ['/assets/detail/detail-01.jpg', '/assets/detail/detail-02.jpg', '/assets/detail/detail-03.jpg', '/assets/detail/detail-04.jpg'],
    description: 'An exploration of negative space and organic form. The Aeris vase is crafted from high-fire stoneware and finished with a custom matte bone glaze.',
    featured: true, isNewArrival: true,
  },
  {
    name: 'Wireless Studio Headphones', category: 'electronics', collection: 'studio essentials', price: 299, oldPrice: 349, stock: 24,
    imageUrl: '/assets/catalog/catalog-02.jpg', description: 'Immersive over-ear headphones with balanced studio sound, active noise control, and all-day comfort for focused creative work.',
    featured: true, isNewArrival: true,
  },
  {
    name: 'Lumina Desk Lamp', category: 'furniture', collection: 'modern workspace', price: 89, stock: 12,
    imageUrl: '/assets/catalog/catalog-03.jpg', description: 'A precision task lamp with a clean silhouette, adjustable head, and warm glare-free illumination for desks and reading corners.',
    featured: true,
  },
  {
    name: 'Minimalist Chair', category: 'furniture', collection: 'quiet living', price: 250, oldPrice: 295, stock: 5,
    imageUrl: '/assets/catalog/catalog-04.jpg', description: 'A refined lounge chair balancing tailored upholstery, a slim oak frame, and generous comfort in a small visual footprint.',
    featured: true,
  },
  {
    name: 'Atelier Leather Bag', category: 'accessories', collection: 'daily carry', price: 180, oldPrice: 220, stock: 9,
    imageUrl: '/assets/catalog/catalog-05.jpg', description: 'A structured full-grain leather tote with reinforced handles, considered interior storage, and a softly polished natural finish.',
    isNewArrival: true,
  },
  {
    name: 'Matte Coffee Mug', category: 'kitchen', collection: 'tableware', price: 24, stock: 45,
    imageUrl: '/assets/catalog/catalog-06.jpg', description: 'A hand-finished ceramic mug with a tactile matte glaze, balanced handle, and generous shape for coffee, tea, or cocoa.',

  },
  {
    name: 'Studio Smart Watch', category: 'electronics', collection: 'connected essentials', price: 399, stock: 8,
    imageUrl: '/assets/catalog/catalog-07.jpg', description: 'A polished everyday smartwatch with a bright display, health insights, smart notifications, and a minimal interchangeable band.',
    isNewArrival: true,
  },
  {
    name: 'Oak Table Organizer', category: 'home decor', collection: 'modern workspace', price: 35, stock: 32,
    imageUrl: '/assets/catalog/catalog-08.jpg', description: 'A compact solid-oak organizer that keeps stationery and small essentials ordered while bringing natural warmth to the workspace.',

  },
  {
    name: 'Abstract Wall Art', category: 'home decor', collection: 'gallery edit', price: 120, stock: 7,
    imageUrl: '/assets/catalog/catalog-09.jpg', description: 'A gallery-quality abstract print with archival pigments, subtle tonal movement, and a slim frame ready for modern interiors.',
    featured: true,
  },
  {
    name: 'Geo Plant Pot', category: 'home decor', collection: 'natural home', price: 28, stock: 19,
    imageUrl: '/assets/catalog/catalog-10.jpg', description: 'A faceted ceramic planter with a soft mineral palette and drainage-ready form for desks, shelves, and sunny living spaces.',

  },
  {
    name: 'Handcrafted Wooden Tray', category: 'kitchen', collection: 'artisan wood', price: 55, stock: 14,
    imageUrl: '/assets/catalog/catalog-11.jpg', description: 'A versatile serving tray shaped from responsibly sourced wood, hand-sanded for a smooth edge, and sealed with food-safe oil.',

  },
  {
    name: 'Santal Scented Candle', category: 'home decor', collection: 'quiet rituals', price: 42, stock: 26,
    imageUrl: '/assets/catalog/catalog-12.jpg', description: 'A clean-burning soy candle layered with sandalwood, soft amber, and cedar, poured into a reusable minimalist glass vessel.',
    isNewArrival: true,
  },
];

async function seed() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured');
  }
  await connectDatabase();

  for (const product of products) {
    const catalogProduct = { ...product, costPrice: product.costPrice ?? Number((product.price * 0.62).toFixed(2)), isManuallyUnavailable: false };
    await Product.findOneAndUpdate({ name: product.name }, catalogProduct, { upsert: true, returnDocument: 'after', runValidators: true });
  }

  let admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');
  if (!admin) {
    admin = new User({ firstName: 'Ma3rad', lastName: 'Admin', email: process.env.ADMIN_EMAIL, role: 'admin' });
  }
  admin.password = process.env.ADMIN_PASSWORD;
  admin.role = 'admin';
  await admin.save();

  console.log(`Seed complete: ${products.length} catalog products and admin ${admin.email}`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
