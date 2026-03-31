const express = require('express');
const router = express.Router();
// const OrderController = require('../controller/order.controller');
const authMiddleware = require('../middleware/orderAuth.middleware');




router.post('/create', authMiddleware(['user']));


module.exports = router;