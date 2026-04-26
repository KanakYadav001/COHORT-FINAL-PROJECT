const userModel = require("../models/auth.model");
const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const paymentModel = require("../models/payment.model");

async function getMetrics(req, res) {
  try {
    const sellerId = req?.user?._id || req?.query?.sellerId;

    const productFilter = sellerId ? { seller: sellerId } : {};
    const products = await productModel.find(productFilter).select("_id title");
    const productIds = products.map((product) => product._id);

    const orderMatch = { status: { $ne: "CANCELLED" } };
    if (sellerId) {
      orderMatch["items.productId"] = { $in: productIds };
    }

    const [salesResult, revenueResult, topProductResult] = await Promise.all([
      orderModel.aggregate([{ $match: orderMatch }, { $count: "totalSales" }]),
      orderModel.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount.amount" },
          },
        },
      ]),
      orderModel.aggregate([
        { $match: orderMatch },
        { $unwind: "$items" },
        ...(sellerId
          ? [{ $match: { "items.productId": { $in: productIds } } }]
          : []),
        {
          $group: {
            _id: "$items.productId",
            unitsSold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price.amount"] },
            },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const productsById = new Map(
      products.map((product) => [String(product._id), product.title]),
    );
    const topProduct = topProductResult[0]
      ? {
          id: topProductResult[0]._id,
          title:
            productsById.get(String(topProductResult[0]._id)) ||
            "Unknown Product",
          unitsSold: topProductResult[0].unitsSold,
          revenue: topProductResult[0].revenue,
        }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        sales: salesResult[0]?.totalSales || 0,
        revenue: revenueResult[0]?.totalRevenue || 0,
        topProduct,
      },
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch metrics",
    });
  }
}

async function getOrders(req, res) {
  try {
    const sellerId = req?.user?._id || req?.query?.sellerId;
    const page = Math.max(Number(req?.query?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req?.query?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const status = req?.query?.status;

    const productFilter = sellerId ? { seller: sellerId } : {};
    const products = await productModel.find(productFilter).select("_id");
    const productIds = products.map((product) => product._id);

    const orderFilter = {};
    if (status) {
      orderFilter.status = String(status).toUpperCase();
    }
    if (sellerId) {
      orderFilter["items.productId"] = { $in: productIds };
    }

    const [orders, total] = await Promise.all([
      orderModel
        .find(orderFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      orderModel.countDocuments(orderFilter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}

async function getProducts(req, res) {
  try {
    const sellerId = req?.user?._id || req?.query?.sellerId;
    const page = Math.max(Number(req?.query?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req?.query?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = req?.query?.search ? String(req.query.search).trim() : "";

    const productFilter = {};
    if (sellerId) {
      productFilter.seller = sellerId;
    }
    if (search) {
      productFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      productModel
        .find(productFilter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      productModel.countDocuments(productFilter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

module.exports = {
  getMetrics,
  getOrders,
  getProducts,
};
