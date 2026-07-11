module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ status: "fail", message: "Forbidden" });
  }
  next();
};
