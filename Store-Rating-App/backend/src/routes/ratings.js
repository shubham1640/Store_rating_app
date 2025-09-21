const express = require("express");
const router = express.Router();
const { Rating } = require("../models");
const authenticateToken = require("../middleware/authMiddleware");


router.post("/", authenticateToken, async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    if (!storeId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "StoreId and rating (1-5) are required" });
    }

    
    let existing = await Rating.findOne({ where: { storeId, userId: req.user.id } });

    if (existing) {
     
      await existing.update({ rating });
      return res.json(existing);
    } else {
      
      const newRating = await Rating.create({ storeId, userId: req.user.id, rating });
      return res.status(201).json(newRating);
    }
  } catch (err) {
    console.error("Submit/update rating error:", err);
    res.status(500).json({ error: "Failed to submit/update rating" });
  }
});


router.delete("/:storeId", authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;

    const existing = await Rating.findOne({
      where: { storeId, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ error: "Rating not found" });

    await existing.destroy();
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("Delete rating error:", err);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});
module.exports = router;
