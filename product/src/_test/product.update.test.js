// Tests for PATCH /api/product/:id - updateProduct controller

jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
require("../services/imagekit.services");
const { updateProduct } = require("../controllers/product.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("PATCH /api/product/:id - updateProduct controller", () => {
  const sellerId = "507f1f77bcf86cd799439010";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Successfully update a product's title and price", async () => {
    const productId = "507f1f77bcf86cd799439011";

    const req = {
      params: { id: productId },
      body: {
        title: "Updated Product Title",
        price: { amount: 200, currency: "USD" },
      },
      user: { id: sellerId },
    };

    const res = createMockResponse();

    const mockProduct = {
      _id: productId,
      title: "Old Product Title",
      description: "Old description",
      price: { amount: 100, currency: "INR" },
      seller: sellerId,
      save: jest.fn().mockResolvedValue(true),
    };

    ProductModel.findOne.mockResolvedValue(mockProduct);

    await updateProduct(req, res);

    expect(ProductModel.findOne).toHaveBeenCalledWith({
      _id: productId,
      seller: sellerId,
    });

    expect(mockProduct.title).toBe("Updated Product Title");
    expect(mockProduct.price).toEqual({ amount: 200, currency: "USD" });
    expect(mockProduct.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product updated successfully",
      product: mockProduct,
    });
  });

  test("Return 404 when product to update is not found", async () => {
    const productId = "507f1f77bcf86cd799439012";

    const req = {
      params: { id: productId },
      body: {
        title: "Non-existent Product",
      },
      user: { id: sellerId },
    };

    const res = createMockResponse();

    ProductModel.findOne.mockResolvedValue(null);

    await updateProduct(req, res);

    expect(ProductModel.findOne).toHaveBeenCalledWith({
      _id: productId,
      seller: sellerId,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product not found",
    });
  });

  test("Return 403 when authenticated user is not the seller", async () => {
    const productId = "507f1f77bcf86cd799439013";

    const req = {
      params: { id: productId },
      body: {
        title: "Updated Title",
      },
      user: { id: sellerId },
    };

    const res = createMockResponse();

    const mockProduct = {
      _id: productId,
      title: "Old Title",
      description: "Old description",
      price: { amount: 100, currency: "INR" },
      // Different seller than the authenticated user
      seller: "507f1f77bcf86cd799439099",
      save: jest.fn().mockResolvedValue(true),
    };

    ProductModel.findOne.mockResolvedValue(mockProduct);

    await updateProduct(req, res);

    expect(ProductModel.findOne).toHaveBeenCalledWith({
      _id: productId,
      seller: sellerId,
    });
    expect(mockProduct.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forbidden  : You are not the seller of this product",
    });
  });
});
