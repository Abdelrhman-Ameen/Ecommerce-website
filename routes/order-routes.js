const express = require("express");
const controller = require("../controllers/order-controllers");
const authenticate = require("../middleware/authenticate-middleware");
const authorize = require("../middleware/authorize-middleware");

const router = express.Router();
router.use(authenticate);
router.post("/", controller.createOrder);
router.get("/my-orders", controller.getMyOrders);
router.get("/", authorize("admin"), controller.getAllOrders);
router.patch("/:id/status", authorize("admin"), controller.updateOrderStatus);
router.get("/:id", controller.getOrderById);
module.exports = router;
