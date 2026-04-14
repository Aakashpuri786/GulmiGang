const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { imageUpload, buildUploadedFileUrl } = require('../middleware/uploads');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('fullName', 'Full name is required').not().isEmpty(),
  body('username', 'Username must be 4-20 alphanumeric characters').isLength({ min: 4, max: 20 }).isAlphanumeric(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
  body('location', 'Location is required').not().isEmpty()
], async (req, res) => {
  console.log('Registration attempt:', req.body); // Debug log

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Debug log
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, username, email, password, location, phone, dateOfBirth, gender, bio } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('User already exists:', user.username); // Debug log
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique ID
    const uniqueId = 'GLM-USER-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create user
    user = new User({
      uniqueId,
      username,
      email,
      password: hashedPassword,
      fullName,
      location,
      phone,
      dateOfBirth,
      gender,
      bio
    });

    await user.save();
    console.log('User created successfully:', user.username); // Debug log

    // Return JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName } });
  } catch (err) {
    console.error('Registration error:', err.message); // Debug log
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('identifier', 'Identifier is required').not().isEmpty(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  console.log('Login attempt:', req.body); // Debug log

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array()); // Debug log
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    console.log('User found:', user ? user.username : 'No user found'); // Debug log

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // Debug log

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Return JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @// Temporary: Return mock user data
    // In production, uncomment the database code below

    // const user = await User.findById(req.user.id).select('-password');
    // res.json(user);

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/auth/user
// @desc    Update current user profile
// @access  Private
router.put('/user', auth, imageUpload.single('profilePicture'), [
  body('fullName').optional().notEmpty(),
  body('username').optional().isLength({ min: 4, max: 20 }).isAlphanumeric(),
  body('email').optional().isEmail(),
  body('bio').optional().isLength({ max: 150 }),
  body('location').optional().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const nextUsername = Object.prototype.hasOwnProperty.call(req.body, 'username')
      ? req.body.username
      : user.username;
    const nextEmail = Object.prototype.hasOwnProperty.call(req.body, 'email')
      ? req.body.email
      : user.email;

    if (nextUsername && nextUsername !== user.username) {
      const existingUsername = await User.findOne({
        username: nextUsername,
        _id: { $ne: req.user.id }
      });

      if (existingUsername) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
    }

    if (nextEmail && nextEmail !== user.email) {
      const existingEmail = await User.findOne({
        email: nextEmail,
        _id: { $ne: req.user.id }
      });

      if (existingEmail) {
        return res.status(400).json({ msg: 'Email already exists' });
      }
    }

    const fieldsToUpdate = [
      'fullName',
      'username',
      'email',
      'phone',
      'location',
      'bio',
      'gender',
      'profilePicture',
      'coverPhoto'
    ];

    for (const field of fieldsToUpdate) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = req.body[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'dateOfBirth')) {
      user.dateOfBirth = req.body.dateOfBirth || null;
    }

    if (req.file) {
      user.profilePicture = buildUploadedFileUrl(req, req.file);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'skills')) {
      user.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : String(req.body.skills || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'skillsToLearn')) {
      user.skillsToLearn = Array.isArray(req.body.skillsToLearn)
        ? req.body.skillsToLearn
        : String(req.body.skillsToLearn || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    user.updatedAt = new Date();
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
