// Tests for POST /api/product - createProduct controller

// Mock dependencies BEFORE requiring the controller so that
// Jest never loads the real imagekit service (which depends on ESM uuid).
jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
const uploadImage = require("../services/imagekit.services");
const { createProduct } = require("../controllers/product.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("POST /api/product - createProduct controller", () => {
  const sellerId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Successfully create a product with valid data and images", async () => {
    const req = {
      body: {
        title: "Test Product",
        description: "A test product",
        amount: "100",
        currency: "INR",
      },
      files: [
        {
          buffer: Buffer.from("fake image data"),
        },
      ],
      user: { id: sellerId },
    };

    const res = createMockResponse();

    const mockImageResponse = {
      url: "https://ik.imagekit.io/test/image1.jpg",
      thumbnail: "https://ik.imagekit.io/test/tr:w-100/image1.jpg",
      id: "img_123",
    };

    uploadImage.UploadImage.mockResolvedValue(mockImageResponse);

    const mockProduct = {
      _id: "507f1f77bcf86cd799439012",
      title: "Test Product",
      description: "A test product",
      price: {
        amount: 100,
        currency: "INR",
      },
      seller: sellerId,
      images: [mockImageResponse],
      __v: 0,
    };

    ProductModel.create.mockResolvedValue(mockProduct);

    await createProduct(req, res);

    expect(uploadImage.UploadImage).toHaveBeenCalledTimes(1);
    expect(ProductModel.create).toHaveBeenCalledWith({
      title: "Test Product",
      description: "A test product",
      price: {
        amount: 100,
        currency: "INR",
      },
      seller: sellerId,
      images: [mockImageResponse],
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product created successfully",
      product: mockProduct,
      imagesUploaded: [mockImageResponse],
    });
  });

  test("Return 400 error when images are not provided", async () => {
    const req = {
      body: {
        title: "Test Product",
        description: "A test product",
        amount: "100",
        currency: "INR",
      },
      files: [],
      user: { id: sellerId },
    };

    const res = createMockResponse();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "File 'images' is required",
    });
    expect(ProductModel.create).not.toHaveBeenCalled();
  });

  test("Return 400 error when required fields are missing", async () => {
    const req = {
      body: {
        // Missing amount and currency
        title: "Test Product",
        description: "A test product",
      },
      files: [
        {
          buffer: Buffer.from("fake image data"),
        },
      ],
      user: { id: sellerId },
    };

    const res = createMockResponse();

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Title, amount, and currency are required",
    });
    expect(ProductModel.create).not.toHaveBeenCalled();
  });
});
