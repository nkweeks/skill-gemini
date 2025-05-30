module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'], // Configure setup file
  // Consider increasing timeout if tests are slow due to DB operations or many tests
  // testTimeout: 10000,
  clearMocks: true, // Automatically clear mock calls and instances between every test
  // verbose: true, // Optionally, to see more detailed test output
};
