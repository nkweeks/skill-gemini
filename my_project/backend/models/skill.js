const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Skill = sequelize.define('Skill', {
  skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'skills',
});

// Associations
Skill.associate = (models) => {
  // A Skill can have many Quizzes
  Skill.hasMany(models.Quiz, {
    foreignKey: {
      name: 'skill_id', // This is the default, but good to be explicit
      allowNull: false,
    },
    onDelete: 'CASCADE', // If a skill is deleted, its quizzes are also deleted
  });

  // A Skill can have many Tasks
  Skill.hasMany(models.Task, {
    foreignKey: {
      name: 'skill_id',
      allowNull: true, // As defined in Task model, task might not have skill
    },
  });
};

module.exports = Skill;
