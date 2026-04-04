const paymentModel = require('../model/payment.model');
const axios = require('axios');

async function createPayment(req, res) {
   const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    const { id } = req.params;

    
    try {

        const order = await axios.get(`http://localhost:3003/api/order/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });


        console.log(order.data.order);
        

    }catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

async function verifyPayment(req, res) {

}


module.exports = {
    createPayment,
    verifyPayment
}