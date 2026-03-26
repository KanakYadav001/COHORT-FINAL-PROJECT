const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("Create User Address - Input Validation Tests", () => {
  let token;
  let userId;
  const baseUser = {
    username: "createaddressuser",
    email: "createaddress@test.com",
    password: "SecurePass123!@",
    fullName: {
      firstName: "Create",
      lastName: "User",
    },
  };

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.DB_URL);
      console.log("Connected to test database");
      await UserModel.deleteMany({});
    } catch (error) {
      console.error("Database connection error:", error);
    }
  });

  beforeEach(async () => {
    const user = await UserModel.create(baseUser);
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

  // Test 1: Valid address input with all required fields
  test("Should successfully create address with all valid fields", async () => {
    const validAddress = {
      street: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
    };

    const response = await request(app)
      .post("/api/auth/address")
      .set("Authorization", `Bearer ${token}`)
      .send(validAddress);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("User Address Created Successfully");
    expect(response.body).toHaveProperty("address");
    expect(response.body.address).toMatchObject(validAddress);

    // Verify in database
    const updatedUser = await UserModel.findById(userId);
    expect(updatedUser.address).toMatchObject(validAddress);
  });

  // Test 2: Invalid address - missing required fields
  test("Should reject address with missing required fields", async () => {
    const incompleteAddress = {
      street: "456 Oak Avenue",
      city: "Los Angeles",
      // Missing state, zipCode, country
    };

    const response = await request(app)
      .post("/api/auth/address")
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteAddress);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  // Test 3: Invalid address - wrong data types (numbers instead of strings)
  test("Should reject address with invalid data types", async () => {
    const invalidAddress = {
      street: 123, // Should be string
      city: "Los Angeles",
      state: "CA",
      zipCode: 90001, // Should be string
      country: "USA",
    };

    const response = await request(app)
      .post("/api/auth/address")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidAddress);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });
});
