/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>'],
  transform: {},
  reporters: [
    'default',
    ['<rootDir>/tests/jest-summary-reporter.cjs', {}],
  ],
  testTimeout: 30000,
  verbose: true,
};
