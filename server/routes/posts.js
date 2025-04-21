const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET a single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new post
router.post("/", auth, async (req, res) => {
  const { holiday, content, image } = req.body;

  // Get the username from the authenticated user
  const { username } = req.user;

  try {
    const newPost = new Post({ author: username, holiday, content, image });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("❌ Error saving post:", err.message);
    res.status(400).json({ error: "Invalid post data" });
  }
});

// Like a post
router.patch("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Optional: prevent multiple likes from same user using post.likes array
    post.likes += 1;
    const updated = await post.save();
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Failed to like post" });
  }
});


module.exports = router;
