const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
require("dotenv").config();

describe("User Login - Essential Tests", () => {
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

  // User not found
  test("Should reject login - user not found", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "notfound@example.com",
      password: "SomePassword123!@",
    });

    expect(response.status).toBe(404);
  });

  // Missing email
  test("Should reject login - missing email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      password: "SecurePass123!@",
    });

    expect(response.status).toBe(400);
  });

  // Missing password
  test("Should reject login - missing password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
    });

    expect(response.status).toBe(400);
  });

  // Invalid email format
  test("Should reject login - invalid email format", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "invalid-email",
      password: "SecurePass123!@",
    });

    expect(response.status).toBe(400);
  });

  // Empty body
  test("Should reject login - empty request", async () => {
    const response = await request(app).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
  });
});
