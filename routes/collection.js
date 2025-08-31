
const express = require('express');
const router = express.Router();

const controller = require('../controllers/collection.controller');

// MW
const isAuth = require('../middlewares/auth')
const {isSuperAdmin} = require('../middlewares/roles.middelware')



// Routes 
router.get('', controller.getCollections);
router.get('/:id', controller.getCollectionById);
router.post('', isAuth, isSuperAdmin , controller.createCollection);
router.put('/:id', isAuth, isSuperAdmin , controller.updateCollection);
router.delete('', isAuth, isSuperAdmin , controller.deleteCollections);


module.exports = router;