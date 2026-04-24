require("dotenv").config({ path: `${__dirname}/../../.env` });
const request = require("supertest");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const express = require("express");
const OrderModel = require("../model/order.model");
const authMiddleware = require("../middleware/orderAuth.middleware");
const {
  validateCreateOrder,
  handleValidationErrors,
} = require("../middleware/orderValidation.middleware");
const OrderController = require("../controller/order.controller");

// Mock axios
jest.mock("axios");

// Mock OrderModel
jest.mock("../model/order.model");

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post(
  "/api/order",
  authMiddleware(["user"]),
  validateCreateOrder,
  handleValidationErrors,
  OrderController.createOrder,
);

// Generate valid JWT token using .env JWT_SECRET_KEY
const generateValidToken = (userId = "user123", role = "user") => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET_KEY);
};

describe("POST /api/order - Create Order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Successful Order Creation with Valid Data
  test("Should create order successfully with valid address and sufficient stock", async () => {
    const validToken = generateValidToken("user123", "user");
    const userId = "user123";

    const mockAddress = {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    };

    const mockCartData = {
      data: {
        cart: {
          item: [
            { productId: "prod1", quantity: 2 },
            { productId: "prod2", quantity: 1 },
          ],
        },
      },
    };

    const mockProductData = [
      {
        _id: "prod1",
        title: "Product 1",
        stock: 10,
        price: { amount: 50, currency: "INR" },
      },
      {
        _id: "prod2",
        title: "Product 2",
        stock: 5,
        price: { amount: 100, currency: "INR" },
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/cart")) {
        return Promise.resolve(mockCartData);
      }
      if (url.includes("/api/product")) {
        // Return the correct product based on productId in URL
        const productId = url.split("/").pop();
        const product = mockProductData.find((p) => p._id === productId);
        return Promise.resolve({ data: { products: product } });
      }
    });

    OrderModel.create.mockResolvedValueOnce({
      _id: "order123",
      user: userId,
      items: [
        {
          productId: "prod1",
          quantity: 2,
          price: { amount: 100, currency: "INR" },
        },
        {
          productId: "prod2",
          quantity: 1,
          price: { amount: 100, currency: "INR" },
        },
      ],
      totalAmount: { amount: 200, currency: "INR" },
      status: "PENDING",
      address: mockAddress,
    });

    const response = await request(app)
      .post("/api/order")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ address: mockAddress });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Order created successfully");
  });

  // Test Case 2: Invalid Address - Missing Required Fields
  test("Should return 400 error when address fields are missing", async () => {
    const validToken = generateValidToken("user123", "user");

    const invalidAddress = {
      street: "123 Main Street",
      // Missing city, state, zipCode, country
    };

    const response = await request(app)
      .post("/api/order")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ address: invalidAddress });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test Case 3: Insufficient Stock
  test("Should return 400 error when product stock is insufficient", async () => {
    const validToken = generateValidToken("user123", "user");

    const mockAddress = {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    };

    const mockCartData = {
      data: {
        cart: {
          item: [{ productId: "prod1", quantity: 20 }], // Requesting 20 units
        },
      },
    };

    const mockProductData = {
      _id: "prod1",
      title: "Product 1",
      stock: 5, // Only 5 units available
      price: { amount: 50, currency: "INR" },
    };

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/cart")) {
        return Promise.resolve(mockCartData);
      }
      if (url.includes("/api/product")) {
        return Promise.resolve({ data: { products: mockProductData } });
      }
    });

    const response = await request(app)
      .post("/api/order")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ address: mockAddress });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Insufficient stock");
  });

  // Test Case 4: Unauthorized Request - Missing Authorization
  test("Should return 401 error when authorization token is missing", async () => {
    const mockAddress = {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    };

    const response = await request(app)
      .post("/api/order")
      .send({ address: mockAddress });

    expect(response.status).toBe(401);
  });
});
