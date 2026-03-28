
const ProductModel = require("../models/product.model");
const uploadImage = require("../services/imagekit.services");



async function createProduct(req, res) {
  try {
    const { title, description, amount, currency } = req.body;
    
 const files = req.files;   

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "File 'images' is required" });
    }

    const seller = req.user.id;


    if (!title || !amount || !currency) {
      return res.status(400).json({ message: "Title, amount, and currency are required" });
    }

    const NumAmount = Number(amount);

    // Upload image first
    const imagesUploaded = await Promise.all(files.map(file => uploadImage.UploadImage(file)));

    // Create product with uploaded image
    const product = await ProductModel.create({
      title,
      description,
      price: { amount: NumAmount, currency },
      seller: seller,
      images: imagesUploaded
    });

    res.status(201).json({ message: "Product created successfully", product, imagesUploaded });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
}

module.exports = {
  createProduct,
};
