const express = require('express');
const router = express.Router();

const {body} = require('express-validator');
const userSchema = require('../models/users.Schema')
const usersController = require('../controllers/users.controller')

const isAuth = require('../middlewares/auth') 
const isAdmin = require('../middlewares/isAdmin')

const customExistingEmail =  async (value) => {
    const existingEmail = await userSchema.findOne({email : value});
    if(existingEmail){
    throw new Error('Email is not valid');
    }
    return true;
}

const customExistingFullName =  async (value) => {
    const existingFullName = await userSchema.findOne({fullName : value});
    if(existingFullName){
    throw new Error('FullName is not valid');
    }
    return true;
}

const registerValidator = [
    body('fullName')
    .notEmpty().withMessage('FullName is required')
    .isLength({ min: 6, max: 40 }).withMessage('FullName must be between 6 and 40 characters')
    .custom((value) => customExistingFullName(value)),

    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .custom((value) => customExistingEmail(value)),

    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters')
    .matches(/[a-z]/).withMessage('Must contain lowercase')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain number'),
];

const loginValidator = [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').notEmpty().withMessage('Password is required'),
];


router.get('/users' , isAuth , isAdmin, usersController.getAllUsers);
router.get('/profile' , isAuth , usersController.getUserProfile);

router.post('/register' , registerValidator  ,usersController.register);
router.post('/login', loginValidator  ,usersController.login );


router.delete('/logout' , isAuth , usersController.logout );
router.delete('/delete-user/:userId' , isAuth ,isAdmin , usersController.deleteUser);

module.exports = router;
