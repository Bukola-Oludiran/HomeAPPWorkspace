module.exports = {
  ...require('./jest.config.js'),
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  collectCoverage: false,
};
