const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskSubmission = sequelize.define('TaskSubmission', {
  submission_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  submission_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('submitted', 'grading', 'completed', 'needs_revision'),
    allowNull: false,
    defaultValue: 'submitted',
  },
  points_awarded: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null until graded
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  graded_at: {
    type: DataTypes.DATE,
    allowNull: true, // Null until graded
  },
  // task_id and user_id will be added by associations
}, {
  timestamps: false, // Using submitted_at and graded_at instead of Sequelize's default createdAt/updatedAt
  tableName: 'task_submissions',
});

TaskSubmission.associate = (models) => {
  TaskSubmission.belongsTo(models.Task, {
    foreignKey: { name: 'task_id', allowNull: false },
    onDelete: 'CASCADE', // If a task is deleted, its submissions are also deleted
  });
  TaskSubmission.belongsTo(models.User, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE', // If a user is deleted, their submissions are also deleted
  });
};

module.exports = TaskSubmission;
