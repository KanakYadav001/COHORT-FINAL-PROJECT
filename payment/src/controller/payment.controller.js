const paymentModel = require("../model/payment.model");
const axios = require("axios");
const { publishToQueue } = require("../broker/broker");
require("dotenv").config();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  const user = req.user.id;
  const { id } = req.params;

  try {
    const order = await axios.get(`http://localhost:3003/api/order/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const totalAmount = order.data.order.totalAmount;

    const payment = await razorpay.orders.create(totalAmount);

    const newPayment = await paymentModel.create({
      order: id,
      orderId: payment.id,
      paymentId: payment.id,
      status: "pending",
      signature: payment.signature,
      user: user,
      price: {
        amount: totalAmount.amount,
        currency: totalAmount.currency,
      },
    });

    publishToQueue("payment_created_for_seller", newPayment);

    res
      .status(201)
      .json({ message: "Payment created successfully", payment: newPayment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function verifyPayment(req, res) {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;

  const {
    validatePaymentVerification,
  } = require("../../node_modules/razorpay/dist/utils/razorpay-utils.js");

  try {
    const isValid = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      signature,
      secret,
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await paymentModel.findOne({
      orderId: razorpayOrderId,
      status: "pending",
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.paymentId = razorpayPaymentId;
    payment.signature = signature;
    payment.status = "COMPLETED";
    await payment.save();

  
    
  await Promise.all([
    publishToQueue("payment_success_notification.user", {
      userId: payment.user,
      price: payment.price,
      rozopayOrderId: razorpayOrderId,
      rozopayPaymentId: razorpayPaymentId,
    }),
   
    publishToQueue("payment_updated_for_seller",payment)

  ]);

    res.json({ message: "Payment verified successfully" });
  } catch (error) {

    publishToQueue("payment_failed_notification.user", {
      signature : signature,
      rozopayOrderId: razorpayOrderId,
      rozopayPaymentId: razorpayPaymentId,
    });

    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};
