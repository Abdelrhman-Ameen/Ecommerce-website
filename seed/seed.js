require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db-connect');
const User = require('../models/user-model');
const Product = require('../models/product-model');
const Category = require('../models/category-model');

const fashion = (name, subcategory, price, stock, image, description, extras = {}) => ({
  name, category: 'fashion', subcategory, price, stock,
  imageUrl: `/assets/catalog/fashion/${image}.webp`, description,
  ...extras,
});

const products = [
  fashion('Moonlit Draped Evening Gown', 'dresses', 4200, 6, 'fashion-01', 'A luminous full-length occasion gown with long cape sleeves, a softly draped bodice, and an elegant modest silhouette.', { oldPrice: 4800, featured: true, isNewArrival: true }),
  fashion('Mist Tulle Maxi Skirt', 'skirts', 2900, 9, 'fashion-02', 'A floor-length tulle skirt styled with soft knitwear for a refined, fully covered look that moves beautifully.', { featured: true }),
  fashion('Midnight Wide-Leg Layering Set', 'sets', 2450, 13, 'fashion-03', 'A tonal three-piece look pairing fluid wide-leg trousers with a long structured coat and clean jersey layer.', { isNewArrival: true }),
  fashion('Ash Rose Column Abaya', 'dresses', 3100, 5, 'fashion-04', 'A restrained full-length abaya with long sleeves, a softly defined waist, and an elongated rose-grey drape.'),
  fashion('Rose Atelier Handbag', 'bags', 1850, 11, 'fashion-05', 'A structured rose-toned shoulder bag with polished hardware, an adjustable strap, and a compact everyday interior.', { featured: true, isNewArrival: true }),
  fashion('Wine Frame Sunglasses', 'accessories', 650, 21, 'fashion-06', 'Oversized wine-colored sunglasses with softly faceted frames and tinted lenses for an expressive finishing touch.'),
  fashion('Pearl Minaudière Bag', 'bags', 2150, 7, 'fashion-07', 'A pearl-finished occasion bag with a compact silhouette, luminous texture, and a refined detachable carry strap.'),
  fashion('Noir Column Maxi Skirt', 'skirts', 1650, 14, 'fashion-08', 'A clean ankle-length black skirt with a straight column line, styled for understated everyday layering.', { isNewArrival: true }),
  fashion('Citrus Court Trainers', 'shoes', 2300, 10, 'fashion-09', 'Statement court trainers in citrus, teal, and cream with a cushioned profile designed for energetic everyday styling.'),
  fashion('Sandstone Knit Dress', 'knitwear', 1950, 12, 'fashion-10', 'A soft neutral knit dress with a relaxed column line, tactile finish, and effortless layering proportions.'),
  fashion('Heritage Tailored Modest Set', 'sets', 2250, 16, 'fashion-11', 'A composed blazer-and-wide-trouser pairing with a refined headscarf and considered neutral accessories.', { featured: true }),
  fashion('Weekend Straight Denim', 'denim', 1750, 18, 'fashion-12', 'Classic straight-leg denim with a clean mid rise, timeless blue wash, and dependable structure for daily wear.'),
  fashion('Terracotta Bomber Jacket', 'outerwear', 2600, 8, 'fashion-13', 'A lightweight terracotta bomber with clean ribbed edges, practical pockets, and an understated satin finish.', { isNewArrival: true }),
  fashion('Ivory Fringe Poncho', 'outerwear', 1550, 15, 'fashion-14', 'An open-knit ivory poncho with hand-finished fringe and an easy drape that brings texture to transitional outfits.'),
  fashion('Cloud Ribbed Sweater', 'knitwear', 1450, 20, 'fashion-15', 'An oversized cloud-white sweater with deep ribbing, generous sleeves, and a soft cocooning hand feel.'),
  fashion('Atelier Leather Bag', 'bags', 1800, 9, 'fashion-05', 'A structured leather tote with reinforced handles, considered interior storage, and a softly polished finish.', { oldPrice: 2200 }),
  fashion('Classic Poplin Shirt', 'shirts', 1250, 24, 'fashion-03', 'A crisp long-sleeve poplin shirt with an elongated cuff, relaxed body, and versatile clean white finish.'),
  fashion('Soft Tailored T-Shirt', 't-shirts', 750, 28, 'fashion-10', 'A refined everyday T-shirt cut from smooth cotton jersey with a neat neckline and softly tailored proportion.', { isNewArrival: true }),
  fashion('Vellora Signature T-Shirt', 't-shirts', 850, 22, 'fashion-15', 'A premium rib-knit T-shirt with a relaxed shoulder, substantial hand feel, and subtle tonal Vellora detailing.'),
  fashion('Fluid Wide-Leg Trousers', 'trousers', 1800, 17, 'fashion-11', 'High-rise wide-leg trousers with a fluid drape, precise front crease, and an easy full-length silhouette.'),
  { name: 'Geo Plant Pot', category: 'plants', price: 520, stock: 19, imageUrl: '/assets/catalog/plants-01.webp', description: 'A faceted ceramic planter with a mineral palette and drainage-ready form for shelves and sunny living spaces.', featured: true },
  { name: 'Olive Ceramic Planter', category: 'plants', price: 680, stock: 12, imageUrl: '/assets/catalog/plants-02.webp', description: 'A softly glazed ceramic planter paired with a calm botanical profile for modern homes and workspaces.' },
  { name: 'Aperture Film Camera', category: 'photography', price: 3200, stock: 4, imageUrl: '/assets/catalog/photography-01.webp', description: 'A tactile film camera for considered everyday photography, with direct controls and a timeless compact form.' },
  { name: 'Lumina Desk Lamp', category: 'lighting', price: 1450, stock: 12, imageUrl: '/assets/catalog/lighting-01.webp', description: 'A precision task lamp with an adjustable head and warm glare-free illumination for desks and reading corners.' },
  { name: 'Matte Coffee Mug', category: 'kitchen', price: 390, stock: 31, imageUrl: '/assets/catalog/kitchen-01.webp', description: 'A hand-finished ceramic mug with a tactile matte glaze and balanced handle for coffee, tea, or cocoa.' },
  { name: 'Wireless Studio Headphones', category: 'electronics', price: 3990, oldPrice: 4490, stock: 10, imageUrl: '/assets/catalog/electronics-01.webp', description: 'Immersive over-ear headphones with balanced sound, active noise control, and comfortable all-day padding.' },
  { name: 'Minimalist Lounge Chair', category: 'furniture', price: 8900, stock: 3, imageUrl: '/assets/catalog/furniture-01.webp', description: 'A refined lounge chair balancing tailored upholstery, a slim frame, and generous comfort in a small footprint.' },
  { name: 'Aeris Sculptural Vase', category: 'home decor', price: 1250, stock: 14, imageUrl: '/assets/catalog/decor-01.webp', description: 'An exploration of organic form, finished with a matte neutral surface for quiet and considered interiors.' },
];

