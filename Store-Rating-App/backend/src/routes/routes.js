const express = require("express");
const router = express.Router();
const { Store, Rating } = require("../models");
const authenticateToken = require("../middleware/authMiddleware");


router.get("/", authenticateToken, async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [
        {
          model: Rating,
          where: { userId: req.user.id },
          required: false, 
        },
      ],
    });

    
    const formatted = stores.map((store) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      overallRating: store.average_rating,
      userRating: store.Ratings[0] ? { id: store.Ratings[0].id, rating: store.Ratings[0].rating } : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

module.exports = router;
