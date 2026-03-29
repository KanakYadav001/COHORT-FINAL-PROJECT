const express = require('express');
const ProductController = require('../controllers/product.controller');
const middleware = require('../middleware/product.middleware');
const multer = require('multer');
const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.post('/',upload.any([{ name: 'images', maxCount: 5 }]), middleware.checkRole(['seller','user']),ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.patch('/:id',middleware.checkRole(['seller']), ProductController.updateProduct);
router.delete('/:id',middleware.checkRole(['seller']) , ProductController.deleteProduct);
router.get('/show', ProductController.showProducts);

router.get('/:id',ProductController.getProductById);
module.exports = router;