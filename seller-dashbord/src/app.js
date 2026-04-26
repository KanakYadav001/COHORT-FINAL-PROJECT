const express = require('express');

const app = express();
const SellerRouter = require('./routes/seller.route');


app.get('/', (req, res) => {
    res.send('Seller Dashboard Service is running');
});


app.get('/seller/dashboard/', SellerRouter);

module.exports = app;