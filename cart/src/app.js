const express = require('express');
const CartRouter = require('./routers/cart.routes')
const app = express();

app.use(express.json());


app.use('/api',CartRouter)


module.exports = app