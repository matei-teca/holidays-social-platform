const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  holiday: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  likes: { type: Number, default: 0 },
  joinable: { type: Boolean, default: false },
  joiners:  { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Post", postSchema);
