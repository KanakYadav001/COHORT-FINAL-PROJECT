const express = require("express");
const cookieParser = require("cookie-parser");
const productRouter = require("./router/product.route");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Product API is running"
    })
})

app.use("/api/product", productRouter);

module.exports = app;
