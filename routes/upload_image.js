const express = require('express');
const router = express.Router();

const controller = require('../controllers/upload_image.controller')
const upload = require('../middlewares/multer');


router.post('/upload' , upload.array('image') ,controller.uploadImage);
router.delete('/delete-image' ,controller.deleteUploadedImage);


module.exports = router;
