const request = require("supertest");
const app = require("../app");
jest.mock("../models/product.model");
const ProductModel = require("../models/product.model");

describe("Product API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Create product successfully
  describe("POST /api/products - Create Product", () => {
    test("should create a product successfully with valid data", async () => {
      const newProduct = {
        name: "Test Product",
        description: "Test Description",
        price: {
          Amount: 100,
          currency: "INR",
        },
        saller: "507f1f77bcf86cd799439011",
      };

      const mockCreatedProduct = {
        _id: "507f1f77bcf86cd799439012",
        ...newProduct,
        save: jest.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439012",
          ...newProduct,
        }),
      };

      ProductModel.prototype.save = jest
        .fn()
        .mockResolvedValue(mockCreatedProduct);

      const response = await request(app)
        .post("/api/products")
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Product created successfully");
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.name).toBe("Test Product");
    });
  });

  // Test Case 2: Get all products
  describe("GET /api/products - Get All Products", () => {
    test("should retrieve all products successfully", async () => {
      const mockProducts = [
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Product 1",
          price: { Amount: 100, currency: "INR" },
        },
        {
          _id: "507f1f77bcf86cd799439012",
          name: "Product 2",
          price: { Amount: 200, currency: "INR" },
        },
      ];

      ProductModel.find = jest.fn().mockResolvedValue(mockProducts);

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe("Product 1");
      expect(response.body.data[1].name).toBe("Product 2");
    });
  });

  // Test Case 3: Handle validation error when creating product
  describe("POST /api/products - Validation Error", () => {
    test("should return 400 error when required fields are missing", async () => {
      const invalidProduct = {
        name: "Test Product",
        // Missing required fields: price and saller
      };

      const response = await request(app)
        .post("/api/products")
        .send(invalidProduct);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("required");
    });
  });
});
