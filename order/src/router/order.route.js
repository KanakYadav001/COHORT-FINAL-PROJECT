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



router.get('/order/:id', authMiddleware(["user"]), OrderController.getOrderById);

router.get('/orders/me', authMiddleware(["user"]), OrderController.getAllOrders);

router.post('/order/:id/cancel', authMiddleware(["user"]), OrderController.cancelOrder);

router.patch('/order/:id/address', authMiddleware(["user"]), OrderController.updateOrderAddress);

module.exports = router;
