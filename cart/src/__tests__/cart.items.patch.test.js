const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock the cart controller so we don't rely on real controller logic,
// but keep behaviour aligned with the controller's current contract.
jest.mock("../controller/cart.controller", () => {
  const original = jest.requireActual("../controller/cart.controller");

  return {
    ...original,
    // Stub for UpdateCart used by PATCH route
    UpdateCart: jest.fn((req, res) => {
      const { productId } = req.params;
      const { quantity } = req.body || {};
      const userId = req.user && (req.user._id || req.user.id);

      const qty = Number(quantity);

      if (!productId || !qty || qty < 1) {
        return res.status(400).json({
          message:
            "productId and quantity are required and quantity must be greater than 0",
        });
      }

      // Simulate invalid ObjectId
      if (productId === "000000000000000000000000") {
        return res.status(400).json({ message: "Invalid productId" });
      }

      // Simulate 'cart not found'
      if (userId === "no-cart") {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Simulate 'product not found in cart'
      if (productId === "507f1f77bcf86cd799439016") {
        return res.status(404).json({ message: "Product not found in cart" });
      }

      return res.status(200).json({
        message: "Cart item updated successfully",
        cart: {
          user: userId,
          item: [{ productId, quantity: qty }],
        },
      });
    }),
  };
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

describe("PATCH /api/cart/items/:productId", () => {
  const validProductId = "507f1f77bcf86cd799439015";
  const missingProductId = "507f1f77bcf86cd799439016";

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when no Authorization token is provided", async () => {
    const response = await request(app)
      .patch(`/api/cart/items/${validProductId}`)
      .send({ quantity: 2 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized");
    expect(CartController.UpdateCart).not.toHaveBeenCalled();
  });

  test("returns 400 when quantity is missing (validation)", async () => {
    const token = createTestToken();

    const response = await request(app)
      .patch(`/api/cart/items/${validProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    const quantityError = response.body.errors.find(
      (e) => e.path === "quantity" || e.param === "quantity",
    );
    expect(quantityError).toBeDefined();
    expect(CartController.UpdateCart).not.toHaveBeenCalled();
  });

  test("returns 404 when cart is not found", async () => {
    const token = createTestToken({ id: "no-cart" });

    const response = await request(app)
      .patch(`/api/cart/items/${validProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Cart not found");
    expect(CartController.UpdateCart).toHaveBeenCalledTimes(1);
  });

  test("returns 404 when product is not found in cart", async () => {
    const token = createTestToken();

    const response = await request(app)
      .patch(`/api/cart/items/${missingProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      "Product not found in cart",
    );
    expect(CartController.UpdateCart).toHaveBeenCalledTimes(1);
  });

  test("returns 200 and calls UpdateCart for valid token, params, and body", async () => {
    const token = createTestToken();

    const response = await request(app)
      .patch(`/api/cart/items/${validProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Cart item updated successfully",
    });

    expect(CartController.UpdateCart).toHaveBeenCalledTimes(1);
    const [req] = CartController.UpdateCart.mock.calls[0];
    expect(req.params.productId).toBe(validProductId);
    expect(req.body.quantity).toBe(3);
  });
});
