const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) throw httpError(401, "Authentication required");
  const token = header.slice(7);
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.sub).select("-password");
  if (!user || !user.isActive) throw httpError(401, "User account is unavailable");
  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(httpError(403, "You do not have permission to perform this action"));
    next();
  };
}

module.exports = { protect, authorize };
