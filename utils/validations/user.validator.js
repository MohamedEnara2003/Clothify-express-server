const {body , param } = require('express-validator');
const userSchema = require('../../models/users.Schema')



    // Existing Email Validator
    const customExistingEmail =  async (email) => {
    const existingEmail = await userSchema.findOne({email});
    if(existingEmail) {
    throw new Error('Email is not valid');
    }
    return true;
    }

    // Existing FullName Validator
    const customExistingFullName =  async (fullName) => {
    const existingFullName = await userSchema.findOne({fullName});
    if(existingFullName){
    throw new Error('FullName is not valid')
    };
    
    return true;
    }
   
    // User ID  Validator
    const customUserIdValidator = async (_id) => {
    const user = await userSchema.findOne({_id});
    if (!user)  throw new Error('User id is not valid!');
    return true;
    };

    const fullNameValidator = body('fullName')
    .notEmpty().withMessage('FullName is required')
    .isLength({ min: 6, max: 40 }).withMessage('FullName must be between 6 and 40 characters')
    .custom((value) => customExistingFullName(value));

    const  emailValidator = body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .custom((value) => customExistingEmail(value));

    const passwordValidator = body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters')
    .matches(/[a-z]/).withMessage('Must contain lowercase')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain number');


    const bodayUserIdValidator = body('userId')
    .notEmpty().withMessage('User id is empty!').bail()
    .isString().withMessage('User id must be a string!').bail()
    .custom((vlaue) => customUserIdValidator(vlaue));

    const paramUserIdValidator = param('userId')
    .notEmpty().withMessage('User id is empty!').bail()
    .isString().withMessage('User id must be a string!').bail()
    .custom((vlaue) => customUserIdValidator(vlaue));


    
    module.exports =  {
        fullNameValidator,
        emailValidator,
        passwordValidator,
        bodayUserIdValidator,
        paramUserIdValidator
    }