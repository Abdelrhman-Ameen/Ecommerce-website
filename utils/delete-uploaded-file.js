const fs = require("fs");
const path = require("path");

module.exports = (folder, filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads", folder, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
