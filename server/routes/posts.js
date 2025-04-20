const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new post
router.post("/", async (req, res) => {

console.log("📥 Incoming POST request with body:", req.body); // Add this line

  const { author, holiday, content, image } = req.body;

  try {
    const newPost = new Post({ author, holiday, content, image });
    const savedPost = await newPost.save();
    console.log("✅ New post saved:", savedPost); // helpful log
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("❌ Error saving post:", err.message);
    res.status(400).json({ error: "Invalid post data" });
  }
});

module.exports = router;
