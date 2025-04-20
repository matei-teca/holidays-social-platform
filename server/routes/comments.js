const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

// Get comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Create comment
router.post("/", auth, async (req, res) => {
  const { postId, text } = req.body;
  try {
    const comment = new Comment({
      postId,
      text,
      author: req.user.username,
    });
    const saved = await comment.save();
    res.status(201).json(saved);
  } catch {
    res.status(400).json({ error: "Failed to comment" });
  }
});


module.exports = router;
