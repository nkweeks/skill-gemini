const { Sequelize } = require('sequelize');

// Configure Sequelize for a file-based SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './dev_database.sqlite', // Path to the SQLite database file
  logging: console.log, // Enable logging to see SQL queries (optional)
});

module.exports = sequelize;
