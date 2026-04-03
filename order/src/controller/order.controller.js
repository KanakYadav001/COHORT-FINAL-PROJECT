const OrderModel = require("../model/cart.model");

const axios = require("axios");

async function createOrder(req, res) {
  try {
    const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization?.split(" ")[1] || req.cookies?.token}`,
      },
    });

    const GetProducts = await Promise.all(
      cartResponse.data.cart.item.map(async (item) => {
        return (
          await axios.get(
            `http://localhost:3001/api/product/${item.productId}`,
            {
              headers: {
                Authorization: `Bearer ${req.headers.authorization?.split(" ")[1] || req.cookies?.token}`,
              },
            },
          )
        ).data.products;
      }),
    );

    let totalPrice = 0;

    const orderItems = cartResponse.data.cart.item.map((item, index) => {
      const product = GetProducts.find((p) => p._id === item.productId);

      if(item.quantity > product.stock || product.stock === 0){
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}` });
      }

      const itemTotal = product.price.amount * item.quantity;
      totalPrice += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: {
          amount: itemTotal,
          currency: product.price.currency,
        },
      };
    });

    const {address} = req.body;

    if(!address || !address.street || !address.city || !address.state || !address.zipCode || !address.country){
      return res.status(400).json({ success: false, message: "Address is required and must include street, city, state, zipCode, and country" });
    }


    const order = await OrderModel.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: {
        amount: totalPrice,
        currency:"INR",
      },
      status: "PENDING",
      address: address

    });

    res.status(201).json({ message: "Order created successfully", order });


  } catch (err) {

    console.log(err);
    
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


async function getOrderById(req, res) {
  const orderId = req.params.id;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ message : "Order retrieved successfully", order });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

}

async function getAllOrders(req, res) {
  const userId = req.user.id;

  try {
    const orders = await OrderModel.find({ user: userId });

   if(!orders){
    return res.status(404).json({ message: "You have no orders yet" });
   }

    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

}

async function cancelOrder(req, res) {
  const orderId = req.params.id;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    if (order.status === "PAID" || order.status === "SHIPPED") {
      return res.status(400).json({ success: false, message: "Cannot cancel an order that is already paid or shipped" });
    }


    order.status = "CANCELLED";
    await order.save();

    res.status(200).json({message: "Order cancelled successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

}

async function updateOrderAddress(req, res) {

  const orderId = req.params.id;
  const { address } = req.body;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.address = address;
    await order.save();

    res.status(200).json({ message: "Order address updated successfully", order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  cancelOrder,
  updateOrderAddress,
};
