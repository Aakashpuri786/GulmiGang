const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Reel = require('../models/Reel');
const { reelUpload, buildUploadedFileUrl } = require('../middleware/uploads');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('author', 'username fullName profilePicture')
      .populate('comments.author', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(40);

    res.json(reels);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/user/:userId', auth, async (req, res) => {
  try {
    const reels = await Reel.find({ author: req.params.userId })
      .populate('author', 'username fullName profilePicture')
      .populate('comments.author', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reels);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post(
  '/',
  auth,
  reelUpload.single('video'),
  [body('caption', 'Caption is required').trim().notEmpty().isLength({ max: 2200 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'A video file is required' });
    }

    try {
      const reel = new Reel({
        author: req.user.id,
        caption: req.body.caption.trim(),
        videoUrl: buildUploadedFileUrl(req, req.file)
      });

      await reel.save();
      await reel.populate('author', 'username fullName profilePicture');

      res.json(reel);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.post('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    const alreadyLiked = reel.likes.some((id) => id.toString() === req.user.id);

    if (alreadyLiked) {
      reel.likes = reel.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      reel.likes.unshift(req.user.id);
    }

    await reel.save();
    res.json({ likes: reel.likes });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reel not found' });
    }
    res.status(500).send('Server error');
  }
});

router.post(
  '/:id/comment',
  auth,
  [body('content', 'Comment is required').trim().notEmpty().isLength({ max: 300 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const reel = await Reel.findById(req.params.id);

      if (!reel) {
        return res.status(404).json({ msg: 'Reel not found' });
      }

      reel.comments.unshift({
        author: req.user.id,
        content: req.body.content.trim()
      });

      await reel.save();
      await reel.populate('comments.author', 'username fullName profilePicture');

      res.json({ comments: reel.comments });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Reel not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
