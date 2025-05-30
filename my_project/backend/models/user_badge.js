const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBadge = sequelize.define('UserBadge', {
  user_badge_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  earned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  // user_id and badge_id FKs will be added by associations / defined here
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Name of the User table
      key: 'user_id',
    }
  },
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'badges', // Name of the Badge table
      key: 'badge_id',
    }
  }
}, {
  timestamps: false, // We have a custom 'earned_at' field
  tableName: 'user_badges',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'badge_id'], // Ensures a user cannot have the same badge multiple times
    },
  ],
});

UserBadge.associate = (models) => {
  UserBadge.belongsTo(models.User, { foreignKey: 'user_id' });
  UserBadge.belongsTo(models.Badge, { foreignKey: 'badge_id' });
};

module.exports = UserBadge;
