const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller')

// User Req Validations
const {paramUserIdValidator , fullNameValidator , emailValidator , passwordValidator}
= require('../utils/validations/user.validator');

// Middlewares
const isAuth = require('../middlewares/auth') 
const {isSuperAdmin , isFullyAuthorized} = require('../middlewares/roles.middelware')
const validationResult = require('../middlewares/validationResult');

const registerValidator = [fullNameValidator , emailValidator , passwordValidator , validationResult]

// Routes
router.get('/users' , isAuth , isFullyAuthorized, usersController.getAllUsers);
router.get('/profile' , isAuth , usersController.getUserProfile);

router.post('/register' , registerValidator  , usersController.register);
router.post('/login' , usersController.login );

router.post('/create-user' , isAuth ,isSuperAdmin, usersController.login );

router.delete('/delete-user' , isAuth ,isSuperAdmin  , usersController.deleteUser);

router.delete('/logout' , isAuth , usersController.logout );
module.exports = router;
