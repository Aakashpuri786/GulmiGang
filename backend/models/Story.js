const mongoose = require('mongoose');

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 180 },
  background: {
    type: String,
    default: 'linear-gradient(135deg, #667eea, #764ba2)'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + STORY_LIFETIME_MS),
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Story', storySchema);
