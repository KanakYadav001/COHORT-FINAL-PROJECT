const express = require("express");
const cookieParser = require("cookie-parser");
const productRouter = require("./router/product.route");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/product", productRouter);

module.exports = app;
