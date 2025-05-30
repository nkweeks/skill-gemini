const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
  quiz_attempt_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // user_id, quiz_id will be added by associations
  score: {
    type: DataTypes.FLOAT, // Or INTEGER, depending on precision needed
    allowNull: true, // Null until graded/completed
  },
  status: {
    type: DataTypes.ENUM('started', 'completed'),
    allowNull: false,
    defaultValue: 'started',
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true, // Null until completed
  },
}, {
  timestamps: true, // Will add createdAt and updatedAt
  updatedAt: 'completed_at', // Alias updatedAt to completed_at for clarity if preferred, or manage manually
  tableName: 'quiz_attempts',
});

QuizAttempt.associate = (models) => {
  QuizAttempt.belongsTo(models.User, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE', // Or SET NULL if attempts should be kept if user is deleted
  });
  QuizAttempt.belongsTo(models.Quiz, {
    foreignKey: { name: 'quiz_id', allowNull: false },
    onDelete: 'CASCADE',
  });
  // If we want to link answers directly to an attempt:
  // QuizAttempt.hasMany(models.Answer, {
  //   foreignKey: { name: 'quiz_attempt_id', allowNull: false },
  // });
};

module.exports = QuizAttempt;
