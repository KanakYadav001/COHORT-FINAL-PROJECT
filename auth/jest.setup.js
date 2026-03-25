// Jest setup file for test configuration
beforeAll(() => {
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // Cleanup after all tests
  jest.clearAllMocks();
});

// Set test timeout
jest.setTimeout(10000);
