const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/role.controller')
const {sendEmail}  = require('../middlewares/nodemailer.middleware');

// Middlewares
const isAuth = require('../middlewares/auth') 
const {isSuperAdmin}  = require('../middlewares/roles.middelware')


// Routes
router.get('/' , isAuth , isSuperAdmin , rolesController.getAllRoles);
router.post('/' , isAuth , isSuperAdmin , sendEmail, rolesController.createRole);
router.delete('/' , isAuth , isSuperAdmin , rolesController.deleteRole);


module.exports = router;