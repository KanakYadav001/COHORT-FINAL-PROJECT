const UserModel = require("../model/auth.model");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  let token = null;

  // Check Authorization header first
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");

    // Validate format: should be "Bearer TOKEN"
    if (parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization header format. Use: Bearer TOKEN",
      });
    }

    token = parts[1];
  }

  // If no header token, check cookies
  if (!token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access ! Please Login First",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "Unouthorized Access ! User Not Found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;
