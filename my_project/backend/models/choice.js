const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Choice = sequelize.define('Choice', {
  choice_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  choice_text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // QuestionId will be added by association
}, {
  timestamps: true, // Adds createdAt and updatedAt
  tableName: 'choices',
});

Choice.associate = (models) => {
  // A Choice belongs to a Question
  Choice.belongsTo(models.Question, {
    foreignKey: {
      name: 'question_id', // Sequelize will create this foreign key
      allowNull: false,
    },
    onDelete: 'CASCADE',
  });

  // A Choice can be part of many Answers
  Choice.hasMany(models.Answer, {
    foreignKey: 'choice_id',
  });
};

module.exports = Choice;
