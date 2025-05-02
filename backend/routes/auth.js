const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Register error", error: err });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Username doesn't exist" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Password didn't match" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    // ✅ Local dev-friendly cookie setup
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // only true in production with HTTPS
      sameSite: "Lax", // Use "Strict" or "None" with secure: true in production
      maxAge: 4 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err });
  }
});

module.exports = router;
