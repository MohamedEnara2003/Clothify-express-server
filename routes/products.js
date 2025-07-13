const express = require('express');
const router = express.Router();

const {param} = require('express-validator');
const productsSchema = require('../models/products.Schema')
const controller = require('../controllers/products.controller')

// Middlewares
const {imagesToPublicFolder} = require('../middlewares/imagesToPublicFolder')
const isAuth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')

const customExistingProductId = async (_id) => {
    const existingProduct = await productsSchema.findOne({_id});
    if (!existingProduct) {
    throw new Error('No product found with this ID!');
    }
    return true;
};

const productIdValidator =  [
param('id')
.notEmpty().withMessage('Product id is empty!').bail() 
.isString().withMessage('Product id is not string!').bail() 
.custom((value) => customExistingProductId(value))
];


router.get('/' ,  controller.getAllProducts);

router.get('/:id/related' ,  controller.getRelatedProduct);
router.get('/:id' ,  controller.getProductById);

router.post('/' ,isAuth ,isAdmin , imagesToPublicFolder , controller.createProduct);
router.put('/:id',isAuth ,isAdmin , productIdValidator ,controller.updateProduct);
router.delete('/:id' , isAuth ,isAdmin ,productIdValidator , controller.deleteProduct);

module.exports = router;
