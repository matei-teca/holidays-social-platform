const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

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
router.post("/", async (req, res) => {
  const { postId, author, text } = req.body;
  try {
    const newComment = new Comment({ postId, author, text });
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Failed to post comment" });
  }
});

module.exports = router;
