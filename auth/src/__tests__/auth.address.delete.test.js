const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("Delete User Address - Essential Tests", () => {
  let token;
  let userId;
  const userWithAddress = {
    username: "deladdressuser",
    email: "deladdressuser@test.com",
    password: "SecurePass123!@",
    fullName: {
      firstName: "DelAddress",
      lastName: "User",
    },
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
    },
  };

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.DB_URL);
      console.log("Connected to test database");
      // Clear users collection before tests
      await UserModel.deleteMany({});
    } catch (error) {
      console.error("Database connection error:", error);
    }
  });

  beforeEach(async () => {
    // Create a user with address for each test
    const user = await UserModel.create(userWithAddress);
    userId = user._id;
    token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from test database");
    } catch (error) {
      console.error("Database disconnection error:", error);
    }
  });

  // Test 1: Return 401 when trying to delete address without authentication
  test("Should return 401 when trying to delete address without token", async () => {
    const response = await request(app).delete("/api/auth/address");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  // Test 2: Successfully delete address when user has no address (idempotent)
  test("Should handle deletion request when address is already empty", async () => {
    // First deletion
    await request(app)
      .delete("/api/auth/address")
      .set("Authorization", `Bearer ${token}`);

    // Second deletion - should still succeed (idempotent)
    const response = await request(app)
      .delete("/api/auth/address")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
});
