// Tests for DELETE /api/product/:id - deleteProduct controller

jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
require("../services/imagekit.services");
const { deleteProduct } = require("../controllers/product.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("DELETE /api/product/:id - deleteProduct controller", () => {
  const sellerId = "507f1f77bcf86cd799439020";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Successfully delete a product when user is the seller", async () => {
    const productId = "507f1f77bcf86cd799439021";

    const req = {
      params: { id: productId },
      user: { id: sellerId },
    };

    const res = createMockResponse();

    const mockProduct = {
      _id: productId,
      seller: sellerId,
    };

    ProductModel.findOne.mockResolvedValue(mockProduct);
    ProductModel.findOneAndDelete = jest.fn().mockResolvedValue(mockProduct);

    await deleteProduct(req, res);

    expect(ProductModel.findOne).toHaveBeenCalledWith({
      _id: productId,
      seller: sellerId,
    });
    expect(ProductModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: productId,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product deleted successfully",
      product: mockProduct,
    });
  });

  test("Return 404 when product to delete is not found", async () => {
    const productId = "507f1f77bcf86cd799439022";

    const req = {
      params: { id: productId },
      user: { id: sellerId },
    };

    const res = createMockResponse();

    ProductModel.findOne.mockResolvedValue(null);

    await deleteProduct(req, res);

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
    const productId = "507f1f77bcf86cd799439023";

    const req = {
      params: { id: productId },
      user: { id: sellerId },
    };

    const res = createMockResponse();

    const mockProduct = {
      _id: productId,
      seller: "507f1f77bcf86cd799439099", // different seller
    };

    ProductModel.findOne.mockResolvedValue(mockProduct);

    await deleteProduct(req, res);

    expect(ProductModel.findOne).toHaveBeenCalledWith({
      _id: productId,
      seller: sellerId,
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forbidden  : You are not the seller of this product",
    });
  });
});
