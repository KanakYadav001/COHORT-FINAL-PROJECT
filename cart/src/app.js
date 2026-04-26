const express = require('express');
const CartRouter = require('./routers/cart.routes')
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Cart API is running"
    })
})
app.use('/api/cart',CartRouter)


module.exports = app