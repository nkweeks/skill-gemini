const express = require('express');
const router = express.Router();
const TaskSubmission = require('../models/task_submission');
const Task = require('../models/task');
const User = require('../models/user');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkAndAwardBadges } = require('../services/badge.service'); // Import badge service

// POST /api/task-submissions/task/:task_id/submit - Submit for a task (Protected)
router.post('/task/:task_id/submit', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const user_id = req.user.user_id;
    const { submission_content } = req.body;

    if (!submission_content) {
      return res.status(400).json({ message: 'Submission content is required.' });
    }

    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Optional: Check if user has already submitted and if updates are allowed or new submissions are created.
    // For now, allowing multiple submissions.

    const newSubmission = await TaskSubmission.create({
      task_id: parseInt(task_id),
      user_id,
      submission_content,
      status: 'submitted', // Default status
    });

    res.status(201).json(newSubmission);
  } catch (error) {
    console.error('Error submitting task:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Server error while submitting task.' });
  }
});

// GET /api/task-submissions/task/:task_id - List submissions for a specific task (Protected)
// Authorization: For now, any authenticated user. Should be restricted to task creator/admin.
router.get('/task/:task_id', verifyToken, async (req, res) => {
  try {
    const { task_id } = req.params;

    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Add authorization check here in a real app:
    // e.g., if (req.user.user_id !== task.created_by_user_id && !req.user.isAdmin) {
    //   return res.status(403).json({ message: 'Forbidden: You are not authorized to view these submissions.' });
    // }

    const submissions = await TaskSubmission.findAll({
      where: { task_id: parseInt(task_id) },
      include: [{ model: User, attributes: ['user_id', 'username'] }], // Include user who submitted
      order: [['submitted_at', 'DESC']],
    });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions for task:', error);
    res.status(500).json({ message: 'Server error while fetching submissions.' });
  }
});

// GET /api/task-submissions/user/me - List all submissions for the logged-in user (Protected)
router.get('/user/me', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const submissions = await TaskSubmission.findAll({
      where: { user_id },
      include: [{ model: Task, attributes: ['task_id', 'title'] }], // Include task details
      order: [['submitted_at', 'DESC']],
    });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ message: 'Server error while fetching your submissions.' });
  }
});

// PUT /api/task-submissions/:submission_id/grade - Grade a submission (Protected)
// Authorization: For now, any authenticated user. Should be restricted to task creator/admin.
router.put('/:submission_id/grade', verifyToken, async (req, res) => {
  try {
    const { submission_id } = req.params;
    const { points_awarded, status } = req.body; // status could be 'completed', 'needs_revision'

    if (typeof points_awarded === 'undefined' || !status) {
      return res.status(400).json({ message: 'Points awarded and status are required.' });
    }
    if (!['completed', 'needs_revision', 'grading'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'completed', 'needs_revision', or 'grading'." });
    }


    const submission = await TaskSubmission.findByPk(submission_id, {
        include: [Task] // Include task to check creator
    });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    // Authorization check: Only task creator or admin can grade.
    // Assuming Task model has 'created_by_user_id'
     if (submission.Task && submission.Task.created_by_user_id !== req.user.user_id /* && !req.user.isAdmin */) {
       return res.status(403).json({ message: 'Forbidden: You are not authorized to grade this submission.' });
     }


    submission.points_awarded = parseInt(points_awarded);
    submission.status = status;
    submission.graded_at = new Date();

    await submission.save();

    // If points were awarded, update user's total points
    if (submission.points_awarded && submission.points_awarded > 0) {
      const user = await User.findByPk(submission.user_id);
      if (user) {
        user.total_points = (user.total_points || 0) + submission.points_awarded;
        await user.save(); // Assuming this is outside a transaction or handled appropriately
        await checkAndAwardBadges(user.user_id); // Check for badges after points update
      } else {
        console.error(`User not found with ID: ${submission.user_id} when trying to award points.`);
      }
      // Note: If user.save() or checkAndAwardBadges() can fail, consider wrapping in a transaction
      // that starts before `submission.save()` and commits after badge check.
      // For now, keeping it simple and badge awarding is best-effort after points.
    }

    res.json(submission);
  } catch (error) {
    // Important: If the main operation (grading) succeeded but badge awarding failed,
    // we might not want to send a 500 for the grading itself.
    // The current structure will catch errors from checkAndAwardBadges if they are rethrown
    // and not caught within the service for non-transactional calls.
    console.error('Error grading submission or awarding badges:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Server error while grading submission.' });
  }
});

module.exports = router;
