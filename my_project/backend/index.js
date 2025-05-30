const express = require('express');
const sequelize = require('./config/database'); // Import Sequelize instance
const User = require('./models/user');
const Skill = require('./models/skill');
const Quiz = require('./models/quiz');
const Question = require('./models/question');
const Choice = require('./models/choice');
const Task = require('./models/task');
const Answer = require('./models/answer');
const QuizAttempt = require('./models/quiz_attempt');
const TaskSubmission = require('./models/task_submission');
const Badge = require('./models/badge'); // Import Badge
const UserBadge = require('./models/user_badge'); // Import UserBadge

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Import auth routes
const authRoutes = require('./auth/auth.routes');
app.use('/api/auth', authRoutes);

// Import user routes
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// Import skill routes
const skillRoutes = require('./routes/skill.routes');
app.use('/api/skills', skillRoutes);

// Import quiz routes
const quizRoutes = require('./routes/quiz.routes');
app.use('/api/quizzes', quizRoutes);

// Import task routes
const taskRoutes = require('./routes/task.routes');
app.use('/api/tasks', taskRoutes);

// Import task submission routes
const taskSubmissionRoutes = require('./routes/task_submission.routes.js');
app.use('/api/task-submissions', taskSubmissionRoutes);

// Import badge routes
const badgeRoutes = require('./routes/badge.routes');
app.use('/api/badges', badgeRoutes);

// Initialize Sequelize and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Define associations
    const models = { User, Skill, Quiz, Question, Choice, Task, Answer, QuizAttempt, TaskSubmission, Badge, UserBadge }; // Add Badge, UserBadge
    Object.values(models)
      .filter(model => typeof model.associate === 'function')
      .forEach(model => model.associate(models));

    // Sync all defined models to the DB.
    // Use { force: true } to drop and re-create tables on every app start (for development)
    // Use { alter: true } to attempt to alter existing tables (safer for production)
    await sequelize.sync({ alter: true }); // Using alter: true for safer updates
    console.log('All models were synchronized successfully.');

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
  }
}

startServer();
