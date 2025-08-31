const Cloudinary = require('../config/cloudinary')
const sharp = require('sharp');
const { Readable } = require('stream');


const  streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = Cloudinary.uploader.upload_stream(
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
          width: 600, 
          height: 600, 
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


    const result = await Cloudinary.uploader.destroy(id, {
      resource_type: "image",
    });

    if (result.result === "not found") {
      return res.status(404).json({ message: `Image with id ${id} not found` });
    }

    res.status(200).json({message : "Deleted image successfully"});
    }
    catch(err){
    next(err)
    }
}


exports.autoDeleteTempImages  = async (req , res , next) => {
    try{

      const data = await Cloudinary.api.resources({
        type: 'upload',
        prefix: 'temp/',
        max_results: 500,
      });

      const cutoffDate = new Date(Date.now() - 12 * 60 * 60 * 1000); 

      await Promise.all(
      data.resources.map((res) => {
      const {public_id , created_at} = res ;
      const uploadedAt = new Date(created_at);

      if (uploadedAt < cutoffDate) {
      return  Cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
      }
      return Promise.resolve();
      })
      )
      res.status(200).json({ message: 'Deleted temp images older than 1 day' });
    }
    catch(err){
    next(err)
    }
}