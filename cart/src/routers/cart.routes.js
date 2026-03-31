const express = require("express");
const router = express.Router();
const CartAutMiddleWare = require("../middleware/cart.middleware");
const CartValidator = require("../middleware/cart.validator");
const CartController = require("../controller/cart.controller");

router.post(
  "/items",
  CartValidator.validateCartItem,
  CartAutMiddleWare(["user"]),
  CartController.cart,
);

module.exports = router;
