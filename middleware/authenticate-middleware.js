const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }
    const decoded = jwt.verify(authorization.split(" ")[1], process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ status: "fail", message: "Invalid or expired token" });
  }
};
