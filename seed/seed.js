const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const User = require("../models/user-model");
const Product = require("../models/product-model");
const Cart = require("../models/cart-model");
const Order = require("../models/order-model");

const productData = [
  {
    name: "AI Vision Lens Pro",
    description: "A professional wide-angle camera lens for sharp studio product photography.",
    category: "photography",
    collection: "studio equipment",
    price: 1299,
    oldPrice: 1449,
    stock: 8,
    imageUrl: "vision-lens.png",
    rating: 4.8,
    reviewsCount: 34,
    featured: true,
    isNewArrival: true,
  },
  {
    name: "Sculpted Ceramic Lamp",
    description: "A warm table lamp with a sculpted ceramic base and a natural linen shade.",
    category: "lighting",
    collection: "modern living",
    price: 185,
    oldPrice: 220,
    stock: 14,
    imageUrl: "ceramic-lamp.png",
    rating: 4.6,
    reviewsCount: 19,
    featured: true,
  },
  {
    name: "Walnut Serving Tray",
    description: "A handcrafted walnut tray finished with rounded edges and brass handles.",
    category: "decor",
    collection: "artisan wood",
    price: 95,
    stock: 4,
    imageUrl: "walnut-tray.png",
    rating: 4.7,
    reviewsCount: 27,
  },
  {
    name: "Olive Ceramic Planter",
    description: "A ribbed stoneware planter supplied with a small indoor olive plant.",
    category: "plants",
    collection: "natural home",
    price: 79,
    stock: 11,
    imageUrl: "olive-planter.png",
    rating: 4.5,
    reviewsCount: 16,
    isNewArrival: true,
  },
];

function copyProductImages() {
  const uploadsFolder = path.join(__dirname, "..", "uploads", "products");
  fs.mkdirSync(uploadsFolder, { recursive: true });
  for (const product of productData) {
    fs.copyFileSync(path.join(__dirname, "images", product.imageUrl), path.join(uploadsFolder, product.imageUrl));
  }
}

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from .env");
    await mongoose.connect(process.env.MONGO_URI);

    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
    ]);

    copyProductImages();

    const admin = await User.create({
      firstName: "Abdelrhman",
      lastName: "Ameen",
      email: "admin@luxestudio.com",
      password: "Admin12345",
      role: "admin",
      phone: "+201000000001",
    });

    const customer = await User.create({
      firstName: "Omar",
      lastName: "Hassan",
      email: "customer@luxestudio.com",
      password: "Customer12345",
      phone: "+201000000002",
    });

    const products = await Product.insertMany(productData);
    customer.favorites = [products[1]._id, products[3]._id];
    await customer.save();

    await Cart.create({
      user: customer._id,
      items: [
        { product: products[2]._id, quantity: 1 },
        { product: products[3]._id, quantity: 2 },
      ],
    });

    await Order.create({
      user: customer._id,
      items: [{ product: products[1]._id, name: products[1].name, price: products[1].price, quantity: 1 }],
      shippingAddress: {
        fullName: "Omar Hassan",
        email: "customer@luxestudio.com",
        phone: "+201000000002",
        street: "15 Tahrir Street",
        city: "Cairo",
      },
      paymentMethod: "cash",
      subtotal: products[1].price,
      shippingPrice: 25,
      totalPrice: products[1].price + 25,
      status: "processing",
    });

    console.log(`Database seeded: 2 users, ${products.length} products, 1 cart, 1 order`);
    console.log(`Admin account: ${admin.email}`);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
