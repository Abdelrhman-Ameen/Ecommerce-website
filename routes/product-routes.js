const express = require("express");
const controller = require("../controllers/product-controllers");
const upload = require("../middleware/multer-middleware");
const authenticate = require("../middleware/authenticate-middleware");
const authorize = require("../middleware/authorize-middleware");

const router = express.Router();
router.route("/").get(controller.getAllProducts).post(authenticate, authorize("admin"), upload.single("image"), controller.createProduct);
router.route("/:id").get(controller.getProductById).patch(authenticate, authorize("admin"), upload.single("image"), controller.updateProduct).delete(authenticate, authorize("admin"), controller.deleteProduct);
module.exports = router;
