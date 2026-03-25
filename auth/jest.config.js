module.exports = {
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/__tests__/**",
  ],
  testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  setupFilesAfterEnv: ["./jest.setup.js"],
  timeout: 5000,
};
