// Tests for GET /api/product/show - showProducts controller

jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
require("../services/imagekit.services");
const { showProducts } = require("../controllers/product.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("GET /api/product/show - showProducts controller", () => {
  const sellerId = "507f1f77bcf86cd799439030";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Return seller products with default pagination", async () => {
    const req = {
      user: { id: sellerId },
      query: {},
    };

    const res = createMockResponse();

    const mockProducts = [
      {
        _id: "1",
        title: "Seller Product A",
        price: { amount: 100, currency: "INR" },
        seller: sellerId,
      },
      {
        _id: "2",
        title: "Seller Product B",
        price: { amount: 200, currency: "INR" },
        seller: sellerId,
      },
    ];

    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(mockProducts);
    ProductModel.find.mockReturnValue({
      skip: skipMock,
      limit: limitMock,
    });

    await showProducts(req, res);

    expect(ProductModel.find).toHaveBeenCalledWith({ seller: sellerId });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Products fetched successfully",
      products: mockProducts,
    });
  });

  test("Apply skip and limit pagination for seller products", async () => {
    const req = {
      user: { id: sellerId },
      query: {
        skip: "5",
        limit: "10",
      },
    };

    const res = createMockResponse();

    const mockProducts = [];

    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(mockProducts);
    ProductModel.find.mockReturnValue({
      skip: skipMock,
      limit: limitMock,
    });

    await showProducts(req, res);

    expect(ProductModel.find).toHaveBeenCalledWith({ seller: sellerId });
    expect(skipMock).toHaveBeenCalledWith(5);
    expect(limitMock).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Products fetched successfully",
      products: mockProducts,
    });
  });

  test("Handle case when seller has no products", async () => {
    const req = {
      user: { id: sellerId },
      query: {},
    };

    const res = createMockResponse();

    const mockProducts = [];

    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(mockProducts);
    ProductModel.find.mockReturnValue({
      skip: skipMock,
      limit: limitMock,
    });

    await showProducts(req, res);

    expect(ProductModel.find).toHaveBeenCalledWith({ seller: sellerId });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Products fetched successfully",
      products: mockProducts,
    });
  });
});
