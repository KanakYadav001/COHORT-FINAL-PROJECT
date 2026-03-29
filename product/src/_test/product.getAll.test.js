// Tests for GET /api/product - getAllProducts controller

jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
require("../services/imagekit.services");
const { getAllProducts } = require("../controllers/product.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("GET /api/product - getAllProducts controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Return all products with default pagination and no filters", async () => {
    const req = {
      query: {},
    };
    const res = createMockResponse();

    const mockProducts = [
      {
        _id: "1",
        title: "Product A",
        price: { amount: 100, currency: "INR" },
      },
      {
        _id: "2",
        title: "Product B",
        price: { amount: 200, currency: "INR" },
      },
    ];

    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(mockProducts);
    ProductModel.find.mockReturnValue({
      skip: skipMock,
      limit: limitMock,
    });

    await getAllProducts(req, res);

    expect(ProductModel.find).toHaveBeenCalledWith({});
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product Fetch Sucessfully",
      product: mockProducts,
    });
  });

  test("Apply text search and minPrice/maxPrice filters", async () => {
    const req = {
      query: {
        q: "phone",
        minPrice: "100",
        maxPrice: "500",
        skip: "5",
        limit: "20",
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

    await getAllProducts(req, res);

    expect(ProductModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $text: { $search: "phone" },
        "price.amount": { $gte: 100 },
        "price.amount.amount": expect.objectContaining({ $lte: 500 }),
      }),
    );
    expect(skipMock).toHaveBeenCalledWith(5);
    expect(limitMock).toHaveBeenCalledWith(20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product Fetch Sucessfully",
      product: mockProducts,
    });
  });

  test("Handle case when no products are found", async () => {
    const req = {
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

    await getAllProducts(req, res);

    expect(ProductModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product Fetch Sucessfully",
      product: mockProducts,
    });
  });
});
