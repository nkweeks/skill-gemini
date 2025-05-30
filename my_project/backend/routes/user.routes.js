const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const User = require('../models/user');
const Badge = require('../models/badge'); // Import Badge model
const UserBadge = require('../models/user_badge'); // Import UserBadge for through attributes if needed explicitly

// GET /api/users/me - Protected route
router.get('/me', verifyToken, async (req, res) => {
  try {
    // The user information is attached to req.user by the verifyToken middleware
    if (!req.user || !req.user.user_id) {
      return res.status(404).json({ message: 'User not found in token payload.' });
    }

    // Optionally, fetch fresh user data from DB if needed
    // This ensures the data is up-to-date and not just from the token
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password_hash'] } // Exclude sensitive info
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching user profile.' });
  }
});

// GET /api/users/leaderboard - Get top users by points
router.get('/leaderboard', async (req, res) => { // No verifyToken for public leaderboard
  try {
    const topUsers = await User.findAll({
      attributes: ['user_id', 'username', 'total_points'],
      order: [['total_points', 'DESC']],
      limit: 10, // Get top 10 users
    });
    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard.' });
  }
});

// GET /api/users/me/badges - Get logged-in user's badges (Protected)
router.get('/me/badges', verifyToken, async (req, res) => {
  try {
    const userWithBadges = await User.findByPk(req.user.user_id, {
      // Include the Badge model through the UserBadge join table
      // Sequelize automatically handles the many-to-many association
      include: [{
        model: Badge,
        attributes: ['badge_id', 'name', 'description', 'icon_url', 'criteria_type'], // Specify attributes to return
        through: {
          attributes: ['earned_at'], // Include attributes from the join table (UserBadge)
        }
      }],
      attributes: ['user_id', 'username'] // Specify attributes from User model
    });

    if (!userWithBadges) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // The 'Badges' property will be an array of Badge objects, each with UserBadge info nested if specified.
    res.json(userWithBadges.Badges || []);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ message: 'Server error while fetching user badges.' });
  }
});


module.exports = router;
