const express = require('express');
const router = express.Router();
const PaymentAuthMiddleware = require('../middleware/paymentAuth.middleware');
const PaymentController = require('../controller/payment.controller');

router.post('/create/:id', PaymentAuthMiddleware(["user"]), PaymentController.createPayment);
router.post('/verify', PaymentAuthMiddleware(["user"]), PaymentController.verifyPayment);

module.exports = router;