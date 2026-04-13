const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uniqueId: { type: String, unique: true, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  location: { type: String, required: true }, // Gulmi municipality/VDC
  bio: { type: String, maxlength: 150 },
  profilePicture: { type: String },
  coverPhoto: { type: String },
  skills: [{ type: String }],
  skillsToLearn: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);