const mongoose = require('mongoose');


const CartSchema = new mongoose.Schema({
  
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    item : [{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            required : true
        },
        quantity : {
            type : Number,
            required : true,
            min : 1
        }
  }]



},{timestamps : true})


const cartModel = mongoose.model("cart",CartSchema)


module.exports = cartModel;