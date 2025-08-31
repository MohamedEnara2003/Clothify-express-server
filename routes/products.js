const express = require('express');
const router = express.Router();

const controller = require('../controllers/products.controller');

// Middlewares
const {imagesToPublicFolder} = require('../middlewares/imagesToPublicFolder');
const isAuth = require('../middlewares/auth');
const {isAdminAndSuperAdmin} = require('../middlewares/roles.middelware')

// Express-Validators
const {paramProductIdValidator} = require('../utils/validations/product.validator');
const validationResult = require('../middlewares/validationResult');

const productIdValidator  = [paramProductIdValidator , validationResult];

// Routes
router.get('/' ,  controller.getAllProducts);

// Filtering
router.get('/filters', controller.getProductsFilters);
router.get('/collections', controller.getCollections);

router.get('/:productId' , productIdValidator,  controller.getProductById);

router.post('/' ,isAuth ,isAdminAndSuperAdmin , imagesToPublicFolder , controller.createProduct);
router.put('/:productId',isAuth ,isAdminAndSuperAdmin , productIdValidator ,controller.updateProduct);
router.delete('/' , isAuth ,isAdminAndSuperAdmin  , controller.deleteProduct);

module.exports = router;
