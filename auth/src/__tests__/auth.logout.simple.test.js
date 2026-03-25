const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Mock Redis to avoid using production instance
jest.mock("../db/redis", () => ({
  set: jest.fn().mockResolvedValue("OK"),
  get: jest.fn().mockResolvedValue(null),
}));

const redis = require("../db/redis");

describe("User Logout - Essential Tests", () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.DB_URL);
      console.log("Connected to test database");
      // Clear users collection before tests
      await UserModel.deleteMany({});

      // Create test user for logout tests
      const hashedPassword = await bcrypt.hash("TestPass123!@", 10);
      testUser = await UserModel.create({
        username: "testlogout",
        email: "testlogout@example.com",
        password: hashedPassword,
        fullName: {
          firstName: "Test",
          lastName: "Logout",
        },
      });

      // Generate valid token for authenticated tests
      authToken = jwt.sign(
        {
          id: testUser._id,
          username: testUser.username,
          role: testUser.role,
          email: testUser.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );
    } catch (error) {
      console.error("Database connection error:", error);
    }
  });

  afterAll(async () => {
    try {
      await UserModel.deleteMany({});
      await mongoose.disconnect();
      jest.clearAllMocks();
      console.log("Disconnected from test database");
    } catch (error) {
      console.error("Database disconnection error:", error);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Successful logout with valid token
  test("Should logout user successfully with valid token", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User Logout Successfully");
  });

  // Verify token is blacklisted in Redis
  test("Should blacklist token in Redis after successful logout", async () => {
    const newToken = jwt.sign(
      {
        id: testUser._id,
        username: testUser.username,
        role: testUser.role,
        email: testUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${newToken}`);

    expect(response.status).toBe(200);

    // Verify Redis set was called with correct params
    expect(redis.set).toHaveBeenCalled();
    expect(redis.set).toHaveBeenCalledWith(
      newToken,
      "blacklisted",
      "EX",
      24 * 60 * 60,
    );
  });

  // Logout without token
  test("Should reject logout - missing authentication token", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Unauthorized Access ! Please Login First",
    );
  });

  // Logout with malformed authorization header
  test("Should reject logout - malformed authorization header", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "InvalidFormat");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Unauthorized Access ! Please Login First",
    );
  });

  // Logout with invalid token format
  test("Should reject logout - invalid token format", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer invalid.token.format");

    expect(response.status).toBe(401);
  });
});
