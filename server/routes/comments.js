// server/routes/comments.js
const express      = require("express");
const router       = express.Router();
const Comment      = require("../models/Comment");
const Post         = require("../models/Post");
const User         = require("../models/User");
const Notification = require("../models/Notification");
const auth         = require("../middleware/auth");

// GET comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("❌ GET /api/comments/:postId error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST a new comment
router.post("/", auth, async (req, res) => {
  const { postId, text } = req.body;
  try {
    // 1) save the comment
    const comment = new Comment({
      postId,
      text,
      author: req.user.username,
    });
    const saved = await comment.save();

    console.log(`📣 [comments] ${req.user.username} commented on post ${postId}`);

    // 2) persist + emit notification to the post's author
    const io = req.app.get("io");
    const post = await Post.findById(postId);
    if (post && post.author !== req.user.username) {
      const authorUser = await User.findOne({ username: post.author });
      const note = await Notification.create({
        user: authorUser._id,
        type: "new_comment",
        text: `${req.user.username} commented on your post`,
        data: { postId, commentId: saved._id },
      });
      console.log(`📡 Emitting new_comment to user:${post.author}`);
      io?.to(`user:${post.author}`).emit("notification", note);
    }

    // 3) return the saved comment
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ POST /api/comments error:", err);
    res.status(400).json({ error: "Failed to comment" });
  }
});

module.exports = router;
