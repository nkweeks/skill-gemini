const express = require('express');
const router = express.Router();
const Badge = require('../models/badge');
// UserBadge and User might be needed for more complex scenarios later, but not for basic CRUD of Badge model itself.
const { verifyToken } = require('../middleware/auth.middleware');
// For admin checks, you'd typically have another middleware or check req.user.role
// const { isAdmin } = require('../middleware/auth.middleware'); // Assuming you have an isAdmin middleware

// For now, all protected badge routes will just use verifyToken.
// In a real app, POST, PUT, DELETE for badges should be admin-only.

// POST /api/badges/ - Create a badge (Protected, ideally Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, icon_url, criteria_type, criteria_value_points, criteria_value_ids } = req.body;

    if (!name || !criteria_type) {
      return res.status(400).json({ message: 'Badge name and criteria_type are required.' });
    }
    // Basic validation for criteria_type
    const validCriteriaTypes = ['points', 'specific_tasks', 'specific_quizzes', 'skill_completion'];
    if (!validCriteriaTypes.includes(criteria_type)) {
        return res.status(400).json({ message: `Invalid criteria_type. Must be one of: ${validCriteriaTypes.join(', ')}` });
    }
    if (criteria_type === 'points' && (criteria_value_points === null || typeof criteria_value_points === 'undefined')) {
        return res.status(400).json({ message: 'criteria_value_points is required for points-based badges.' });
    }
    // Add more validation for criteria_value_ids if needed based on type

    const newBadge = await Badge.create({
      name,
      description,
      icon_url,
      criteria_type,
      criteria_value_points,
      criteria_value_ids,
    });
    res.status(201).json(newBadge);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Badge name already exists.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    console.error('Error creating badge:', error);
    res.status(500).json({ message: 'Server error while creating badge.' });
  }
});

// GET /api/badges/ - Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.findAll();
    res.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Server error while fetching badges.' });
  }
});

// GET /api/badges/:badge_id - Get a badge by ID
router.get('/:badge_id', async (req, res) => {
  try {
    const { badge_id } = req.params;
    const badge = await Badge.findByPk(badge_id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }
    res.json(badge);
  } catch (error) {
    console.error('Error fetching badge:', error);
    res.status(500).json({ message: 'Server error while fetching badge.' });
  }
});

// PUT /api/badges/:badge_id - Update a badge (Protected, ideally Admin only)
router.put('/:badge_id', verifyToken, async (req, res) => {
  try {
    const { badge_id } = req.params;
    const { name, description, icon_url, criteria_type, criteria_value_points, criteria_value_ids } = req.body;

    const badge = await Badge.findByPk(badge_id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }

    // Simple authorization: any authenticated user can update for now
    // if (!req.user.isAdmin) { return res.status(403).send({ message: 'Forbidden. Admin access required.'}); }


    if (name === '') return res.status(400).json({message: "Name cannot be empty."});
    if (criteria_type === '') return res.status(400).json({message: "Criteria type cannot be empty."});


    badge.name = name !== undefined ? name : badge.name;
    badge.description = description !== undefined ? description : badge.description;
    badge.icon_url = icon_url !== undefined ? icon_url : badge.icon_url;
    badge.criteria_type = criteria_type !== undefined ? criteria_type : badge.criteria_type;
    badge.criteria_value_points = criteria_value_points !== undefined ? criteria_value_points : badge.criteria_value_points;
    badge.criteria_value_ids = criteria_value_ids !== undefined ? criteria_value_ids : badge.criteria_value_ids;

    await badge.save();
    res.json(badge);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Badge name already exists.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    console.error('Error updating badge:', error);
    res.status(500).json({ message: 'Server error while updating badge.' });
  }
});

// DELETE /api/badges/:badge_id - Delete a badge (Protected, ideally Admin only)
router.delete('/:badge_id', verifyToken, async (req, res) => {
  try {
    const { badge_id } = req.params;
    const badge = await Badge.findByPk(badge_id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }

    // Simple authorization: any authenticated user can delete for now
    // if (!req.user.isAdmin) { return res.status(403).send({ message: 'Forbidden. Admin access required.'}); }

    await badge.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting badge:', error);
    res.status(500).json({ message: 'Server error while deleting badge.' });
  }
});

module.exports = router;
