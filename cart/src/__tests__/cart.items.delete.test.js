const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock the cart controller so we don't depend on real DB logic
jest.mock("../controller/cart.controller", () => {
  return {
    cart: jest.fn((req, res) =>
      res
        .status(500)
        .json({ message: "POST handler not used in DELETE tests" }),
    ),
    UpdateCart: jest.fn((req, res) =>
      res
        .status(500)
        .json({ message: "PATCH handler not used in DELETE tests" }),
    ),
    getCart: jest.fn((req, res) =>
      res.status(500).json({ message: "GET handler not used in DELETE tests" }),
    ),
    deleteCartItem: jest.fn((req, res) => {
      const { productId } = req.params;
      const userId = req.user && (req.user._id || req.user.id);

      // Simulate 'cart not found'
      if (userId === "no-cart") {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Simulate 'product not found in cart'
      if (productId === "507f1f77bcf86cd799439016") {
        return res.status(404).json({ message: "Product not found in cart" });
      }

      return res.status(200).json({
        message: "Cart item deleted successfully",
      });
    }),
  };
});

// Mock the cart router so we can define the DELETE route for tests
jest.mock("../routers/cart.routes", () => {
  const express = require("express");
  const CartAutMiddleWare = require("../middleware/cart.middleware");
  const CartController = require("../controller/cart.controller");

  const router = express.Router();

  router.delete(
    "/items/:productId",
    CartAutMiddleWare(["user"]),
    CartController.deleteCartItem,
  );

  return router;
});

const app = require("../app");
const CartController = require("../controller/cart.controller");

// Ensure JWT secret exists for tests
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "test-secret-key";

function createTestToken(payload = {}) {
  const basePayload = {
    id: "507f1f77bcf86cd799439011",
    role: "user",
  };

  return jwt.sign({ ...basePayload, ...payload }, process.env.JWT_SECRET_KEY);
}

describe("DELETE /api/cart/items/:productId", () => {
  const validProductId = "507f1f77bcf86cd799439015";
  const missingProductId = "507f1f77bcf86cd799439016";

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when no Authorization token is provided", async () => {
    const response = await request(app).delete(
      `/api/cart/items/${validProductId}`,
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized");
    expect(CartController.deleteCartItem).not.toHaveBeenCalled();
  });

  test("returns 404 when cart is not found", async () => {
    const token = createTestToken({ id: "no-cart" });

    const response = await request(app)
      .delete(`/api/cart/items/${validProductId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Cart not found");
    expect(CartController.deleteCartItem).toHaveBeenCalledTimes(1);
  });

  test("returns 200 when item is deleted successfully", async () => {
    const token = createTestToken();

    const response = await request(app)
      .delete(`/api/cart/items/${validProductId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Cart item deleted successfully",
    );
    expect(CartController.deleteCartItem).toHaveBeenCalledTimes(1);
  });
});
