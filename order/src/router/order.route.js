const express = require('express');
const router = express.Router();
const OrderController = require('../controller/order.controller');
const authMiddleware = require('../middleware/orderAuth.middleware');




router.post('/order', authMiddleware(['user']), OrderController.createOrder);


module.exports = router;