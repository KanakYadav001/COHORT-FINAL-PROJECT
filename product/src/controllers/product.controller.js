const mongoose = require("mongoose");
const ProductModel = require("../models/product.model");

async function createProduct(req, res) {
  const {
    name,
    description,
    price: { amount, currency },
    images,
  } = req.body;


  const seller = req.user.id;

  if (!name || !description || !price || !images) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  


  res.status(201).json({ message: "Product created successfully" });
}



module.exports = {
  createProduct,
};