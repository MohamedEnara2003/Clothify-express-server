

const express = require('express');
const router = express.Router();
const cartsSchema = require('../models/carts.Schema');
const usersSchema = require('../models/users.Schema');
const productsSchema = require('../models/products.Schema');

const controller = require('../controllers/carts.controller');
const {body , param} = require('express-validator');
const isAuth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')



// Custom Validator

// Cart ID  Validator
const customCartIdValidator = async (id) => {
const cart = await cartsSchema.findOne({_id : id});
if (!cart) {
throw new Error('Cart id is not valid!');
}
return true;
};

// User ID  Validator
const customUserIdValidator = async (userId) => {
const user = await usersSchema.findOne({_id : userId});
if (!user) {
throw new Error('User id is not valid!');
}
return true;
};

// Product ID  Validator
const customProductIdValidator = async (_id) => {
const product = await productsSchema.findOne({_id}).select('_id');
if (!product) {
throw new Error('Product id is not valid!');
}
return true;
};

// Product Size Validator
const customProductSizeValidator = async (size , req) => {
const {productId , quantity} = req.body ;
    const {size : sizeType ,  stock} = size;

    if(quantity > stock) {
    throw new Error('Quantity exceeds stock!')
    }
    
    const product = await productsSchema.findById({_id : productId});
    
    const size_id = size.size_id || size.id ;

    const existingSize = product.sizes.find((size) => 
    size._id.toString() === size_id && size.size === sizeType && size.stock === stock);

    if (!existingSize) {
    throw new Error('Size is not valid!');
    }
    
return true;
};



// Requsets Validator
const cartIdValidator = 
param('cartId')
.notEmpty().withMessage('Cart id is empty!').bail()
.isString().withMessage('Cart id is not string!').bail()
.custom((value) => customCartIdValidator(value));

const userIdValidator = 
body('userId')
.notEmpty().withMessage('User id is empty!').bail()
.isString().withMessage('User id is not string!').bail() 
.custom((value) => customUserIdValidator(value));

const productIdValidator = 
body('productId')
.notEmpty().withMessage('Product id is empty!').bail()
.isString().withMessage('Product id is not string!').bail() 
.custom((value) => customProductIdValidator(value));

const quantityValidator = 
body('quantity')
.notEmpty().withMessage('Quantity id is empty!').bail()
.isNumeric().withMessage('Quantity id is not number!').bail();

const sizeValidator = 
body('size').custom((value , {req}) => customProductSizeValidator(value , req));


router.get( '/user/:userId'  , controller.getUserCarts);
router.get( '/user'  , controller.getCartUserByProductId);

router.post( '/' , [
userIdValidator,
productIdValidator, 
sizeValidator,
quantityValidator
], isAuth,  controller.addToCart);

router.put( '/update-quantity/:cartId' , [
cartIdValidator,
userIdValidator,
sizeValidator,
productIdValidator,
quantityValidator 
] , controller.updateQuantity);

router.put( '/update-size/:cartId' , [
cartIdValidator,
userIdValidator,
productIdValidator,
sizeValidator,
] , controller.updateSize);

router.delete( '/delete-product' , controller.deleteProductFromCart);

module.exports = router;