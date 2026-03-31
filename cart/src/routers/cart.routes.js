const express = require("express");
const router = express.Router();
const CartAutMiddleWare = require('../middleware/cart.middleware')
const CartController = require('../controller/cart.controller')



router.post('/items',CartAutMiddleWare(['user']), CartController.cart)



module.exports = router;