const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Story = require('../models/Story');
const { emitStoryCreated, getOnlineUsers } = require('../socket');

const router = express.Router();

const buildStoryGroups = (stories) => {
  const grouped = new Map();

  stories.forEach((story) => {
    const authorId = story.author._id.toString();

    if (!grouped.has(authorId)) {
      grouped.set(authorId, {
        author: story.author,
        items: []
      });
    }

    grouped.get(authorId).items.push(story);
  });

  return Array.from(grouped.values());
};

router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('author', 'username fullName profilePicture location')
      .sort({ createdAt: -1 });

    res.json({
      stories: buildStoryGroups(stories),
      onlineUsers: getOnlineUsers()
    });
  } catch (error) {
    console.error('Fetch stories error:', error.message);
    res.status(500).json({ msg: 'Failed to load stories' });
  }
});

router.post('/', auth, [
  body('content', 'Story text is required').trim().notEmpty().isLength({ max: 180 }),
  body('background').optional().isString().isLength({ max: 200 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const story = await Story.create({
      author: req.user.id,
      content: req.body.content,
      background: req.body.background
    });

    const populatedStory = await Story.findById(story._id)
      .populate('author', 'username fullName profilePicture location');

    emitStoryCreated(populatedStory);
    res.status(201).json(populatedStory);
  } catch (error) {
    console.error('Create story error:', error.message);
    res.status(500).json({ msg: 'Failed to create story' });
  }
});

module.exports = router;
