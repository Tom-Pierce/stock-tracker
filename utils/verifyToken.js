const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify token as middleware
const verifyToken = (req, res, next) => {
  if (!req.cookies.jwt) {
    return res
      .status(401)
      .json({ message: "Authentication failed: Missing token" });
  }
  const token = req.cookies.jwt;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Authentication failed: Invalid token" });
    }
    req.user = { id: decoded._id };
    next();
  });
};

module.exports = verifyToken;
