require("dotenv").config();
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Set a test JWT secret if not in environment
process.env.JWT_SECRET_KEY =
  process.env.JWT_SECRET_KEY || "test_secret_key_12345";

// Mock OrderModel BEFORE requiring routes
jest.mock("../model/order.model");

// DO NOT mock authMiddleware - use the real one!
// This way token verification works consistently across all tests

const OrderModel = require("../model/order.model");
const OrderController = require("../controller/order.controller");
const orderRouter = require("../router/order.route");

// Create Express app for testing
const app = express();
app.use(express.json());

// Mount the router
app.use("/api", orderRouter);

// Generate valid JWT token using same JWT_SECRET_KEY
const generateToken = (userId = "user123", role = "user") => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET_KEY);
};

describe("Order Routes - API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET /order/:id Tests ====================
  describe("GET /api/order/:id - Get Order By ID", () => {
    test("TC1: Should retrieve order successfully with valid order ID and valid user token", async () => {
      const orderId = "69ceac27e8d4c1990f8f036a";
      const userId = "69ccdf739b8d900686556910";
      const validToken = generateToken(userId, "user");

      const mockOrder = {
        _id: orderId,
        user: userId,
        items: [
          {
            productId: "prod1",
            quantity: 2,
            price: { amount: 100, currency: "INR" },
          },
        ],
        totalAmount: { amount: 200, currency: "INR" },
        status: "PENDING",
        address: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
      };

      OrderModel.findById.mockResolvedValueOnce(mockOrder);

      const response = await request(app)
        .get(`/api/order/${orderId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.message).toBe("Order retrieved successfully");
      expect(response.body.order._id).toBe(orderId);
      expect(OrderModel.findById).toHaveBeenCalledWith(orderId);
    });

    test("TC2: Should return 404 when order does not exist", async () => {
      const orderId = "nonexistent123";
      const validToken = generateToken("user123", "user");

      OrderModel.findById.mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/api/order/${orderId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    test("TC3: Should return 401 when no authorization token is provided", async () => {
      const orderId = "order123";

      const response = await request(app)
        .get(`/api/order/${orderId}`)
        .expect(401);

      expect(response.body.message).toBe("Unauthorized");
    });

    test("TC4: Should return 401 when invalid token is provided", async () => {
      const orderId = "order123";

      const response = await request(app)
        .get(`/api/order/${orderId}`)
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(response.body.message).toBe("Unauthorized");
    });
  });

  // ==================== GET /orders/me Tests ====================
  describe("GET /api/orders/me - Get All Orders for Current User", () => {
    test("TC1: Should retrieve all orders successfully for authenticated user", async () => {
      const userId = "user123";
      const validToken = generateToken(userId, "user");

      const mockOrders = [
        {
          _id: "order1",
          user: userId,
          items: [],
          totalAmount: { amount: 500, currency: "INR" },
          status: "PENDING",
        },
        {
          _id: "order2",
          user: userId,
          items: [],
          totalAmount: { amount: 1000, currency: "INR" },
          status: "PAID",
        },
      ];

      OrderModel.find.mockResolvedValueOnce(mockOrders);

      const response = await request(app)
        .get("/api/orders/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.message).toBe("Orders retrieved successfully");
      expect(response.body.orders).toHaveLength(2);
      expect(response.body.orders[0]._id).toBe("order1");
      expect(OrderModel.find).toHaveBeenCalledWith({ user: userId });
    });

    test("TC2: Should return no orders when user has not placed any orders", async () => {
      const userId = "user456";
      const validToken = generateToken(userId, "user");

      OrderModel.find.mockResolvedValueOnce([]);

      const response = await request(app)
        .get("/api/orders/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.message).toBe("Orders retrieved successfully");
      expect(response.body.orders).toHaveLength(0);
    });

    test("TC3: Should return 401 when no authorization token is provided", async () => {
      const response = await request(app).get("/api/orders/me").expect(401);

      expect(response.body.message).toBe("Unauthorized");
    });

    test("TC4: Should return orders only for the authenticated user (not other users)", async () => {
      const userId = "user789";
      const validToken = generateToken(userId, "user");

      const mockOrders = [
        {
          _id: "userSpecificOrder",
          user: userId,
          items: [],
          totalAmount: { amount: 750, currency: "INR" },
          status: "SHIPPED",
        },
      ];

      OrderModel.find.mockResolvedValueOnce(mockOrders);

      const response = await request(app)
        .get("/api/orders/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.orders[0].user).toBe(userId);
      expect(OrderModel.find).toHaveBeenCalledWith({ user: userId });
    });
  });

  // ==================== POST /order/:id/cancel Tests ====================
  describe("POST /api/order/:id/cancel - Cancel Order", () => {
    test("TC1: Should cancel order successfully when order is in PENDING status", async () => {
      const orderId = "order123";
      const userId = "user123";
      const validToken = generateToken(userId, "user");

      const mockOrder = {
        _id: orderId,
        user: userId,
        status: "PENDING",
        items: [],
        totalAmount: { amount: 500, currency: "INR" },
        save: jest.fn().mockResolvedValueOnce(this),
      };

      OrderModel.findById.mockResolvedValueOnce(mockOrder);

      const response = await request(app)
        .post(`/api/order/${orderId}/cancel`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.message).toBe("Order cancelled successfully");
      expect(mockOrder.status).toBe("CANCELLED");
      expect(mockOrder.save).toHaveBeenCalled();
    });

    test("TC2: Should return 404 when order does not exist", async () => {
      const orderId = "nonexistent123";
      const validToken = generateToken("user123", "user");

      OrderModel.findById.mockResolvedValueOnce(null);

      const response = await request(app)
        .post(`/api/order/${orderId}/cancel`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    test("TC3: Should return 400 when trying to cancel an already cancelled order", async () => {
      const orderId = "order123";
      const userId = "user123";
      const validToken = generateToken(userId, "user");

      const mockOrder = {
        _id: orderId,
        user: userId,
        status: "CANCELLED",
        items: [],
      };

      OrderModel.findById.mockResolvedValueOnce(mockOrder);

      const response = await request(app)
        .post(`/api/order/${orderId}/cancel`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order is already cancelled");
    });

    test("TC4: Should return 400 when trying to cancel a PAID or SHIPPED order", async () => {
      const orderId = "order123";
      const userId = "user123";
      const validToken = generateToken(userId, "user");

      const mockOrder = {
        _id: orderId,
        user: userId,
        status: "PAID",
        items: [],
      };

      OrderModel.findById.mockResolvedValueOnce(mockOrder);

      const response = await request(app)
        .post(`/api/order/${orderId}/cancel`)
        .set("Authorization", `Bearer ${validToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Cannot cancel an order that is already paid or shipped",
      );
    });
  });

  // ==================== PATCH /order/:id/address Tests ====================
  describe("PATCH /api/order/:id/address - Update Order Address", () => {
    test("TC1: Should update order address successfully with valid user token and new address", async () => {
      const orderId = "order123";
      const userToken = generateToken("user123", "user");

      const mockOrder = {
        _id: orderId,
        user: "user123",
        address: {
          street: "Old Street",
          city: "Old City",
          state: "OC",
          zipCode: "10001",
          country: "USA",
        },
        save: jest.fn().mockResolvedValueOnce(this),
      };

      const newAddress = {
        street: "456 New Street",
        city: "New City",
        state: "NC",
        zipCode: "20002",
        country: "USA",
      };

      OrderModel.findById.mockResolvedValueOnce(mockOrder);

      const response = await request(app)
        .patch(`/api/order/${orderId}/address`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ address: newAddress })
        .expect(200);

      expect(response.body.message).toBe("Order address updated successfully");
      expect(mockOrder.address).toEqual(newAddress);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    test("TC2: Should return 404 when order does not exist", async () => {
      const orderId = "nonexistent123";
      const userToken = generateToken("user123", "user");

      OrderModel.findById.mockResolvedValueOnce(null);

      const newAddress = {
        street: "456 New Street",
        city: "New City",
        state: "NC",
        zipCode: "20002",
        country: "USA",
      };

      const response = await request(app)
        .patch(`/api/order/${orderId}/address`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ address: newAddress })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    test("TC3: Should return 403 when token has insufficient role (admin instead of user)", async () => {
      const orderId = "69ceac27e8d4c1990f8f036a";
      const adminToken = generateToken("admin123", "admin");

      const newAddress = {
        street: "456 New Street",
        city: "New City",
        state: "NC",
        zipCode: "20002",
        country: "USA",
      };

      const response = await request(app)
        .patch(`/api/order/${orderId}/address`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ address: newAddress })
        .expect(403);

      expect(response.body.message).toBe("Forbidden");
    });

    test("TC4: Should return 401 when no authorization token is provided", async () => {
      const orderId = "order123";

      const newAddress = {
        street: "456 New Street",
        city: "New City",
        state: "NC",
        zipCode: "20002",
        country: "USA",
      };

      const response = await request(app)
        .patch(`/api/order/${orderId}/address`)
        .send({ address: newAddress })
        .expect(401);

      expect(response.body.message).toBe("Unauthorized");
    });
  });
});
