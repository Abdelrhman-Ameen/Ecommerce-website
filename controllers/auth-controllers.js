const bcrypt = require("bcryptjs");
const User = require("../models/user-model");
const generateToken = require("../utils/get-jwt");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

const signup = async (req, res) => {
  try {
    const user = await User.create({ ...req.body, role: "customer", imageUrl: req.file?.filename });
    const token = generateToken(user);
    res.status(201).json({ status: "success", message: "Account created successfully", token, data: { user } });
  } catch (error) {
    if (req.file) deleteUploadedFile("users", req.file.filename);
    res.status(400).json({ status: "error", message: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: "fail", message: "Email and password are required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: "fail", message: "Invalid email or password" });
    }
    user.password = undefined;
    res.status(200).json({ status: "success", token: generateToken(user), data: { user } });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.userId).populate("favorites");
  res.status(200).json({ status: "success", data: { user } });
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const index = user.favorites.findIndex((id) => id.toString() === req.params.productId);
    if (index === -1) user.favorites.push(req.params.productId);
    else user.favorites.splice(index, 1);
    await user.save();
    res.status(200).json({ status: "success", data: { favorites: user.favorites } });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

module.exports = { signup, signin, getProfile, toggleFavorite };
