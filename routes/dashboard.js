const express = require('express');
const router = express.Router();

const isAuth = require('../middlewares/auth')
const {isFullyAuthorized} = require('../middlewares/roles.middelware')


// Routes
router.get('/' , isAuth , isFullyAuthorized ,  (req ,res ,next) => {
res.status(200).json({message : "Wellcome admin dashboard!"})
})

module.exports = router;