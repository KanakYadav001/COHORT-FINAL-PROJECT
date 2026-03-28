const express = require('express');
const ProductController = require('../controllers/product.controller');
const middleware = require('../middleware/product.middleware');
const multer = require('multer');
const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.post('/',upload.any([{ name: 'images', maxCount: 5 }]), middleware.checkRole(['seller','user']),ProductController.createProduct);

module.exports = router;