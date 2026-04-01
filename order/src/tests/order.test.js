const request = require("supertest");
const app = require("../../app");
const OrderModel = require("../model/cart.model");
const jwt = require("jsonwebtoken");

// Mock data
const validToken = jwt.sign(
  { userId: "60d5ec49c1234567890abcde", role: "user" },
  process.env.JWT_SECRET || "test-secret",
  { expiresIn: "1h" },
);

const validOrderPayload = {
  items: [
    {
      productId: "60d5ec49c1234567890abcdf",
      quantity: 2,
      price: {
        amount: 999,
        currency: "USD",
      },
    },
    {
      productId: "60d5ec49c1234567890abce0",
      quantity: 1,
      price: {
        amount: 1499,
        currency: "USD",
      },
    },
  ],
  totalAmount: {
    amount: 3497,
    currency: "USD",
  },
  address: {
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    isDefault: true,
  },
};

describe("POST /api/order - Create Order Tests", () => {
  // Test Case 1: Successful Order Creation
  describe("Test Case 1: Successful Order Creation", () => {
    it("should create an order successfully with valid data and authentication", async () => {
      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validOrderPayload)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "message",
        "Order created successfully",
      );
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data).toHaveProperty("status", "PENDING");
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.totalAmount.amount).toBe(3497);
      expect(response.body.data.totalAmount.currency).toBe("USD");
    });
  });

  // Test Case 2: Missing Authentication Token
  describe("Test Case 2: Missing Authentication Token", () => {
    it("should return 401 Unauthorized when no token is provided", async () => {
      const response = await request(app)
        .post("/api/order")
        .send(validOrderPayload)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(/token|auth|unauthorized/i);
    });

    it("should return 401 Unauthorized with invalid token", async () => {
      const response = await request(app)
        .post("/api/order")
        .set("Authorization", "Bearer invalid.token.here")
        .send(validOrderPayload)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  // Test Case 3: Missing or Invalid Required Fields
  describe("Test Case 3: Missing or Invalid Required Fields", () => {
    it("should return 400 Bad Request when items array is missing", async () => {
      const invalidPayload = { ...validOrderPayload };
      delete invalidPayload.items;

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: "items",
        }),
      );
    });

    it("should return 400 Bad Request when address is missing", async () => {
      const invalidPayload = { ...validOrderPayload };
      delete invalidPayload.address;

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: "address",
        }),
      );
    });

    it("should return 400 Bad Request when items array is empty", async () => {
      const invalidPayload = {
        ...validOrderPayload,
        items: [],
      };

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toMatch(/items|empty/i);
    });

    it("should return 400 Bad Request with invalid currency in price", async () => {
      const invalidPayload = {
        ...validOrderPayload,
        items: [
          {
            productId: "60d5ec49c1234567890abcdf",
            quantity: 2,
            price: {
              amount: 999,
              currency: "XYZ", // Invalid currency
            },
          },
        ],
      };

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toMatch(/currency|invalid/i);
    });

    it("should return 400 Bad Request with invalid quantity (less than 1)", async () => {
      const invalidPayload = {
        ...validOrderPayload,
        items: [
          {
            productId: "60d5ec49c1234567890abcdf",
            quantity: 0, // Invalid quantity
            price: {
              amount: 999,
              currency: "USD",
            },
          },
        ],
      };

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toMatch(/quantity|minimum/i);
    });
  });

  // Test Case 4: Invalid Data Types and Schema Validation
  describe("Test Case 4: Invalid Data Types and Schema Validation", () => {
    it("should return 400 when totalAmount does not match item prices", async () => {
      const invalidPayload = {
        ...validOrderPayload,
        totalAmount: {
          amount: 1000, // Does not match sum of item prices
          currency: "USD",
        },
      };

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toMatch(
        /totalAmount|mismatch|calculation/i,
      );
    });

    it("should return 400 when address has missing required fields", async () => {
      const invalidPayload = {
        ...validOrderPayload,
        address: {
          street: "123 Main Street",
          // Missing city, state, zipCode, country
          isDefault: true,
        },
      };

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 when item productId is invalid ObjectId", async () => {
      const invalidPayload = {
        ...validOrderPayload,
        items: [
          {
            productId: "invalid-id", // Invalid ObjectId format
            quantity: 2,
            price: {
              amount: 999,
              currency: "USD",
            },
          },
        ],
      };

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
    });
  });
});
