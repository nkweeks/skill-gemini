const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const User = require('../models/user');
const jwtConfig = require('../config/jwt.config'); // Import JWT config
const router = express.Router();

const BCRYPT_SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({ message: `${field} already in use.` });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
    });

    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Error during registration:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input: must have password and either email or username
    if (!password || (!email && !username)) {
      return res.status(400).json({ message: 'Email (or username) and password are required.' });
    }

    // Find user by email or username
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else {
      user = await User.findOne({ where: { username } });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password doesn't match
    }

    // Generate JWT
    const payload = {
      user_id: user.user_id,
      username: user.username,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // Return token
    res.status(200).json({ token });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
