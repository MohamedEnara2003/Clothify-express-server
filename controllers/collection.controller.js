const CollectionSchema = require('../models/collections.Schema');

exports.getCollections = async (req , res , next) => {
    try {
    
    const collectionsMax = 10 ;
    const collectionsCount = await CollectionSchema.countDocuments();

    if(collectionsCount >= collectionsMax) {
    return res.status(400).json({message: "Maximum of 10 collections allowed."});
    }

    const collections = await CollectionSchema
    .find()
    .limit(collectionsMax)
    .populate('products.productId');
    res.status(200).json({data : collections , total : collectionsCount , message: "Fetched successfully"});

    } catch (error) {
    next(error)
    }
}

exports.getCollectionById= async (req , res , next) => {
    try {
    const {id : _id} = req.params ;

    if(!_id)  return res.status(400).json({message: "Collection id is not defind"});

    const collection = await CollectionSchema.findById({_id}).populate('products.productId');
    if(!collection)  return res.status(200).json({message: "Not found collection"});
    
    res.status(200).json({data : collection , message: "Fetched successfully"});
    } catch (error) {
    console.log(error);
    next(error)
    }
}

exports.createCollection = async (req , res , next) => {
    try {
    const {titleEn , titleAr , products , queries} = req.body;

    if(!titleEn && !titleAr && !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({message: "Products Ids is undefined"});
    }
    
    const collection = new CollectionSchema({titleEn , titleAr , queries, products})
    await collection.save();
    await collection.populate('products.productId');
    
    if(!collection){
    return res.status(400).json({message: "Failed to create collection"});
    }
    
    res.status(201).json({data : collection ,  message: "Created successfully"});
    } catch (error) {
    next(error)
    }
}

exports.updateCollection = async (req, res, next) => {
    try {
    const { id } = req.params;
    const collection = req.body;

    const isExistingCollection = await CollectionSchema.findById(id, '_id');

    if (!isExistingCollection) {
        return res.status(400).json({ message: "Collection id is not defined" });
    }
  
    if (!collection || Object.keys(collection).length === 0) {
        return res.status(400).json({ message: "Collection data is missing" });
    }

    const updatedCollection = await CollectionSchema
    .findByIdAndUpdate(id, collection, { new: true })
    .populate('products.productId');

    if (!updatedCollection) {
        return res.status(400).json({ message: "Failed to update collection" });
    }

    res.status(200).json({
        data: updatedCollection,
        message: "Updated successfully"
    });
    } catch (error) {
    next(error);
    }
  };
  



exports.deleteCollections = async (req, res, next) => {
    try {
    const collectionsIds = req.body;

    if (!Array.isArray(collectionsIds) || collectionsIds.length === 0) {
    return res.status(400).json({ message: "Users IDs are required" });
    }

    const collections = await CollectionSchema.find({ _id: { $in: collectionsIds } }, 'role');
    
    if (collections.length === 0)  {
    return res.status(400).json({ message: "User not found" });
    }

    const isSuperAdmin = collections.some(({role}) => role === req.user.role);
    
    if (isSuperAdmin)  {
    return res.status(400).json({ message: "A Super Admin is not allowed to delete another Super Admin." });
    }
    
    await CollectionSchema.deleteMany({ _id: { $in: collectionsIds } });
    res.status(200).json({message: "Deleted successfully" });
    }
    catch (err) {
    next(err);
    }
  }
  