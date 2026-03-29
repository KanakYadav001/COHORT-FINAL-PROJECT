// Unit tests for POST /api/product and GET /api/product via controllers

// Mock dependencies BEFORE requiring the controller so that
// Jest never loads the real imagekit service (which depends on ESM uuid).
jest.mock("../models/product.model");
jest.mock("../services/imagekit.services", () => ({
  UploadImage: jest.fn(),
}));

const ProductModel = require("../models/product.model");
const uploadImage = require("../services/imagekit.services");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} = require("../controllers/product.controller");

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
