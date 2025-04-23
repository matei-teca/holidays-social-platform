const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  // for 1:1 chat, participants.length === 2; for group chat, >2
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages:     [messageSchema],
  updatedAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model("Conversation", conversationSchema);