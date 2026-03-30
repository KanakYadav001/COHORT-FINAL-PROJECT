const mongoose = require('mongoose');


const CartScema = new mongoose.Schema({
  
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    }



})