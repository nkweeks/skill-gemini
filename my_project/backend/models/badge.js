const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Badge = sequelize.define('Badge', {
  badge_id: {
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
  icon_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  criteria_type: {
    type: DataTypes.ENUM('points', 'specific_tasks', 'specific_quizzes', 'skill_completion'),
    allowNull: false,
  },
  criteria_value_points: { // e.g., 1000 points needed
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  criteria_value_ids: { // e.g., JSON array of task IDs [1, 5, 10] or skill IDs
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'badges',
});

Badge.associate = (models) => {
  Badge.belongsToMany(models.User, {
    through: 'UserBadge', // Name of the join table
    foreignKey: 'badge_id',
    otherKey: 'user_id',
    timestamps: false, // The join table UserBadge has its own timestamp 'earned_at'
  });
};

module.exports = Badge;
