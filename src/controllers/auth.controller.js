const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw httpError(400, "Name, email, and password are required");
  if (String(password).length < 8) throw httpError(400, "Password must be at least 8 characters");
  const normalizedEmail = String(email).trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw httpError(409, "Email is already registered");
  const user = await User.create({ name, email: normalizedEmail, password });
  res.status(201).json({ success: true, token: createToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, "Email and password are required");
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password");
  if (!user || !user.isActive || !(await user.comparePassword(password))) throw httpError(401, "Invalid email or password");
  res.json({ success: true, token: createToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
