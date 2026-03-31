const mongoose  = require("mongoose");
const cartModel = require("../models/cart.model");

async function cart(req, res) {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if(!productId || !quantity){
        return res.status(400).json({message : "productId and quantity are required"})
    }
    if(!mongoose.Types.ObjectId.isValid(productId)){
        return res.status(400).json({message : "Invalid productId"})
    }

    let cartItem = await cartModel.findOne({ user: userId });

    if(!cartItem){
        cartItem = new cartModel({
            user : userId,
            item : {}
        });
    }

    const existingItemIndex = cartItem.item.findIndex(item => item.productId.toString() === productId);

    if(existingItemIndex >= 0){
        cartItem.item[existingItemIndex].quantity += quantity;
    } else {
        cartItem.item.push({ productId, quantity });
    }

    await cartItem.save();
    return res.status(200).json({ message: "Cart item added successfully", cart: cartItem });
}

module.exports = {
	cart,
};