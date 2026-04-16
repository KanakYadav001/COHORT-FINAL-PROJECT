const { default: mongoose } = require("mongoose");
const ProductModel = require("../models/product.model");
const uploadImage = require("../services/imagekit.services");

async function createProduct(req, res) {
  try {
    const { title, description, amount, currency ,stock} = req.body;

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "File 'images' is required" });
    }

    const seller = req.user.id;

    if (!title || !amount || !currency) {
      return res
        .status(400)
        .json({ message: "Title, amount, and currency are required" });
    }

    const NumAmount = Number(amount);

    // Upload image first
    const imagesUploaded = await Promise.all(
      files.map((file) => uploadImage.UploadImage(file)),
    );

    // Create product with uploaded image
    const product = await ProductModel.create({
      title,
      description,
      price: { amount: NumAmount, currency },
      seller: seller,
      images: imagesUploaded,
      stock: Number(stock),
    });

    res
      .status(201)
      .json({
        message: "Product created successfully",
        product,
        imagesUploaded,
      });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
}

async function getAllProducts(req, res) {
  try {
    const { q, minPrice, maxPrice, skip = 0, limit = 20 } = req.query;

    const filter = {};

    if (q && typeof q === 'string' && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice && !isNaN(minPrice) && Number(minPrice) >= 0) {
        filter['price.amount'].$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) >= 0) {
        filter['price.amount'].$lte = Number(maxPrice);
      }
    }

    const skipNum = Math.max(0, Number(skip));
    const limitNum = Math.min(Math.max(1, Number(limit)), 20);

    const product = await ProductModel.find(filter)
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      message: "Product Fetched Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product id is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product id" });
  }

  const products = await ProductModel.findById(id);

  if (!products) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({
    message: "Product Fetch Sucessfully",
    products,
  });
}

async function updateProduct(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product id" });
  }

  const product = await ProductModel.findOne({
    _id: id,
    seller: req.user.id,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden  : You are not the seller of this product" });
  }

  const allowedFields = ["title", "description", "price", "stock"];

  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      if (key === "price" && typeof req.body.price === "object") {
        if (req.body.price.amount !== undefined) {
          product.price.amount = req.body.price.amount || product.price.amount;
        }
        if (req.body.price.currency !== undefined) {
          product.price.currency =
            req.body.price.currency || product.price.currency;
        }
      } else {
        product[key] = req.body[key];
      }
    }
  }
  await product.save();


  res.status(200).json({
    message: "Product updated successfully",
    product,
  });
}

async function deleteProduct(req, res) {
  const { id } = req.params;



  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product id" });
  }



  const product = await ProductModel.findOne({
    _id: id,
    seller: req.user.id,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }


  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden  : You are not the seller of this product" });
  }

 const deletedProduct = await ProductModel.findOneAndDelete({ _id: id });


 


  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct,
  });


}


async function showProducts(req, res) {
  
  const seller = req.user.id

  console.log(seller);
  
  const { skip = 0, limit = 20 } = req.query;

  const products = await ProductModel.find({ seller })
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 20));

  
  res.status(200).json({
    message: "Products fetched successfully",
    products,
  });

}


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  showProducts
};
