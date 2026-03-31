const mongoose = require('mongoose');


const CartScema = new mongoose.Schema({
  
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


const cardModel = mongoose.model("cart",CartScema)


module.exports = cardModel;