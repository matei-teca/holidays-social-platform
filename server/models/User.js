const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  publicKey:   { type: String },
  avatarUrl:  { type: String, default: "" },
  bio:        { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);
