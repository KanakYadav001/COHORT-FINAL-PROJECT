const express = require("express");
const router = express.Router();
const OrderController = require("../controller/order.controller");
const authMiddleware = require("../middleware/orderAuth.middleware");
const {
  validateCreateOrder,
  handleValidationErrors,
} = require("../middleware/orderValidation.middleware");

router.post(
  "/order",
  authMiddleware(["user"]),
  validateCreateOrder,
  handleValidationErrors,
  OrderController.createOrder,
);

module.exports = router;
