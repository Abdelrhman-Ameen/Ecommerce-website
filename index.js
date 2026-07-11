const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const dbConnect = require("./config/db-connect");
const authRouter = require("./routes/auth-routes");
const productRouter = require("./routes/product-routes");
const cartRouter = require("./routes/cart-routes");
const orderRouter = require("./routes/order-routes");
const imageRouter = require("./routes/image-routes");
const adminRouter = require("./routes/admin-routes");

dbConnect();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:4200" }));
app.use(express.json());
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "success", message: "LuxeStudio API is running" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/images", imageRouter);
app.use("/api/v1/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
