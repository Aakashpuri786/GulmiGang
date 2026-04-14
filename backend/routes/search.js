const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Reel = require('../models/Reel');

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', auth, async (req, res) => {
  try {
    const rawQuery = String(req.query.q || '').trim();
    const type = String(req.query.type || 'all').toLowerCase();

    if (!rawQuery) {
      return res.json({
        query: '',
        type,
        users: [],
        reels: [],
        posts: []
      });
    }

    const normalizedQuery = rawQuery.startsWith('#') ? rawQuery.slice(1) : rawQuery;
    const safeQuery = escapeRegex(normalizedQuery);
    const textRegex = new RegExp(safeQuery, 'i');
    const hashtagRegex = new RegExp(`#?${safeQuery}`, 'i');

    const shouldFetchUsers = type === 'all' || type === 'users';
    const shouldFetchReels = type === 'all' || type === 'reels';
    const shouldFetchPosts = type === 'all' || type === 'posts';

    const matchedUsers = await User.find({
      $or: [
        { username: textRegex },
        { uniqueId: textRegex },
        { fullName: textRegex },
        { location: textRegex }
      ]
    })
      .select('username uniqueId fullName profilePicture location bio')
      .sort({ username: 1 })
      .limit(18);

    const users = shouldFetchUsers ? matchedUsers.slice(0, 12) : [];
    const matchedUserIds = matchedUsers.map((user) => user._id);
    const authorCondition = matchedUserIds.length ? { author: { $in: matchedUserIds } } : null;

    const reels = shouldFetchReels
      ? await Reel.find({
          $or: [
            { caption: textRegex },
            { caption: hashtagRegex },
            ...(authorCondition ? [authorCondition] : [])
          ]
        })
          .populate('author', 'username fullName profilePicture location')
          .sort({ createdAt: -1 })
          .limit(18)
      : [];

    const posts = shouldFetchPosts
      ? await Post.find({
          $or: [
            { content: textRegex },
            { location: textRegex },
            { hashtags: hashtagRegex },
            ...(authorCondition ? [authorCondition] : [])
          ]
        })
          .populate('author', 'username fullName profilePicture location')
          .sort({ createdAt: -1 })
          .limit(18)
      : [];

    res.json({
      query: rawQuery,
      type,
      users,
      reels,
      posts
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
