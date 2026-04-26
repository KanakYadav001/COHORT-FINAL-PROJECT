const express = require('express');
const cookieParser = require('cookie-parser');
const OrderRoute = require('./router/order.route');
const app = express()
app.use(express.json());
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Order API is running"
    })
})
app.use('/api', OrderRoute);



module.exports = app;




