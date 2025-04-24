// server/models/Conversation.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender:    { type: Schema.Types.ObjectId, ref: "User", required: true },
  // encrypted payload:
  cipher:    { type: String },
  nonce:     { type: String },
  // fallback if not encrypted:
  content:   { type: String },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  messages:     [messageSchema],
  updatedAt:    { type: Date, default: Date.now },
});

// ensure `updatedAt` bumps automatically
conversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);
