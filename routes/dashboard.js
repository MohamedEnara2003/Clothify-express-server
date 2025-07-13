const express = require('express');
const router = express.Router();

const isAuth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')

router.get('/' , isAuth , isAdmin ,  (req ,res ,next) => {
res.status(200).json({message : "Wellcome admin dashboard!"})
})

module.exports = router;