// server/routes/events.js
const express = require("express");
const router  = express.Router();
const Post    = require("../models/Post");
const auth    = require("../middleware/auth");

// GET /api/events/joinable
// Joinable events that the current user has NOT yet joined
router.get("/joinable", auth, async (req, res) => {
  try {
    const events = await Post.find({
      joinable: true,
      joiners:  { $ne: req.user.username }
    }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch joinable events" });
  }
});

// GET /api/events/joined
// Events that the current user has already joined
router.get("/joined", auth, async (req, res) => {
  try {
    const events = await Post.find({
      joinable: true,
      joiners:  req.user.username
    }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch joined events" });
  }
});

module.exports = router;
