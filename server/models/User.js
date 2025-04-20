const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  
  // New profile fields
  avatarUrl:  { type: String, default: "" }, // URL to avatar image
  bio:        { type: String, default: "" }, // Short “about me”
});

module.exports = mongoose.model("User", userSchema);
