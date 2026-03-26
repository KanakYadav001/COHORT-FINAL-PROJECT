const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  price: {
    Amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["USD", "INR"],
      default: "INR",
    }
  },

  saller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  images: [{
    url: String,
    thumnail: String,
    id: String,
  }]

});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
