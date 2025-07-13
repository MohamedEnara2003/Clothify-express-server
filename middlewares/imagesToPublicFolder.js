const Cloudinary = require('../config/cloudinary');

exports.imagesToPublicFolder = async (req, res, next) => {
    try {
    const {images} = req.body;

    if (!images || images.length === 0)  res.status(400).json({message: 'No images provided'});

    const publicImages = await Promise.all(
    images.map(async (res) => {
    const id = res.img_id; 
    const imageId = id.split('/').pop(); 
    const newPath = `public/${imageId}`;

    const result = await Cloudinary.uploader.rename(id, newPath, {
    invalidate: true,
    resource_type: 'image',
    });

    return  {
    img_id: result.public_id, 
    img_url: result.secure_url,
    }; 
})
);

    if (publicImages.length === 0) {
    return res.status(400).json({message: 'Failed to move images to public folder'});
    }

    req.body.images = publicImages;
    next();
    } catch (error) {
    next(error);
    }
}