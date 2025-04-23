// server/routes/conversations.js
const express      = require("express");
const router       = express.Router();
const mongoose     = require("mongoose");
const Conversation = require("../models/Conversation");
const auth         = require("../middleware/auth");

// GET all conversations for current user
router.get("/", auth, async (req, res) => {
  try {
    const convos = await Conversation
      .find({ participants: req.user.id })
      .populate("participants", "username avatarUrl")
      .sort({ updatedAt: -1 });
    res.json(convos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET a single conversation by ID (messages)
router.get("/:id", auth, async (req, res) => {
  try {
    const convo = await Conversation
      .findById(req.params.id)
      .populate("participants", "username avatarUrl")
      .populate("messages.sender", "username avatarUrl");
    if (!convo) return res.status(404).json({ error: "Not found" });
    res.json(convo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * POST create a new conversation (1:1 or group)
 * Enforces uniqueness for 1:1 chats.
 */
router.post("/", auth, async (req, res) => {
  console.log("💬 POST /api/conversations body:", req.body);
  const { participantIds = [], initialMessage } = req.body;
  const me = req.user.id;

  // properly instantiate ObjectId
  const all = [me, ...participantIds].map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  try {
    let convo;

    // enforce single 1:1 conversation
    if (all.length === 2) {
      convo = await Conversation.findOne()
        .where("participants").all(all)
        .where("participants").size(2)
        .exec();
    }

    if (convo) {
      // populate participants for the existing convo
      await convo.populate("participants", "username avatarUrl");
      return res.status(200).json(convo);
    }

    // else create new convo
    const messages = initialMessage
      ? [{ sender: me, content: initialMessage }]
      : [];

    const newConvo = new Conversation({ participants: all, messages });
    await newConvo.save();

    // === Approach A: populate one at a time ===
    let full = await newConvo.populate("participants", "username avatarUrl");
    full = await full.populate("messages.sender", "username avatarUrl");

    res.status(201).json(full);

  } catch (err) {
    console.error("❌ Failed to create conversation:", err);
    res
      .status(500)
      .json({
        error:   "Server failed to create conversation",
        details: err.message
      });
  }
});

module.exports = router;
