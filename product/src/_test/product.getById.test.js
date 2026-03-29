// Tests for GET /api/product/:id - getProductById controller

jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
require("../services/imagekit.services");
const { getProductById } = require("../controllers/product.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("GET /api/product/:id - getProductById controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Return 400 when product id is missing", async () => {
    const req = {
      params: {},
    };
    const res = createMockResponse();

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product id is required",
    });
    expect(ProductModel.findById).not.toHaveBeenCalled();
  });

  test("Return 400 when product id is invalid", async () => {
    const req = {
      params: { id: "123" }, // not a valid ObjectId
    };
    const res = createMockResponse();

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid Product id",
    });
    expect(ProductModel.findById).not.toHaveBeenCalled();
  });

  test("Return 404 when product is not found", async () => {
    const validId = "507f1f77bcf86cd799439011"; // looks like a valid ObjectId
    const req = {
      params: { id: validId },
    };
    const res = createMockResponse();

    ProductModel.findById.mockResolvedValue(null);

    await getProductById(req, res);

    expect(ProductModel.findById).toHaveBeenCalledWith(validId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product not found",
    });
  });

  test("Successfully return a product when a valid id is provided", async () => {
    const validId = "507f1f77bcf86cd799439012";
    const req = {
      params: { id: validId },
    };
    const res = createMockResponse();

    const mockProduct = {
      _id: validId,
      title: "Single Product",
      description: "Details of a single product",
      price: { amount: 150, currency: "INR" },
    };

    ProductModel.findById.mockResolvedValue(mockProduct);

    await getProductById(req, res);

    expect(ProductModel.findById).toHaveBeenCalledWith(validId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product Fetch Sucessfully",
      products: mockProduct,
    });
  });
});
