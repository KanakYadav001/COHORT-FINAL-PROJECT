const express = require('express');
const cookieParser = require('cookie-parser');
const OrderRoute = require('./router/order.route');
const app = express()
app.use(express.json());
app.use(cookieParser());



app.use('/api/order', OrderRoute);



module.exports = app;




