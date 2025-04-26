// server/routes/notifications.js
const express      = require("express");
const router       = express.Router();
const auth         = require("../middleware/auth");
const Notification = require("../models/Notification");

// GET /api/notifications — fetch the latest 50 for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notes);
  } catch (err) {
    console.error("❌ GET /api/notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/:id/read — mark one notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const note = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json(note);
  } catch (err) {
    console.error("❌ PATCH /api/notifications/:id/read error:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

module.exports = router;
