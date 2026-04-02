const cartModel = require("../models/cart.model");
const mongoose = require("mongoose");


async function createCart(req, res) {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const qty = Number(quantity);

    if (!productId || !qty || qty < 1) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    let cartItem = await cartModel.findOne({ user: userId });

    if (!cartItem) {
      cartItem = new cartModel({
        user: userId,
        item: [],
      });
    }

    const existingItemIndex = cartItem.item.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      cartItem.item[existingItemIndex].quantity += qty;
    } else {
      cartItem.item.push({ productId, quantity: qty });
    }

    await cartItem.save();
    return res
      .status(200)
      .json({ message: "Cart item added successfully", cart: cartItem });
  } catch (error) {return res.status(500).json({ message: "Internal server error" });
  }
}
async function UpdateCart(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const qty = Number(quantity);

    if (!productId || !qty || qty < 1) {
      return res.status(400).json({
        message:
          "productId and quantity are required and quantity must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    let cartItem = await cartModel.findOne({ user: userId });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingItem = cartItem.item.find(
      (item) => item.productId.toString() === productId,
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    existingItem.quantity = qty;
    await cartItem.save();

    res.status(200).json({ message: "Cart item updated successfully" });
  } catch (error) {
   return res.status(500).json({ message: "Internal server error" });
  }
}

async function getCart(req, res) {
  try {
    const userId = req.user.id;

    let cartItem = await cartModel
      .findOne({ user: userId });

    if (!cartItem) {
     cartItem = new cartModel({
        user: userId,
        item: [],
      });
      await cartItem.save();
    }


    return res.status(200).json({
      message: "Cart retrieved successfully",
      cart: cartItem,
    });
  } catch (error) {
    console.log(error.message);
    
    return res.status(500).json({ message: "Internal server error" });
  }
}
async function deleteCartItem(req, res) {
  try {
    const userId = req.user.id;
    const {Id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return res.status(400).json({ message: "Invalid Cart Id" });
    }

    const cartItem = await cartModel.findOneAndDelete({ _id: Id, user: userId });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ message: "Cart item deleted successfully" });


  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function clearCart(req, res) {
  try {
    const userId = req.user.id;

    const cartItem = await cartModel.findOne({ user: userId });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cartItem.item = [];
    await cartItem.save();

    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createCart,
  UpdateCart,
  getCart,
  clearCart,
  deleteCartItem,
};
