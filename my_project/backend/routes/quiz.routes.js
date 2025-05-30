const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');
const Skill = require('../models/skill');
const User = require('../models/user');
const Question = require('../models/question');
const Choice = require('../models/choice');
const { verifyToken } = require('../middleware/auth.middleware');
const sequelize = require('../config/database');
const { checkAndAwardBadges } = require('../services/badge.service'); // Import badge service

// POST /api/quizzes/ - Create a quiz (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, skill_id } = req.body;
    const CreatedByUserId = req.user.user_id;

    if (!title || !skill_id) {
      return res.status(400).json({ message: 'Title and skill_id are required.' });
    }
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    const newQuiz = await Quiz.create({
      title,
      description,
      skill_id,
      CreatedByUserId,
    });
    res.status(201).json(newQuiz);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error while creating quiz.' });
  }
});

// GET /api/quizzes/ - Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [
        { model: Skill, attributes: ['name'] },
        { model: User, as: 'Creator', attributes: ['user_id', 'username'] },
        { model: Question, include: [Choice] } // Include questions and their choices
      ]
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error while fetching quizzes.' });
  }
});

// GET /api/quizzes/skill/:skill_id - Get all quizzes for a specific skill
router.get('/skill/:skill_id', async (req, res) => {
  try {
    const { skill_id } = req.params;
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }
    const quizzes = await Quiz.findAll({
      where: { skill_id },
      include: [
        { model: User, as: 'Creator', attributes: ['user_id', 'username'] },
        { model: Question, include: [Choice] }
      ]
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes by skill:', error);
    res.status(500).json({ message: 'Server error while fetching quizzes for the skill.' });
  }
});

// GET /api/quizzes/:quiz_id - Get a single quiz by ID, including questions and choices
router.get('/:quiz_id', async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const quiz = await Quiz.findByPk(quiz_id, {
      include: [
        { model: Skill, attributes: ['name', 'description'] },
        { model: User, as: 'Creator', attributes: ['user_id', 'username'] },
        {
          model: Question,
          include: [{ model: Choice, attributes: ['choice_id', 'choice_text', 'is_correct'] }],
          attributes: ['question_id', 'question_text', 'question_type']
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error while fetching quiz.' });
  }
});


// POST /api/quizzes/:quiz_id/questions - Add a question to a quiz (Protected)
router.post('/:quiz_id/questions', verifyToken, async (req, res) => {
  const t = await sequelize.transaction(); // Start a transaction
  try {
    const { quiz_id } = req.params;
    const { question_text, question_type, choices } = req.body;

    if (!question_text || !question_type) {
      await t.rollback();
      return res.status(400).json({ message: 'Question text and type are required.' });
    }

    const quiz = await Quiz.findByPk(quiz_id, { transaction: t });
    if (!quiz) {
      await t.rollback();
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Check if the user adding the question is the creator of the quiz
    if (quiz.CreatedByUserId !== req.user.user_id) {
        await t.rollback();
        return res.status(403).json({ message: 'Forbidden: You can only add questions to your own quizzes.' });
    }

    const newQuestion = await Question.create({
      quiz_id: parseInt(quiz_id),
      question_text,
      question_type,
    }, { transaction: t });

    if (question_type === 'multiple-choice' && choices && choices.length > 0) {
      if (!Array.isArray(choices) || choices.some(c => typeof c.choice_text === 'undefined' || typeof c.is_correct === 'undefined')) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid choices format for multiple-choice question.' });
      }
      const choiceInstances = choices.map(choice => ({
        ...choice,
        question_id: newQuestion.question_id,
      }));
      await Choice.bulkCreate(choiceInstances, { transaction: t });
    } else if (question_type === 'multiple-choice' && (!choices || choices.length === 0)) {
        await t.rollback();
        return res.status(400).json({ message: 'Multiple-choice questions require at least one choice.' });
    }


    await t.commit(); // Commit transaction

    // Refetch question with choices to return in response
    const result = await Question.findByPk(newQuestion.question_id, {
        include: [Choice]
    });
    res.status(201).json(result);

  } catch (error) {
    await t.rollback(); // Rollback transaction on error
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error while creating question.' });
  }
});

// GET /api/quizzes/:quiz_id/questions - List all questions for a quiz
router.get('/:quiz_id/questions', async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    const questions = await Question.findAll({
      where: { quiz_id: quiz_id },
      include: [Choice], // Include choices for each question
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions for quiz:', error);
    res.status(500).json({ message: 'Server error while fetching questions.' });
  }
});

// POST /api/quizzes/:quiz_id/submit - Submit answers for a quiz (Protected)
router.post('/:quiz_id/submit', verifyToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { quiz_id } = req.params;
    const user_id = req.user.user_id;
    const { answers } = req.body; // answers: [{ question_id, choice_id?, answer_text? }]

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Answers array is required and cannot be empty.' });
    }

    // Check if quiz exists
    const quiz = await Quiz.findByPk(quiz_id, {
      include: [{ model: Question, include: [Choice] }], // Include questions and choices for grading
      transaction: t
    });
    if (!quiz) {
      await t.rollback();
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Check for existing completed attempt (optional: allow re-attempts or only one attempt)
    const existingAttempt = await QuizAttempt.findOne({
        where: { user_id, quiz_id, status: 'completed' },
        transaction: t
    });
    if (existingAttempt) {
        // For now, let's prevent re-submission if already completed. This can be made more flexible.
        await t.rollback();
        return res.status(409).json({ message: 'You have already completed this quiz.' });
    }


    // Create QuizAttempt
    const quizAttempt = await QuizAttempt.create({
      user_id,
      quiz_id: parseInt(quiz_id),
      status: 'started', // Will be updated to 'completed'
    }, { transaction: t });

    let correctAnswersCount = 0;
    let autoGradableQuestionsCount = 0;
    const submittedAnswersDetails = [];

    for (const userAnswer of answers) {
      const question = quiz.Questions.find(q => q.question_id === userAnswer.question_id);
      if (!question) {
        // Handle case where a question_id submitted doesn't belong to this quiz (optional, or rely on DB constraints)
        console.warn(`Question ID ${userAnswer.question_id} not found in quiz ${quiz_id}. Skipping.`);
        continue;
      }

      let is_correct = null;
      let choice_id = userAnswer.choice_id || null;

      if (question.question_type === 'multiple-choice' || question.question_type === 'true-false') {
        autoGradableQuestionsCount++;
        if (choice_id) {
          const choice = question.Choices.find(c => c.choice_id === choice_id);
          if (choice && choice.is_correct) {
            is_correct = true;
            correctAnswersCount++;
          } else {
            is_correct = false;
          }
        } else {
          is_correct = false; // No choice selected for an auto-gradable question
        }
      }
      // For 'short-answer', is_correct remains null for now (manual grading needed)

      const createdAnswer = await Answer.create({
        user_id,
        question_id: question.question_id,
        quiz_id: parseInt(quiz_id),
        choice_id,
        answer_text: userAnswer.answer_text || null,
        is_correct,
        // quiz_attempt_id: quizAttempt.quiz_attempt_id, // If linking Answer directly to QuizAttempt
      }, { transaction: t });
      submittedAnswersDetails.push({
          answer_id: createdAnswer.answer_id,
          question_id: createdAnswer.question_id,
          choice_id: createdAnswer.choice_id,
          answer_text: createdAnswer.answer_text,
          is_correct: createdAnswer.is_correct,
          question_type: question.question_type
      });
    }

    // Calculate score
    const score = autoGradableQuestionsCount > 0 ? (correctAnswersCount / autoGradableQuestionsCount) * 100 : 0;

    // Update QuizAttempt
    quizAttempt.score = score;
    quizAttempt.status = 'completed';
    quizAttempt.completed_at = new Date();
    await quizAttempt.save({ transaction: t });

    // If score is positive, update user's total points
    if (quizAttempt.score && quizAttempt.score > 0) {
      const pointsFromQuiz = Math.round(quizAttempt.score); // Or any other logic to convert score to points
      if (pointsFromQuiz > 0) {
        try {
          // We need to fetch the user outside the transaction or pass the transaction if appropriate
          // For simplicity, fetching user separately after commit or before rollback.
          // However, for atomicity, this point update should ideally be part of the main transaction.
          // Let's adjust to include it in the transaction for now.
          const user = await User.findByPk(user_id, { transaction: t });
          if (user) {
            user.total_points = (user.total_points || 0) + pointsFromQuiz;
            await user.save({ transaction: t });
          } else {
            // This should not happen if user_id is from verifyToken
            console.error(`User not found with ID: ${user_id} when trying to award points for quiz.`);
            // Potentially throw an error to rollback if user must be found
          }
        } catch (userError) {
          // Log this error. If this is critical, rethrow to rollback.
          console.error('Error updating user total_points after quiz submission:', userError);
          // For now, let's consider it critical enough to rollback if point update fails
          throw userError; // This will trigger the catch block and rollback
        }
      }
    }

    // After points are updated, check for badges within the same transaction
    await checkAndAwardBadges(user_id, { transaction: t });

    await t.commit();

    res.status(200).json({
      quiz_attempt_id: quizAttempt.quiz_attempt_id,
      quiz_id: quizAttempt.quiz_id,
      user_id: quizAttempt.user_id,
      score: quizAttempt.score,
      status: quizAttempt.status,
      started_at: quizAttempt.started_at,
      completed_at: quizAttempt.completed_at,
      submitted_answers: submittedAnswersDetails,
    });

  } catch (error) {
    await t.rollback();
    console.error('Error submitting quiz answers:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Validation or Foreign Key Constraint Error.', details: error.errors ? error.errors.map(e=>e.message) : error.message });
    }
    res.status(500).json({ message: 'Server error while submitting quiz answers.' });
  }
});

module.exports = router;
