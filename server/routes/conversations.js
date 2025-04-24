// server/routes/conversations.js

const express      = require("express");
const router       = express.Router();
const mongoose     = require("mongoose");
const Conversation = require("../models/Conversation");
const auth         = require("../middleware/auth");

// GET all conversations for current user
router.get("/", auth, async (req, res) => {
  try {
    const convos = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "username avatarUrl")
      .sort({ updatedAt: -1 });

    res.json(convos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET a single conversation by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id)
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
 * - For 1:1 chats (no `name`), enforces uniqueness.
 * - For group chats, you may supply a `name`.
 */
router.post("/", auth, async (req, res) => {
  const { participantIds = [], initialMessage, name } = req.body;
  const me = req.user.id;

  // ⚠️ Must call 'new' on Types.ObjectId
  const all = [me, ...participantIds].map((id) =>
    new mongoose.Types.ObjectId(id)
  );

  try {
    let convo;

    // If it's a 1:1 chat (2 participants, no group name), check for existing
    if (all.length === 2 && !name) {
      convo = await Conversation.findOne({
        participants: { $all: all, $size: 2 },
        name: { $exists: false },
      });
    }

    if (convo) {
      // Found existing → return it
      const populated = await Conversation.populate(convo, [
        { path: "participants", select: "username avatarUrl" },
        { path: "messages.sender", select: "username avatarUrl" },
      ]);
      return res.status(200).json(populated);
    }

    // Otherwise, create a fresh conversation
    const messages = initialMessage
      ? [{ sender: me, content: initialMessage }]
      : [];

    const newConvo = new Conversation({
      name:         name || undefined,
      participants: all,
      messages,
    });

    await newConvo.save();

    // Populate before sending back
    const full = await Conversation.findById(newConvo._id)
      .populate("participants", "username avatarUrl")
      .populate("messages.sender", "username avatarUrl");

    res.status(201).json(full);
  } catch (err) {
    console.error("❌ Failed to create conversation:", err);
    res.status(500).json({ error: "Server failed to create conversation" });
  }
});

module.exports = router;
