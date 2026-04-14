const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const { emitMessageCreated } = require('../socket');

const router = express.Router();

const populateMessage = (query) => query
  .populate('sender', 'username fullName profilePicture location')
  .populate('recipient', 'username fullName profilePicture location');

const serializeSummary = (message) => {
  if (!message) {
    return null;
  }

  return {
    _id: message._id,
    chatType: message.chatType,
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    sender: message.sender,
    recipient: message.recipient
  };
};

router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const [users, directMessages, latestGroupMessage, totalUsers] = await Promise.all([
      User.find({ _id: { $ne: currentUserId } })
        .select('username fullName profilePicture location')
        .sort({ username: 1 }),
      populateMessage(
        Message.find({
          chatType: 'direct',
          $or: [
            { sender: currentUserId },
            { recipient: currentUserId }
          ]
        }).sort({ createdAt: -1 })
      ),
      populateMessage(
        Message.findOne({ chatType: 'group' }).sort({ createdAt: -1 })
      ),
      User.countDocuments()
    ]);

    const latestByUserId = new Map();

    directMessages.forEach((message) => {
      const senderId = message.sender?._id?.toString();
      const recipientId = message.recipient?._id?.toString();
      const counterpartId = senderId === currentUserId ? recipientId : senderId;

      if (counterpartId && !latestByUserId.has(counterpartId)) {
        latestByUserId.set(counterpartId, serializeSummary(message));
      }
    });

    res.json({
      group: {
        id: 'group:all',
        name: 'GulmiGang Group',
        membersCount: totalUsers,
        lastMessage: serializeSummary(latestGroupMessage)
      },
      direct: users.map((user) => ({
        ...user.toObject(),
        lastMessage: latestByUserId.get(user._id.toString()) || null
      }))
    });
  } catch (error) {
    console.error('Fetch conversations error:', error.message);
    res.status(500).send('Server error');
  }
});

router.get('/group', auth, async (req, res) => {
  try {
    const messages = await populateMessage(
      Message.find({ chatType: 'group' })
        .sort({ createdAt: 1 })
        .limit(120)
    );

    res.json(messages);
  } catch (error) {
    console.error('Fetch group messages error:', error.message);
    res.status(500).send('Server error');
  }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = await User.findById(userId).select('username fullName profilePicture location');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const messages = await populateMessage(
      Message.find({
        chatType: 'direct',
        $or: [
          { sender: currentUserId, recipient: userId },
          { sender: userId, recipient: currentUserId }
        ]
      })
        .sort({ createdAt: 1 })
        .limit(120)
    );

    res.json({
      user,
      messages
    });
  } catch (error) {
    console.error('Fetch direct messages error:', error.message);
    res.status(500).send('Server error');
  }
});

router.post(
  '/',
  auth,
  [
    body('text', 'Message is required').trim().notEmpty().isLength({ max: 1000 }),
    body('chatType').optional().isIn(['direct', 'group']),
    body('recipientId').optional({ nullable: true }).isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const chatType = req.body.chatType === 'group' ? 'group' : 'direct';
      let recipientId = req.body.recipientId || null;

      if (chatType === 'direct') {
        if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
          return res.status(400).json({ msg: 'A valid recipient is required for direct chat' });
        }

        if (recipientId === req.user.id) {
          return res.status(400).json({ msg: 'You cannot message yourself' });
        }

        const recipientExists = await User.exists({ _id: recipientId });
        if (!recipientExists) {
          return res.status(404).json({ msg: 'Recipient not found' });
        }
      } else {
        recipientId = null;
      }

      const createdMessage = await Message.create({
        sender: req.user.id,
        recipient: recipientId,
        chatType,
        text: req.body.text.trim()
      });
      const message = await populateMessage(
        Message.findById(createdMessage._id)
      );

      emitMessageCreated(message);
      res.json(message);
    } catch (error) {
      console.error('Send message error:', error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
