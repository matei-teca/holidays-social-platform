// server/models/Notification.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  type:      {
    type: String,
    enum: ["new_comment", "chat_message", "event_join", "event_leave", "like"],
    required: true,
  },
  text:      { type: String, required: true },
  data:      { type: Schema.Types.Mixed },   // e.g. { postId, commentId } or { convoId, messageId }
  read:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
