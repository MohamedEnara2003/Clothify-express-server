const express = require('express');
const router = express.Router();
const controller = require('../controllers/orders.controller')

// Require Middlewares
const {imagesToPublicFolder} = require('../middlewares/imagesToPublicFolder')

const isAuth = require('../middlewares/auth')
const {isFullyAuthorized , isAdminAndSuperAdmin} = require('../middlewares/roles.middelware')
const validationResult = require('../middlewares/validationResult');
const {productStockAdjustment} = require('../middlewares/stock.middleware');
const {checkStockAvailability} = require('../middlewares/orders.middleware');

// Express-Validators
const {paramOrderIdValidator} = require('../utils/validations/order.validator');
const {existingUsercartValidator} = require('../utils/validations/cart.validator');
const {paramUserIdValidator , bodayUserIdValidator} = require('../utils/validations/user.validator');


// Routes
router.get('/' ,  isAuth , isFullyAuthorized , controller.getAllUserOrder);

router.get('/:userId' , isAuth , [
paramUserIdValidator,
validationResult,
] ,controller.getUserOrder);

router.post('/' , isAuth ,[
bodayUserIdValidator,
existingUsercartValidator,
validationResult,
] ,  checkStockAvailability, productStockAdjustment , controller.createUserOrder);

router.put('/:orderId' ,  isAuth ,[
paramOrderIdValidator
] , checkStockAvailability, productStockAdjustment , controller.updateUserOrderStatus);

router.delete('/', isAuth , isAdminAndSuperAdmin , checkStockAvailability, productStockAdjustment, 
controller.deleteUserOrder);

module.exports = router;
