// routes/users.js
const express = require("express");
const router = express.Router();
const User   = require("../models/User");
const auth   = require("../middleware/auth");

// GET all users (for selecting a chat partner)
router.get("/", auth, async (req, res) => {
  try {
    // only send back the fields you need (e.g. _id and username)
    const users = await User.find().select("_id username");
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET public profile (including publicKey!) by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("username avatarUrl bio publicKey");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update your profile (avatar, bio) or publicKey
router.put("/", auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.avatarUrl   != null) updates.avatarUrl = req.body.avatarUrl;
    if (req.body.bio         != null) updates.bio       = req.body.bio;
    if (req.body.publicKey   != null) updates.publicKey = req.body.publicKey;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, select: "username avatarUrl bio publicKey" }
    );
    res.json(updated);
  } catch (err) {
    console.error("Failed to update user:", err);
    res.status(400).json({ error: "Update failed" });
  }
});

// PATCH /api/users/keys
router.put("/keys", auth, async (req, res) => {
  const { publicKey } = req.body;
  await User.findByIdAndUpdate(req.user.id, { publicKey });
  res.sendStatus(204);
});

module.exports = router;
