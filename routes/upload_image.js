const express = require('express');
const router = express.Router();

const controller = require('../controllers/upload_image.controller')
const upload = require('../middlewares/multer');
const isAuth = require('../middlewares/auth');

// Routes
router.post('/upload' , isAuth , upload.array('image') ,controller.uploadImage);
router.delete('/delete-image' , isAuth , controller.deleteUploadedImage);
router.delete('/delete-temp-images' , isAuth , controller.autoDeleteTempImages);


module.exports = router;
