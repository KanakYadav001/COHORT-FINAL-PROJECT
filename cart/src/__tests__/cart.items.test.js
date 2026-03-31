const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

// Ensure JWT secret exists for tests
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "test-secret-key";

function createTestToken(payload = {}) {
  const basePayload = {
    id: "507f1f77bcf86cd799439011",
    role: "user",
  };

  return jwt.sign({ ...basePayload, ...payload }, process.env.JWT_SECRET_KEY);
}

describe("POST /api/cart/items", () => {
  test("returns 400 when productId is missing", async () => {
    const token = createTestToken();

    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        quantity: 1,
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    const productIdError = response.body.errors.find(
      (e) => e.path === "productId" || e.param === "productId",
    );
    expect(productIdError).toBeDefined();
  });

  test("returns 400 when quantity is less than 1", async () => {
    const token = createTestToken();

    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: "507f1f77bcf86cd799439012",
        quantity: 0,
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    const quantityError = response.body.errors.find(
      (e) => e.path === "quantity" || e.param === "quantity",
    );
    expect(quantityError).toBeDefined();
  });

  test("returns 401 when no Authorization token is provided and body is valid", async () => {
    const response = await request(app).post("/api/cart/items").send({
      productId: "507f1f77bcf86cd799439013",
      quantity: 1,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized");
  });
});
