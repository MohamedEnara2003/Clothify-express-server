const {body , param} = require('express-validator');
const orderSchema = require('../../models/orders.Schema')



// Order ID Validator
const customOrderIdValidator = async (id) => {
const cart = await orderSchema.findOne({_id : id});
if (!cart) throw new Error('Cart id is not valid!');
return true;
};


exports.paramOrderIdValidator =  param('orderId')
.notEmpty().withMessage('Order id is empty!').bail()
.isString().withMessage('Order id is not string!').bail()
.custom((value) => customOrderIdValidator(value));