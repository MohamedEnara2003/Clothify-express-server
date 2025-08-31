const express = require('express');
const router = express.Router();
const {getVisitors , createVisitor} = require('../controllers/visitor.controller')

// Middlewares
const isAuth = require('../middlewares/auth') 
const {isFullyAuthorized} = require('../middlewares/roles.middelware')

router.get('/' , isAuth , isFullyAuthorized, getVisitors )
router.post('/' , createVisitor)

module.exports = router;
