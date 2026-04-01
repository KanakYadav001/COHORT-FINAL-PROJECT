const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

module.exports = async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect mongoose to virtual MongoDB
  await mongoose.connect(mongoUri);
  console.log("✓ Virtual MongoDB server started for testing");

  // Store in global for access in tests if needed
  global.__MONGO_URI__ = mongoUri;
  global.__MONGO_DB_NAME__ = "test";
};
