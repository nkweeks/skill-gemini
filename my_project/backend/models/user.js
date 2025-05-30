const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true, // Enables createdAt and updatedAt fields
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'users', // Optional: specify table name
});

// Associations
User.associate = (models) => {
  // A User can create many Quizzes
  User.hasMany(models.Quiz, {
    foreignKey: {
      name: 'CreatedByUserId',
      allowNull: false,
    },
    as: 'CreatedQuizzes', // Alias for this specific association
  });

  // A User can create many Tasks
  User.hasMany(models.Task, {
    foreignKey: {
      name: 'created_by_user_id',
      allowNull: true, // As defined in Task model
    },
    as: 'CreatedTasks', // Alias for this specific association
  });

  // A User can have many Answers
  User.hasMany(models.Answer, {
    foreignKey: 'user_id',
  });

  // A User can have many QuizAttempts
  User.hasMany(models.QuizAttempt, {
    foreignKey: 'user_id',
  });

  // A User can have many TaskSubmissions
  User.hasMany(models.TaskSubmission, {
    foreignKey: 'user_id',
  });

  // User can have many Badges (through UserBadge)
  User.belongsToMany(models.Badge, {
    through: models.UserBadge, // Explicitly use the UserBadge model
    foreignKey: 'user_id',
    otherKey: 'badge_id',
  });

  // User can have many UserBadge entries (direct access to the join table instances)
  User.hasMany(models.UserBadge, {
    foreignKey: 'user_id',
  });
};

module.exports = User;
