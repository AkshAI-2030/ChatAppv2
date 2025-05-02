const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer token"
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // Check if decoded object contains the 'username' field
    if (!decoded.username) {
      return res.status(400).json({ message: "Invalid token data" });
    }

    // Find the user associated with the decoded token
    const user = await User.findOne({ username: decoded.username });

    // Handle case where user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    // Enhanced error handling
    console.error("Token verification or database query error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

module.exports = authenticateToken;
