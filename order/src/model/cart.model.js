const mongoose = require('mongoose');

const addressScema = new mongoose.Schema({
    
      street : String,
      zipCode : String,
      country  : String,
      city : String,
      state : String,
      isDefault :{type : Boolean, default: false}
    
})


const OrderSchema = new mongoose.Schema({
  
    user : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
    },
    items : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                required : true,
            },
            quantity : {
                type : Number,
                default : 1,
                min : 1,
            },
            price : {
                amount : {
                    type : Number,
                    required : true
                },
                currency : {
                    type : String,
                    enum : ['USD','INR'],
                    required : true
                }
            }
        }   

    ],
    status : {
        type : String,
        enum : ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default : 'PENDING',
    },
    totalAmount : {
        amount : {
            type : Number,
            required : true
        },
        currency : {    
            type : String,
            enum : ['USD','INR'],
            required : true
        }
    },
    address : addressScema,

}, {timestamps : true});



const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;