const roots = ['fashion', 'plants', 'photography', 'lighting', 'kitchen', 'electronics', 'furniture', 'home decor'];
const fashionSubcategories = ['accessories', 'bags', 'denim', 'dresses', 'knitwear', 'outerwear', 'sets', 'shirts', 'shoes', 'skirts', 't-shirts', 'trousers'];
const legacySeedNames = [
  'Aeris Sculptural Vase', 'Wireless Studio Headphones', 'Lumina Desk Lamp', 'Minimalist Chair', 'Atelier Leather Bag',
  'Matte Coffee Mug', 'Studio Smart Watch', 'Oak Table Organizer', 'Abstract Wall Art', 'Geo Plant Pot',
  'Handcrafted Wooden Tray', 'Santal Scented Candle', 'Walnut Serving Tray', 'Sculpted Ceramic Lamp',
  'Olive Ceramic Planter', 'AI Vision Lens Pro',
];

async function seed() {
  if (!process.env.ADMIN_EMAIL) throw new Error('ADMIN_EMAIL must be configured');
  await connectDatabase();

  let admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');
  if (!admin) {
    if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is required when creating the first admin');
    admin = new User({ firstName: 'Vellora', lastName: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
  } else {
    admin.role = 'admin';
  }
  await admin.save();

  for (const name of roots) {
    await Category.findOneAndUpdate({ name }, { name, parent: null, createdBy: admin._id }, { upsert: true, returnDocument: 'after', runValidators: true });
  }
  for (const name of fashionSubcategories) {
    await Category.findOneAndUpdate({ name }, { name, parent: 'fashion', createdBy: admin._id }, { upsert: true, returnDocument: 'after', runValidators: true });
  }

  for (const product of products) {
    const catalogProduct = { ...product, gallery: product.gallery || [], collection: undefined, costPrice: product.costPrice ?? Number((product.price * 0.62).toFixed(2)), featured: Boolean(product.featured), isNewArrival: Boolean(product.isNewArrival), isManuallyUnavailable: false };
    await Product.findOneAndUpdate({ name: product.name }, catalogProduct, { upsert: true, returnDocument: 'after', runValidators: true });
  }

  const currentNames = products.map((product) => product.name);
  await Product.deleteMany({ name: { $in: legacySeedNames, $nin: currentNames } });
  console.log(`Seed complete: ${products.length} catalog products, ${roots.length} main categories, and ${fashionSubcategories.length} fashion subcategories. Existing admin password preserved.`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
