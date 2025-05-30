const express = require('express');
const router = express.Router();
const Skill = require('../models/skill');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/skills/ - Create a skill (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    const newSkill = await Skill.create({ name, description });
    res.status(201).json(newSkill);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Skill name already exists.' });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    console.error('Error creating skill:', error);
    res.status(500).json({ message: 'Server error while creating skill.' });
  }
});

// GET /api/skills/ - Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error while fetching skills.' });
  }
});

module.exports = router;
