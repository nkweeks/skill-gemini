const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  quiz_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // CreatedByUserId will be added by association
  // SkillId will be added by association
}, {
  timestamps: true,
  tableName: 'quizzes',
});

// Associations
Quiz.associate = (models) => {
  // A Quiz belongs to a Skill
  Quiz.belongsTo(models.Skill, {
    foreignKey: {
      name: 'skill_id',
      allowNull: false,
    },
  });

  // A Quiz belongs to a User (as its creator)
  Quiz.belongsTo(models.User, {
    as: 'Creator', // Alias for the association
    foreignKey: {
      name: 'CreatedByUserId',
      allowNull: false,
    },
  });

  // A Quiz can have many Questions
  Quiz.hasMany(models.Question, {
    foreignKey: {
      name: 'quiz_id', // This should match the foreign key in Question model
      allowNull: false,
    },
    onDelete: 'CASCADE', // If a quiz is deleted, its questions are also deleted
  });

  // A Quiz can have many Answers
  Quiz.hasMany(models.Answer, {
    foreignKey: 'quiz_id',
  });

  // A Quiz can have many QuizAttempts
  Quiz.hasMany(models.QuizAttempt, {
    foreignKey: 'quiz_id',
  });
};

module.exports = Quiz;
