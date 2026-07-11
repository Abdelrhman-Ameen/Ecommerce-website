const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let folder = "products";
    if (req.baseUrl.includes("auth")) folder = "users";
    const destination = path.join("uploads", folder);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const accepted = ["image/jpeg", "image/png", "image/webp"];
  accepted.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPG, PNG and WebP images are allowed"));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
