const sequelize = require('../config/database'); // Path to your Sequelize instance
// Import all models to ensure they are part of the sequelize.models object
require('../models/user');
require('../models/skill');
require('../models/quiz');
require('../models/question');
require('../models/choice');
require('../models/task');
require('../models/answer');
require('../models/quiz_attempt');
require('../models/task_submission');
require('../models/badge');
require('../models/user_badge');


// Function to initialize associations
const initializeAssociations = () => {
    const models = sequelize.models;
    Object.values(models)
      .filter(model => typeof model.associate === 'function')
      .forEach(model => model.associate(models));
    console.log("Test setup: Associations initialized.");
};


beforeAll(async () => {
  try {
    console.log("Test setup: Authenticating Sequelize for test environment...");
    await sequelize.authenticate(); // Verify connection
    console.log("Test setup: Sequelize authenticated successfully.");

    console.log("Test setup: Initializing associations...");
    initializeAssociations(); // Call this before sync

    console.log("Test setup: Syncing database (force: true)...");
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log("Test setup: Database synced successfully.");
  } catch (error) {
    console.error("Test setup: Error during beforeAll:", error);
    process.exit(1); // Exit if setup fails
  }
});

afterEach(async () => {
  // Clean up database after each test to ensure test isolation
  // This is a more robust way to clean all tables
  const models = sequelize.models;
  try {
    for (const modelName in models) {
        // Using truncate with cascade should handle dependencies and reset auto-increment counters
        await models[modelName].destroy({ where: {}, truncate: true, cascade: true, force: true });
    }
  } catch(error) {
      console.error("Error during afterEach cleanup:", error);
      // It might be okay to continue tests if cleanup has minor issues, or exit:
      // process.exit(1);
  }
});

afterAll(async () => {
  try {
    console.log("Test setup: Closing database connection...");
    await sequelize.close();
    console.log("Test setup: Database connection closed.");
  } catch (error) {
    console.error("Test setup: Error closing database connection:", error);
  }
});
