const productsSchema = require('../models/products.Schema')

const validationResult = require('../middlewares/validationResult');
const Cloudinary = require('../config/cloudinary');

exports.getAllProducts = async (req , res, next) => {
    try{
    const products = await productsSchema.find();
    if(products.length === 0) {
    return res.status(200).json({data : [] , message : 'No Products Found!'})
    }
    res.status(200).json({data : products , message : 'Fetched successfully'})
    }
    catch(err) {
    next(err)
    }
}
exports.getRelatedProduct = async (req , res, next) => {
    try{
    const {id} = req.params
    const product = await productsSchema.findById(id);
    
    if(!product) {
    return res.status(200).json({data : [] , message : 'No Product Found!'})
    }
    
    const products = await productsSchema.find({
    category: product.category,
    gender: product.gender,
    type: product.type,
    });
    
    res.status(200).json({data : products , message : 'Fetched successfully'})
    }
    catch(err) {
    next(err)
    }
}

exports.getProductById = async (req , res, next) => {
    try{
    const {id} = req.params;
    const product = await productsSchema.findById(id);
    if(!product) {
    return res.status(200).json({data : undefined , message : 'No Product Found!'})
    }
    res.status(200).json({data : product , message : 'Fetched successfully'})
    }
    catch(err) {
    next(err)
    }
}

exports.createProduct = async (req , res , next) => {
    try {  

    const price = parseFloat(req.body.price);
    const discound = parseFloat(req.body.discound) || 0;
    const productData =   {...req.body, final_price: price - (price * discound / 100)};
    const createdProduct =  new productsSchema(productData);
    await createdProduct.save();

    res.status(201).json({data : productData , message : 'Created successfully'})
    }
    catch(err) {
    next(err)
    }
}

exports.updateProduct = async ( req , res , next) => {
    try {
    const errors = validationResult(req);
    if(errors) throw errors;

    const {id} = req.params;
    const updatedProduct = await  productsSchema.findByIdAndUpdate(id , req.body , {new : true})
    res.status(200).json({data : updatedProduct , message : 'Updated successfully'})
    }
    catch(err) {
    next(err)
    }
}

exports.deleteProduct = async ( req , res , next) => {
    try {
    const {id} = req.params;
    const product = await productsSchema.findById(id).select('id images')
    const images = product.images;
    
    if(images.length > 0) {
    await Promise.all(
    images.map((item) => Cloudinary.uploader.destroy(item.img_id))
    )
    }
    
    await  productsSchema.findByIdAndDelete(id)
    res.status(200).json({data : id , message : 'Deleted successfully'})
    }
    catch(err) {
    next(err)
    }
}