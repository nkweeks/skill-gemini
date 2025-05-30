const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // Configuration for test environment (in-memory SQLite)
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false, // Disable logging for tests, or use console.log for debugging
    // dialectOptions: { TimeZone: 'Etc/GMT0' } // Optional: ensure consistent timezone for tests
  });
  console.log('Using in-memory SQLite database for testing.');
} else {
  // Configuration for development/production (file-based SQLite or other DB)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './dev_database.sqlite', // Path to the SQLite database file
    logging: console.log, // Enable logging to see SQL queries (optional)
  });
  console.log('Using file-based SQLite database for development/production.');
}

module.exports = sequelize;
