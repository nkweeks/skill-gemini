const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Answer = sequelize.define('Answer', {
  answer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // user_id, question_id, quiz_id, choice_id will be added by associations
  answer_text: { // For short-answer type questions
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_correct: { // Determined after submission for auto-gradable questions
    type: DataTypes.BOOLEAN,
    allowNull: true, // Can be null if not auto-gradable or not yet graded
  },
  // quiz_attempt_id can be added if we want a direct link,
  // but can also be inferred via user_id and quiz_id within a certain timeframe or attempt status
}, {
  timestamps: true,
  tableName: 'answers',
});

Answer.associate = (models) => {
  Answer.belongsTo(models.User, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE',
  });
  Answer.belongsTo(models.Question, {
    foreignKey: { name: 'question_id', allowNull: false },
    onDelete: 'CASCADE',
  });
  Answer.belongsTo(models.Quiz, { // Storing quiz_id denormalizes slightly but can be useful for queries
    foreignKey: { name: 'quiz_id', allowNull: false },
    onDelete: 'CASCADE',
  });
  Answer.belongsTo(models.Choice, { // For multiple-choice/true-false questions
    foreignKey: { name: 'choice_id', allowNull: true }, // Null if not MC/TF or if choice wasn't made
    onDelete: 'SET NULL', // If a choice is deleted, the answer remains but choice_id becomes null
  });
  // If directly linking Answer to QuizAttempt:
  // Answer.belongsTo(models.QuizAttempt, {
  //   foreignKey: { name: 'quiz_attempt_id', allowNull: false },
  //   onDelete: 'CASCADE',
  // });
};

module.exports = Answer;
