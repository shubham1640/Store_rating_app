const express = require("express");
const router = express.Router();
const { Store, Rating, User } = require("../models");
const { Op } = require("sequelize");
const authenticateToken = require("../middleware/authMiddleware");


router.get("/", authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.query; 
    const whereClause = {};
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
    if (address) whereClause.address = { [Op.iLike]: `%${address}%` };

    const stores = await Store.findAll({
      where: whereClause,
      include: [
        { model: Rating, include: [{ model: User, attributes: ["id", "name", "email"] }] },
        { model: User, as: "Owner", attributes: ["id", "name", "email"] },
      ],
    });

    const formatted = stores.map((store) => {
      const ratings = store.Ratings || [];
      const overallRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.Owner?.id,
        ownerName: store.Owner?.name,
        overallRating,
        ratings: ratings.map((r) => ({
          userId: r.User.id,
          userName: r.User.name,
          userEmail: r.User.email,
          rating: r.rating,
        })),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Fetch stores error:", err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});


router.post("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admins can add stores" });
  }

  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({ error: "Name, email, address, and ownerId are required" });
    }

    const existing = await Store.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Store with this email already exists" });

    const store = await Store.create({ name, email, address, ownerId });
    res.status(201).json({ message: "Store created successfully", store });
  } catch (err) {
    console.error("Create store error:", err);
    res.status(500).json({ error: "Failed to create store" });
  }
});

router.get("/:id/ratings", authenticateToken, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      include: [{ model: Rating, include: [{ model: User, attributes: ["id", "name", "email"] }] }],
    });

    if (!store) return res.status(404).json({ error: "Store not found" });
    if (store.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const ratings = store.Ratings.map((r) => ({
      userId: r.User.id,
      userName: r.User.name,
      userEmail: r.User.email,
      rating: r.rating,
    }));

    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;

    res.json({ store: store.name, ratings, avgRating });
  } catch (err) {
    console.error("Owner dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch store ratings" });
  }
});

module.exports = router;
