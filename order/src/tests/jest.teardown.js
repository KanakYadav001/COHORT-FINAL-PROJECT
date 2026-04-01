const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  // Disconnect mongoose
  await mongoose.disconnect();
  console.log("✓ Mongoose disconnected");
};
