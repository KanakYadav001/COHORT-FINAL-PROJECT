const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
require("dotenv").config();

describe("User Registration - Essential Tests", () => {
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

  afterAll(async () => {
    try {
      await UserModel.deleteMany({});
      await mongoose.disconnect();
      console.log("Disconnected from test database");
    } catch (error) {
      console.error("Database disconnection error:", error);
    }
  });
  // Valid registration
  test("Should register user with valid data", async () => {
    const newUser = {
      username: "john_doe",
      email: "john@example.com",
      password: "SecurePass123!@",
      fullName: {
        firstName: "John",
        lastName: "Doe",
      },
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBeLessThan(400);
  });

  // Invalid email
  test("Should reject invalid email", async () => {
    const newUser = {
      username: "test_user",
      email: "invalid-email",
      password: "SecurePass123!@",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
  });

  // Weak password
  test("Should reject weak password", async () => {
    const newUser = {
      username: "test_user",
      email: "test@example.com",
      password: "weak",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
  });

  // Duplicate email
  test("Should reject duplicate email", async () => {
    const user1 = {
      username: "user_one",
      email: "duplicate@example.com",
      password: "SecurePass123!@",
      fullName: {
        firstName: "User",
        lastName: "One",
      },
    };

    await request(app).post("/api/auth/register").send(user1);

    const user2 = {
      username: "user_two",
      email: "duplicate@example.com",
      password: "SecurePass456!@",
      fullName: {
        firstName: "User",
        lastName: "Two",
      },
    };

    const response = await request(app).post("/api/auth/register").send(user2);

    expect(response.status).toBe(409);
  });

  // Missing required fields
  test("Should reject missing email", async () => {
    const newUser = {
      username: "test_user",
      password: "SecurePass123!@",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
  });

  // Security - XSS
  test("Should reject XSS attempt", async () => {
    const newUser = {
      username: "<script>alert()</script>",
      email: "test@example.com",
      password: "SecurePass123!@",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
  });

  // Security - SQL injection
  test("Should reject SQL injection", async () => {
    const newUser = {
      username: "test_user",
      email: "test@example.com'; DROP TABLE users; --",
      password: "SecurePass123!@",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
  });
});
