const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  task_id: {
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
  points_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0, // Points should not be negative
    }
  },
  // skill_id will be added by association
  // created_by_user_id will be added by association
}, {
  timestamps: true,
  tableName: 'tasks',
});

Task.associate = (models) => {
  Task.belongsTo(models.Skill, {
    foreignKey: {
      name: 'skill_id',
      allowNull: true, // A task might not be directly tied to a skill initially or skill could be deleted
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Task.belongsTo(models.User, {
    as: 'Creator',
    foreignKey: {
      name: 'created_by_user_id',
      allowNull: true, // Creator could be deleted, task remains
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // A Task can have many TaskSubmissions
  Task.hasMany(models.TaskSubmission, {
    foreignKey: 'task_id',
  });
};

module.exports = Task;
