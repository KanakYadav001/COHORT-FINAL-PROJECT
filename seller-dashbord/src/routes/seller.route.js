const express = require("express");

const app = express();
const {getMetrics,getOrders, getProducts,} = require("./controllers/seller.controller");

const AuthMiddleware = require("./middleware/auth.middleware");

app.use(express.json());

app.get("/metrics", AuthMiddleware['seller'], getMetrics);
app.get("/orders", AuthMiddleware['seller'], getOrders);
app.get("/products", AuthMiddleware['seller'], getProducts);

module.exports = app;
