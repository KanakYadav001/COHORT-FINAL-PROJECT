const {subcribeToQueue} = require('./broker');
const UserModel = require('../models/auth.model');
const ProductModel = require('../models/product.model');
const OrderModel = require('../models/order.model');
const PaymentModel = require('../models/payment.model');
module.exports = function (){
 
    subcribeToQueue('user_created_for_seller', async (data) => {
      
        await UserModel.create(data);
        console.log('User created:',data);
    });

  
    subcribeToQueue('product_created_for_seller', async (data) => {
        await ProductModel.create(data);
        console.log('Product created:', data);
    });


    subcribeToQueue('order_created_for_seller', async (data) => {  
        await OrderModel.create(data);      
        console.log('Order created:', data);
    });

 subcribeToQueue('payment_created_for_seller', async (data) => {
        await PaymentModel.create(data);
        console.log('Payment created:', data);
    });

    subcribeToQueue('payment_updated_for_seller', async (data) => {
        await PaymentModel.findOneAndUpdate({orderId : data.orderId},data);
    })

}