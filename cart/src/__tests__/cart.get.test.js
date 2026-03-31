const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock the cart controller so we don't hit the real DB logic
jest.mock("../controller/cart.controller", () => {
  return {
    cart: jest.fn((req, res) =>
      res.status(500).json({ message: "POST handler not used in GET tests" }),
    ),
    UpdateCart: jest.fn((req, res) =>
      res.status(500).json({ message: "PATCH handler not used in GET tests" }),
    ),
    getCart: jest.fn((req, res) => {
      const userId = req.user && (req.user._id || req.user.id);

      if (userId === "no-cart") {
        return res.status(404).json({ message: "Cart not found" });
      }

      return res.status(200).json({
        message: "Cart retrieved successfully",
        cart: {
          user: userId,
          item: [],
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

describe("GET /api/cart", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when no Authorization token is provided", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized");
    expect(CartController.getCart).not.toHaveBeenCalled();
  });

  test("returns 404 when cart is not found", async () => {
    const token = createTestToken({ id: "no-cart" });

    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Cart not found");
    expect(CartController.getCart).toHaveBeenCalledTimes(1);
  });

  test("returns 200 and cart data when cart exists", async () => {
    const token = createTestToken();

    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Cart retrieved successfully",
      cart: {
        user: expect.any(String),
        item: [],
      },
    });

    expect(CartController.getCart).toHaveBeenCalledTimes(1);
  });
});
