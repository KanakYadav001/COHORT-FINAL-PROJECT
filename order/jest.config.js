module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/tests/jest.setup.js"],
  teardownFilesAfterEnv: ["<rootDir>/src/tests/jest.teardown.js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/tests/**", "!src/db/**"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 10000,
};
