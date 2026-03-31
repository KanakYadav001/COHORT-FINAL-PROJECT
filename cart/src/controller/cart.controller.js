const cartModel = require("../models/cart.model");

async function cart(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

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
}
async function UpdateCart(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  const qty = Number(quantity);

  if (!productId || !qty || qty < 1) {
    return res
      .status(400)
      .json({
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
}

async function getCart(req, res) {
    try{
  const userId = req.user._id;

  const cartItem = await cartModel.findOne({ user: userId }).populate("item.productId");

  if (!cartItem) {
    return res.status(404).json({ message: "Cart not found" });
  }
  return res.status(200).json({
    message: "Cart retrieved successfully",
    cart: cartItem,
  });
} catch (error) {
    return res.status(404).json({ message: "Cart not found" });
  }
}


module.exports = {
  cart,
  UpdateCart,
  getCart
};
