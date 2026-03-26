const request = require("supertest");
const app = require("../app");
const UserModel = require("../model/auth.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("Fetch User Address - Essential Tests", () => {
  let token;
  let userId;
  const userWithAddress = {
    username: "addressuser",
    email: "addressuser@test.com",
    password: "SecurePass123!@",
    fullName: {
      firstName: "Address",
      lastName: "User",
    },
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
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

  // Test 1: Successfully fetch user address when authenticated
  test("Should successfully fetch user address with valid token", async () => {
    const response = await request(app)
      .get("/api/auth/address")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("address");
    expect(response.body.address).toEqual(
      expect.objectContaining({
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      }),
    );
  });

  // Test 2: Return 401 when trying to fetch address without authentication
  test("Should return 401 when no authentication token provided", async () => {
    const response = await request(app).get("/api/auth/address");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  // Test 3: Successfully fetch address even if it's empty/null
  test("Should fetch user address when user has no address set", async () => {
    const userNoAddress = {
      username: "noaddressuser",
      email: "noaddress@test.com",
      password: "SecurePass123!@",
      fullName: {
        firstName: "NoAddress",
        lastName: "User",
      },
    };

    const user = await UserModel.create(userNoAddress);
    const newToken = jwt.sign(
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

    const response = await request(app)
      .get("/api/auth/address")
      .set("Authorization", `Bearer ${newToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("address");
  });
});
