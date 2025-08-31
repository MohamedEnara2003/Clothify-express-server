const {body , param} = require('express-validator');
const productsSchema = require('../../models/products.Schema');

// Product ID  Validator
const customProductIdValidator = async (_id) => {
const product = await productsSchema.findOne({_id}).select('_id');
if (!product) throw new Error('Product id is not valid!');
return true;
};

// Check Size To Cart if existing in product



const bodyProductIdValidator = body('productId' || 'id')
.notEmpty().withMessage('Product id is empty!').bail()
.isString().withMessage('Product id must be a string!').bail()
.custom((value) => customProductIdValidator(value));

const paramProductIdValidator = param('productId' || 'id') 
.notEmpty().withMessage('Product id is empty!').bail()
.isString().withMessage('Product id must be a string!').bail()
.custom((value) => customProductIdValidator(value));



module.exports = {
    bodyProductIdValidator,
    paramProductIdValidator,
}
