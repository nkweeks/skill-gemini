const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  question_type: {
    type: DataTypes.ENUM('multiple-choice', 'true-false', 'short-answer'),
    allowNull: false,
  },
  // QuizId will be added by association
}, {
  timestamps: true,
  tableName: 'questions',
});

Question.associate = (models) => {
  // A Question belongs to a Quiz
  Question.belongsTo(models.Quiz, {
    foreignKey: {
      name: 'quiz_id', // Sequelize will create this foreign key
      allowNull: false,
    },
    onDelete: 'CASCADE',
  });

  // A Question can have many Choices (especially for multiple-choice)
  Question.hasMany(models.Choice, {
    foreignKey: {
      name: 'question_id', // Sequelize will create this foreign key
      allowNull: false,
    },
    onDelete: 'CASCADE',
  });

  // A Question can have many Answers
  Question.hasMany(models.Answer, {
    foreignKey: 'question_id',
  });
};

module.exports = Question;
