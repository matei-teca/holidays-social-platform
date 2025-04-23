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

// GET a public profile by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User
      .findOne({ username: req.params.username })
      .select("username avatarUrl bio");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT to update your own profile (requires auth)
router.put("/", auth, async (req, res) => {
  const { avatarUrl, bio } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl, bio },
      { new: true, select: "username avatarUrl bio" }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
