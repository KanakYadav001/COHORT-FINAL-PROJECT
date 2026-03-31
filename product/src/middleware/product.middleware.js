const jwt = require("jsonwebtoken");

function checkRole(role = ["user"]) {
  return function verifyToken(req, res, next) {
    const token =
      req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!role.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports = {
  checkRole,
};
