const express = require("express");
const controller = require("../controllers/cart-controllers");
const authenticate = require("../middleware/authenticate-middleware");

const router = express.Router();
router.use(authenticate);
router.route("/").get(controller.getCart).post(controller.addToCart);
router.route("/:productId").patch(controller.updateCartItem).delete(controller.removeCartItem);
module.exports = router;
