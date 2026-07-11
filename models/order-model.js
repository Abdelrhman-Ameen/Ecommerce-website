const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    quantity: Number,
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ["card", "cash"], default: "card" },
  subtotal: { type: Number, required: true },
  shippingPrice: { type: Number, default: 25 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["ordered", "processing", "shipped", "delivered", "cancelled"], default: "ordered" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
