const express = require("express");
const router = express.Router();
const { User, Store, Rating } = require("../models");
const authenticateToken = require("../middleware/authMiddleware");


router.get("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admins can view users" });
  }

  try {
    const { name, email, address, role } = req.query;
    const where = {};
    if (name) where.name = name;
    if (email) where.email = email;
    if (address) where.address = address;
    if (role) where.role = role.toUpperCase();

    const users = await User.findAll({ where, attributes: ["id", "name", "email", "address", "role"] });
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


router.get("/stats", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Unauthorized" });

  try {
    const userCount = await User.count();
    const storeCount = await Store.count();
    const ratingCount = await Rating.count();

    res.json({ userCount, storeCount, ratingCount });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
