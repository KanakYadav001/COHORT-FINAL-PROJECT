const express = require('express');
const ProductController = require('../controllers/product.controller');
const middlware = require('../middleware/product.middleware');
const multer = require('multer');
const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.post('/',upload.single('image'), middlware.checkRole(['seller','user']),ProductController.createProduct);

module.exports = router;