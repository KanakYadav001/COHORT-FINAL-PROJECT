const OrderModel = require("../model/cart.model");

const axios = require("axios");

async function createOrder(req, res) {
  try {
    const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization?.split(" ")[1] || req.cookies?.token}`,
      },
    });

    console.log(cartResponse);
    
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  createOrder,
};
