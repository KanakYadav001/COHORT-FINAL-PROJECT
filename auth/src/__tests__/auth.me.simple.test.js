const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("User Profile - /api/auth/me Tests", () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.DB_URL);
      console.log("Connected to test database");
      // Clear users collection before tests
      await UserModel.deleteMany({});

      // Create test user for profile tests
      const hashedPassword = await bcrypt.hash("TestPass123!@", 10);
      testUser = await UserModel.create({
        username: "testprofile",
        email: "testprofile@example.com",
        password: hashedPassword,
        fullName: {
          firstName: "Test",
          lastName: "User",
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
      console.log("Disconnected from test database");
    } catch (error) {
      console.error("Database disconnection error:", error);
    }
  });

  // No token provided
  test("Should reject profile request - missing token", async () => {
    const response = await request(app).get("/api/auth/me").send({});

    expect(response.status).toBe(401);
  });

  // Invalid/expired token
  test("Should reject profile request - invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken123")
      .send({});

    expect(response.status).toBe(401);
  });

  // Valid token - should return user profile
  test("Should return user profile with valid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("username", "testprofile");
    expect(response.body.user).toHaveProperty(
      "email",
      "testprofile@example.com",
    );
    expect(response.body.user).toHaveProperty("fullName");
  });

  // Valid token - should not return password field
  test("Should return profile without password field", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.user).not.toHaveProperty("password");
  });

  // Valid token - should return correct user data structure
  test("Should return proper user data structure", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("_id");
    expect(response.body.user).toHaveProperty("username");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("fullName");
    expect(response.body.user.fullName).toHaveProperty("firstName");
    expect(response.body.user.fullName).toHaveProperty("lastName");
  });

  // Token in cookie instead of header
  test("Should accept token from cookie", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `token=${authToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
  });

  // Non-existent user token (token is valid but user doesn't exist)
  test("Should reject - user not found in database", async () => {
    // Create token for non-existent user
    const fakeUserId = new mongoose.Types.ObjectId();
    const fakeToken = jwt.sign(
      {
        id: fakeUserId,
        username: "nonexistent",
        email: "nonexistent@example.com",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send({});

    expect(response.status).toBe(404);
  });

  // Malformed authorization header
  test("Should reject - malformed authorization header", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `InvalidFormat ${authToken}`)
      .send({});

    expect(response.status).toBe(401);
  });
});
