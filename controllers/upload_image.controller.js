const cloudinary = require('../config/cloudinary')
const sharp = require('sharp');
const { Readable } = require('stream');


const  streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'temp', resource_type: 'image'  , format: 'webp' ,},
      (error, result) => {
      if (result) resolve(result);
      else reject(error);
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};


exports.uploadImage = async (req , res) => {
    const files = req.files;
    
    if(files.length <= 0){
    return res.status(400).json({message: 'Failed image upload'})
    }
    

  const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const webpBuffer = await sharp(file.buffer)
        .resize({
          width: 800, 
          height: 800, 
          fit: sharp.fit.inside, 
          withoutEnlargement: true, 
        })
        .webp({ quality: 70 })
        .toBuffer();

        const result = await streamUpload(webpBuffer);

        return {
        img_id: result.public_id,
        img_url: result.secure_url,
        };
      })
    );

    res.status(201).json({
    message: 'Image uploaded successfully',
    data : uploadedFiles,
    })
    
}

exports.deleteUploadedImage = async (req , res , next) => {
    const {id} = req.body;
    try{

    if (!id) res.status(400).json({ message: "Image ID is required" });
    
    await cloudinary.uploader.destroy(id);

    res.status(200).json({data : id , message : "Deleted image successfully"});
    }
    catch(err){
    next(err)
    }
}