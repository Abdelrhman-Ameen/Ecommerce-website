const express = require("express");
const controller = require("../controllers/image-controllers");
const upload = require("../middleware/multer-middleware");
const authenticate = require("../middleware/authenticate-middleware");

const router = express.Router();
router.use(authenticate);
router.post("/analyze", upload.single("image"), controller.analyzeImage);
router.post("/remove-background", upload.single("image"), controller.removeBackground);
module.exports = router;
