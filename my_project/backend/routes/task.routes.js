const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const Skill = require('../models/skill');
const User = require('../models/user'); // Needed for Creator association
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/tasks/ - Create a new task (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, skill_id, points_value } = req.body;
    const created_by_user_id = req.user.user_id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (skill_id) {
      const skill = await Skill.findByPk(skill_id);
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found.' });
      }
    }

    const newTask = await Task.create({
      title,
      description,
      skill_id: skill_id || null, // Ensure skill_id is null if not provided or invalid
      points_value: points_value || 0,
      created_by_user_id,
    });
    res.status(201).json(newTask);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task.' });
  }
});

// GET /api/tasks/ - Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: Skill, attributes: ['skill_id', 'name'] },
        { model: User, as: 'Creator', attributes: ['user_id', 'username'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
});

// GET /api/tasks/:task_id - Get a single task
router.get('/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = await Task.findByPk(task_id, {
      include: [
        { model: Skill, attributes: ['skill_id', 'name'] },
        { model: User, as: 'Creator', attributes: ['user_id', 'username'] },
      ],
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error while fetching task.' });
  }
});

// GET /api/tasks/skill/:skill_id - Get all tasks for a specific skill
router.get('/skill/:skill_id', async (req, res) => {
  try {
    const { skill_id } = req.params;
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }
    const tasks = await Task.findAll({
      where: { skill_id },
      include: [{ model: User, as: 'Creator', attributes: ['user_id', 'username'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by skill:', error);
    res.status(500).json({ message: 'Server error while fetching tasks for the skill.' });
  }
});

// PUT /api/tasks/:task_id - Update a task (Protected)
router.put('/:task_id', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const { title, description, skill_id, points_value } = req.body;
    const current_user_id = req.user.user_id;

    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.created_by_user_id !== current_user_id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own tasks.' });
    }

    if (title === '') { // Allow clearing other fields, but title must exist
        return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    if (skill_id) {
      const skill = await Skill.findByPk(skill_id);
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found.' });
      }
    }

    // Update fields if they are provided in the request body
    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.skill_id = skill_id !== undefined ? (skill_id || null) : task.skill_id;
    task.points_value = points_value !== undefined ? points_value : task.points_value;

    await task.save();
    res.json(task);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error while updating task.' });
  }
});

// DELETE /api/tasks/:task_id - Delete a task (Protected)
router.delete('/:task_id', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const current_user_id = req.user.user_id;

    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.created_by_user_id !== current_user_id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own tasks.' });
    }

    await task.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task.' });
  }
});

module.exports = router;
