const express = require("express");
const router = express.Router();
const CartAutMiddleWare = require("../middleware/cart.middleware");
const CartValidator = require("../middleware/cart.validator");
const CartController = require("../controller/cart.controller");

router.patch(
  "/items/:productId",
  CartValidator.validateCartItemUpdate,
  CartAutMiddleWare(["user"]),
  CartController.UpdateCart,
);

router.post(
  "/items",
  CartValidator.validateCartItem,
  CartAutMiddleWare(["user"]),
  CartController.cart,
);


router.get('/',CartAutMiddleWare(["user"]),CartController.getCart)

module.exports = router;
