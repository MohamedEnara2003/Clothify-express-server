const {body , param} = require('express-validator');
const cartsSchema = require('../../models/carts.Schema');
const productsSchema = require('../../models/products.Schema');


// Cart ID  Validator
const customCartIdValidator = async (id) => {
const cart = await cartsSchema.findOne({_id : id});
if (!cart) throw new Error('Cart id is not valid!');
return true;
};

const customExistingUsercartValidator = async (userId) => {
const userCart = await cartsSchema.findOne({userId});
if (!userCart) throw new Error('User Cart is empty!');
if(userCart.products.length === 0) throw new Error('No products in cart!');
return true;
};


const customProductStockValidator = async (quantity, req) => {
    const { productId, selectedSize } = req.body;
  
    // جلب المنتج
    const product = await productsSchema.findById(productId);
    if (!product) throw new Error('Product not found!');
  
    // لو في مقاس مختار
    if (selectedSize && selectedSize.size_id) {
    const size_id = selectedSize.size_id || selectedSize.id;

      // البحث عن المقاس في المنتج
      const existingSize = product.sizes.find(
        size => size._id.toString() === size_id && size.size === selectedSize.size
      );
  
    if (!existingSize) throw new Error('Size is not valid!');


      // التحقق من المخزون
    if (quantity > existingSize.stock) throw new Error('Quantity exceeds available stock');

    return true;
    }

    // في حالة المنتج بدون مقاس
    if (quantity > product.stock) throw new Error('Quantity exceeds available stock');

    return true;
};


// Requsets Validator
const bodyCartIdValidator =  body('cartId')
.notEmpty().withMessage('Cart id is empty!').bail()
.isString().withMessage('Cart id is not string!').bail()
.custom((value) => customCartIdValidator(value));


const paramCartIdValidator =  param('cartId')
.notEmpty().withMessage('Cart id is empty!').bail()
.isString().withMessage('Cart id is not string!').bail()
.custom((value) => customCartIdValidator(value));

const existingUsercartValidator = body('userId')  
.notEmpty().withMessage('Cart id is empty!').bail()
.isString().withMessage('Cart id is not string!').bail()
.custom((value) => customExistingUsercartValidator(value));


const quantityValidator = body('quantity')
.notEmpty().withMessage('Quantity id is empty!').bail()
.isNumeric().withMessage('Quantity id is not number!').bail()
.custom((value , {req}) => customProductStockValidator(value , req));

module.exports = {
    bodyCartIdValidator,
    paramCartIdValidator,
    existingUsercartValidator,
    quantityValidator
}
