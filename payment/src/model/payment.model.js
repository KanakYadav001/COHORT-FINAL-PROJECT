const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
  },
  signature: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const paymentModel = mongoose.model("Payment", PaymentSchema);

module.exports = paymentModel;
