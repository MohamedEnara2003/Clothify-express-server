

const express = require('express');
const router = express.Router();
const controller = require('../controllers/carts.controller');

// MW
const isAuth = require('../middlewares/auth')
const validationResult = require('../middlewares/validationResult');

// Express-Validators
const {paramCartIdValidator , quantityValidator} = require('../utils/validations/cart.validator');
const {bodayUserIdValidator , paramUserIdValidator} = require('../utils/validations/user.validator');
const {bodyProductIdValidator } = require('../utils/validations/product.validator');


// Routes
router.get( '/user/:userId' , [
paramUserIdValidator , 
validationResult]
, controller.getUserCarts);

router.post( '/' , isAuth, [
bodayUserIdValidator,
bodyProductIdValidator,
quantityValidator,
validationResult
], controller.addToCart);

router.put( '/update-quantity/:cartId' ,isAuth , [
paramCartIdValidator,
bodayUserIdValidator,
bodyProductIdValidator,
quantityValidator,
validationResult
] , controller.updateQuantity);

router.put( '/update-size/:cartId' ,isAuth, [
paramCartIdValidator,
bodayUserIdValidator,
bodyProductIdValidator,
validationResult
] , controller.updateSize);

router.delete( '/delete-product' , controller.deleteProductFromCart);

module.exports = router;