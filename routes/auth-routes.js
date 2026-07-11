const express = require("express");
const controller = require("../controllers/auth-controllers");
const upload = require("../middleware/multer-middleware");
const authenticate = require("../middleware/authenticate-middleware");

const router = express.Router();
router.post("/signup", upload.single("image"), controller.signup);
router.post("/signin", controller.signin);
router.get("/me", authenticate, controller.getProfile);
router.patch("/favorites/:productId", authenticate, controller.toggleFavorite);
module.exports = router;
