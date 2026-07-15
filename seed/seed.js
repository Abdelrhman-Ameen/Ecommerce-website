require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db-connect');
const User = require('../models/user-model');
const Product = require('../models/product-model');
const Category = require('../models/category-model');
const DeliverySetting = require('../models/delivery-setting-model');

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
  { name: 'Matte Coffee Mug', category: 'kitchen', subcategory: 'drinkware', price: 390, stock: 31, imageUrl: '/assets/catalog/kitchen-01.webp', description: 'A hand-finished ceramic mug with a tactile matte glaze and balanced handle for coffee, tea, or cocoa.' },
  { name: 'Artisan Counter Caddy', category: 'kitchen', subcategory: 'serveware', price: 980, stock: 14, imageUrl: '/assets/catalog/kitchen-02.jpg', description: 'A warm wood counter caddy that gathers serving utensils, linens, and everyday essentials into one considered display.' },
  { name: 'Glass Pantry Canister', category: 'kitchen', subcategory: 'storage', price: 320, stock: 25, imageUrl: '/assets/catalog/kitchen-03.jpg', description: 'A clear glass pantry canister with a secure metal lid, designed for neat, visible storage of dry ingredients.' },
  { name: 'Wireless Studio Headphones', category: 'electronics', subcategory: 'audio', price: 3990, oldPrice: 4490, stock: 10, imageUrl: '/assets/catalog/electronics-01.webp', description: 'Immersive over-ear headphones with balanced sound, active noise control, and comfortable all-day padding.' },
  { name: 'Minimal Smart Watch', category: 'electronics', subcategory: 'wearables', price: 4750, stock: 8, imageUrl: '/assets/catalog/electronics-02.jpg', description: 'A streamlined smart watch with a vivid activity display, everyday notifications, and a comfortable dark leather strap.' },
  { name: 'Compact Ambient Speaker', category: 'electronics', subcategory: 'smart home', price: 3650, stock: 12, imageUrl: '/assets/catalog/electronics-03.jpg', description: 'A compact mesh speaker with room-filling sound, clean voice control, and a subtle form suited to modern interiors.' },
  { name: 'Minimalist Lounge Chair', category: 'furniture', subcategory: 'seating', price: 8900, stock: 3, imageUrl: '/assets/catalog/furniture-01.webp', description: 'A refined lounge chair balancing tailored upholstery, a slim frame, and generous comfort in a small footprint.' },
  { name: 'Slate Pedestal Side Table', category: 'furniture', subcategory: 'tables', price: 4200, stock: 7, imageUrl: '/assets/catalog/furniture-02.jpg', description: 'A slim pedestal side table with a softly rounded top and restrained dark finish for compact living spaces.' },
  { name: 'Woven Front Storage Cabinet', category: 'furniture', subcategory: 'storage', price: 11800, stock: 4, imageUrl: '/assets/catalog/furniture-03.jpg', description: 'A warm wood storage cabinet with woven cane doors, elevated legs, and practical shelving behind its tactile front.' },
  { name: 'Aeris Sculptural Vase', category: 'home decor', subcategory: 'vases', price: 1250, stock: 14, imageUrl: '/assets/catalog/decor-01.webp', description: 'An exploration of organic form, finished with a matte neutral surface for quiet and considered interiors.' },
  { name: 'Cadence Abstract Wall Print', category: 'home decor', subcategory: 'wall art', price: 1750, stock: 9, imageUrl: '/assets/catalog/decor-02.jpg', description: 'A saturated abstract art print with expressive layers of ochre, crimson, and ink for a confident interior focal point.' },
  { name: 'Cloud Woven Throw', category: 'home decor', subcategory: 'textiles', price: 1450, stock: 16, imageUrl: '/assets/catalog/decor-03.jpg', description: 'A generously scaled woven throw with an oversized braided texture and calm neutral tone for sofas and reading chairs.' },
];

const roots = ['fashion', 'kitchen', 'electronics', 'furniture', 'home decor'];
const subcategoriesByRoot = {
  fashion: ['accessories', 'bags', 'denim', 'dresses', 'knitwear', 'outerwear', 'sets', 'shirts', 'shoes', 'skirts', 't-shirts', 'trousers'],
  kitchen: ['drinkware', 'serveware', 'storage'],
  electronics: ['audio', 'smart home', 'wearables'],
  furniture: ['seating', 'storage', 'tables'],
  'home decor': ['textiles', 'vases', 'wall art'],
};
const deprecatedCategories = ['plants', 'photography', 'lighting'];
const legacySeedNames = [
  'Aeris Sculptural Vase', 'Wireless Studio Headphones', 'Lumina Desk Lamp', 'Minimalist Chair', 'Atelier Leather Bag',
  'Matte Coffee Mug', 'Studio Smart Watch', 'Oak Table Organizer', 'Abstract Wall Art', 'Geo Plant Pot',
  'Handcrafted Wooden Tray', 'Santal Scented Candle', 'Walnut Serving Tray', 'Sculpted Ceramic Lamp',
  'Olive Ceramic Planter', 'AI Vision Lens Pro',
  'Aperture Film Camera', 'Lumina Desk Lamp', 'Geo Plant Pot', 'Olive Ceramic Planter',
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
  await DeliverySetting.updateOne(
    { key: 'delivery' },
    { $setOnInsert: { key: 'delivery', deliveryFee: 25, freeShippingThreshold: 2000, updatedBy: admin._id } },
    { upsert: true },
  );

  await Product.deleteMany({ category: { $in: deprecatedCategories } });
  await Category.deleteMany({ $or: [{ name: { $in: deprecatedCategories }, parent: null }, { parent: { $in: deprecatedCategories } }] });
  try { await Category.collection.dropIndex('name_1'); } catch (error) { if (error.codeName !== 'IndexNotFound') throw error; }
  await Category.syncIndexes();

  for (const name of roots) {
    await Category.findOneAndUpdate({ name, parent: null }, { name, parent: null, createdBy: admin._id }, { upsert: true, returnDocument: 'after', runValidators: true });
  }
  for (const [parent, subcategories] of Object.entries(subcategoriesByRoot)) {
    for (const name of subcategories) {
      await Category.findOneAndUpdate({ name, parent }, { name, parent, createdBy: admin._id }, { upsert: true, returnDocument: 'after', runValidators: true });
    }
  }

  for (const product of products) {
    const catalogProduct = { ...product, gallery: product.gallery || [], collection: undefined, costPrice: product.costPrice ?? Number((product.price * 0.62).toFixed(2)), featured: Boolean(product.featured), isNewArrival: Boolean(product.isNewArrival), isManuallyUnavailable: false };
    await Product.findOneAndUpdate({ name: product.name }, catalogProduct, { upsert: true, returnDocument: 'after', runValidators: true });
  }

  const currentNames = products.map((product) => product.name);
  await Product.deleteMany({ name: { $in: legacySeedNames, $nin: currentNames } });
  const subcategoryCount = Object.values(subcategoriesByRoot).reduce((total, values) => total + values.length, 0);
  console.log(`Seed complete: ${products.length} catalog products, ${roots.length} main categories, and ${subcategoryCount} subcategories. Existing admin password preserved.`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
