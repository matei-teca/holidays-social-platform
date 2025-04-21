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
    const { holiday, content, image, joinable } = req.body;
    const { username } = req.user;
  
     try {
      const newPost = new Post({
        author: username,
        holiday,
        content,
        image,
        joinable: joinable === true,  // ensure boolean
      });

       const savedPost = await newPost.save();
       res.status(201).json(savedPost);

     } catch (err) {
    console.error("❌ Error saving post:", err.message);
    res.status(400).json({ error: "Invalid post data" });
  }
});

// DELETE a post (only its author can)
router.delete("/:id", auth, async (req, res) => {
  try {
    // findByIdAndDelete returns the deleted doc or null if not found
    const deleted = await Post.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Post not found" });
    }
    // enforce author check *after* fetching
    if (deleted.author !== req.user.username) {
      // you could also re-create the doc if you wanted to be fancy,
      // but simpler is to refuse outright before deletion:
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    return res.json({ message: "Post successfully deleted", id: req.params.id });
  } catch (err) {
    console.error("❌ Error in DELETE /api/posts/:id:", err);
    // send the actual error message in development:
    return res
      .status(500)
      .json({ error: "Server error while deleting post", details: err.message });
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

// PATCH /api/posts/:id/join — toggle join/unjoin
router.patch("/:id/join", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const user = req.user.username;
    const idx  = post.joiners.indexOf(user);

    if (idx === -1 && post.joinable) {
      // join
      post.joiners.push(user);
    } else {
      // unjoin
      post.joiners.splice(idx, 1);
    }

    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to toggle join" });
  }
});



module.exports = router;
