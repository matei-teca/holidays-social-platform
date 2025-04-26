// server/routes/posts.js
const express      = require("express");
const router       = express.Router();
const Post         = require("../models/Post");
const User         = require("../models/User");
const Notification = require("../models/Notification");
const auth         = require("../middleware/auth");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ GET /api/posts error:", err);
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
    console.error("❌ GET /api/posts/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new post
router.post("/", auth, async (req, res) => {
  const { holiday, content, image, joinable } = req.body;
  const { username } = req.user;
  try {
    const newPost = new Post({
      author:   username,
      holiday,
      content,
      image,
      joinable: joinable === true,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("❌ POST /api/posts error:", err);
    res.status(400).json({ error: "Invalid post data" });
  }
});

// DELETE a post (author only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Post not found" });
    if (deleted.author !== req.user.username) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }
    res.json({ message: "Post successfully deleted", id: req.params.id });
  } catch (err) {
    console.error("❌ DELETE /api/posts/:id error:", err);
    res.status(500).json({ error: "Server error while deleting post" });
  }
});

// PATCH /api/posts/:id/like — like a post + notify author
router.patch("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // increment
    post.likes += 1;
    const updated = await post.save();

    // send back updated post
    res.json(updated);

    // if liker isn't the author, persist + emit notification
    if (post.author !== req.user.username) {
      const io = req.app.get("io");
      const authorUser = await User.findOne({ username: post.author });
      const note = await Notification.create({
        user: authorUser._id,
        type: "like",
        text: `${req.user.username} liked your post`,
        data: { postId: updated._id },
      });
      console.log(`📡 Emitting like to user:${post.author}`);
      io?.to(`user:${post.author}`).emit("notification", note);
    }
  } catch (err) {
    console.error("❌ PATCH /api/posts/:id/like error:", err);
    res.status(400).json({ error: "Failed to like post" });
  }
});

// PATCH join/unjoin an event
router.patch("/:id/join", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const user      = req.user.username;
    const idx       = post.joiners.indexOf(user);
    const isJoining = idx === -1 && post.joinable;

    if (isJoining) {
      post.joiners.push(user);
    } else {
      post.joiners.splice(idx, 1);
    }

    const updated = await post.save();

    console.log(
      `📣 [posts] ${req.user.username} ${
        isJoining ? "joined" : "left"
      } event ${post._id}`
    );

    // persist + emit notification
    if (post.author !== user) {
      const io = req.app.get("io");
      const authorUser = await User.findOne({ username: post.author });
      const note = await Notification.create({
        user: authorUser._id,
        type:    isJoining ? "event_join" : "event_leave",
        text:    `${user} ${isJoining ? "joined" : "left"} your event`,
        data:    { postId: post._id },
      });
      console.log(
        `📡 Emitting ${isJoining ? "event_join" : "event_leave"} to user:${post.author}`
      );
      io?.to(`user:${post.author}`).emit("notification", note);
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ PATCH /api/posts/:id/join error:", err);
    res.status(400).json({ error: "Failed to toggle join" });
  }
});

module.exports = router;
