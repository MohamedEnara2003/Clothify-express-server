const productsSchema = require('../models/products.Schema');
const Cloudinary = require('../config/cloudinary');

exports.getAllProducts = async (req , res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;

    const {
      gender, category, type, fitType,color, tags, minPrice, maxPrice , sort,
      selectFields
    } = req.query;

    const filter = {};
    const toArray = (val) => Array.isArray(val) ? val : [val];

    if (gender) filter.gender = { $in: toArray(gender) };
    if (category) filter.category = { $in: toArray(category) };
    if (type) filter.type = { $in: toArray(type) };
    if (fitType) filter.fitType = { $in: toArray(fitType) };
    if (color) filter.color = { $in: toArray(color) };
    if (tags) filter.tags = { $in: toArray(tags) };

    if (minPrice || maxPrice) {
      filter.final_price = {};
      if (minPrice) filter.final_price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.final_price.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    let elements = {};
    if (selectFields) {
      const fieldsArray = selectFields.split(',');
      fieldsArray.forEach(field =>   field === 'images' ? 
      elements['images'] = { $slice: ['$images', 2] } : elements[field] = 1 
      );
    }

    const sortOptions = {
      Default: { createdAt: -1 },
      Newest: { createdAt: -1 },
      Oldest: { createdAt: 1 },
      LowtoHigh: { final_price: 1 },
      HightoLow: { final_price: -1 }
    };

    // pipeline
    const pipeline = [  { $match: filter }];


    if (Object.keys(elements).length > 0) {
      pipeline.push({ $project: elements });
    }

    pipeline.push({ $sort: sort && sortOptions[sort] ?  sortOptions[sort] : sortOptions['Default']});
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const products = await productsSchema.aggregate(pipeline);
    const total = await productsSchema.countDocuments(filter);

    if (products.length === 0) {
      return res.status(200).json({
        data: [],
        message: 'No Products Found!',
      });
    }

    res.status(200).json({
      data: {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      message: 'Fetched successfully',
    });

  } catch (err) {
    next(err);
  }
}


exports.getProductsFilters = async (req , res, next) => {
    try{

    const genders = await productsSchema.distinct('gender');
    const categories = await productsSchema.distinct('category');
    const types = await productsSchema.distinct('type');
    const fitTypes = await productsSchema.distinct('fitType');
    const colors = await productsSchema.distinct('color');
    const tags = await productsSchema.distinct('tags');

    const prices = await productsSchema.aggregate([
    {
    $group: {
        _id: null,
        minPrice: { $min: "$final_price" },
        maxPrice: { $max: "$final_price" }
        }
    }
    ]);

    const filterData = [
    {title : 'gender' , items  : genders},
    {title : 'category' , items  : categories},
    {title : 'type' , items  : types},
    {title : 'fitType' , items  : fitTypes},
    {title : 'color' , items  : colors},
    {title : 'tags' , items  : tags},
    ]

    res.status(200).json({
    data : {filterData , prices},
    message : 'Fetched successfully'
    })

    }
    catch(err) {
    next(err)
    }
}
exports.getCollections = async (req, res, next) => {
  try {
    const products = await productsSchema.find().select('gender category type fitType');

    // =============================
    // 1. Group by gender/category/type
    // =============================
    const genderMenu = products.reduce((acc, item) => {
      const { gender, category, type } = item;

      if (!acc[gender]) acc[gender] = [];

      const catGroup = acc[gender].find((group) => group.category === category);

      if (!catGroup) {
        acc[gender].push({ category, items: [type] });
      } else if (!catGroup.items.includes(type)) {
        catGroup.items.push(type);
      }

      return acc;
    }, {});

    // =============================
    // 2. Group by type ➝ fitTypes
    // =============================
    const fitMenu = products.reduce((acc, item) => {
      const { type, fitType } = item;

      if (!type || !fitType) return acc;

      if (!acc[type]) acc[type] = [];

      if (!acc[type].includes(fitType)) {
        acc[type].push(fitType);
      }

      return acc;
    }, {});

   
    // 3. Return both menus
    res.status(200).json({
      data: {
        byGender: genderMenu,
        byFit: fitMenu
      },
      message: 'Fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req , res, next) => {
    try{
    const {productId} = req.params;
    const product = await productsSchema.findById(productId);
    if(!product) {
    return res.status(200).json({data : undefined , message : 'No Product Found!'})
    }
    res.status(200).json({data : product , message : 'Fetched successfully'})
    }
    catch(err) {
    next(err)
    }
}

exports.createProduct = async (req, res, next) => {
  try {
    const price = parseFloat(req.body.price);
    const discound = parseFloat(req.body.discound) || 0;

    const productData = {
      ...req.body,
      final_price: price - (price * discound / 100),
    };

    const createdProduct = new productsSchema(productData);
    await createdProduct.save({new : true});

    res.status(201).json({
      data: createdProduct,
      message: 'Created successfully',
    });
  } catch (err) {
    next(err);
  }
};


exports.updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sizes, ...rest } = req.body;

    const updatedProduct = await productsSchema.findByIdAndUpdate(
      productId,
      {
      ...rest,
      ...(Array.isArray(sizes) ? { sizes } : {})
      },
      { new: true }
    );

    res.status(200).json({ data: updatedProduct, message: "Updated successfully" });
  } catch (err) {
    next(err);
  }
};


exports.deleteProduct = async (req, res, next) => {
  try {
    const productsIds  = req.body;

    if (!Array.isArray(productsIds) || productsIds.length === 0) {
      return res.status(400).json({ message: 'Products ids is not defined or empty' });
    }

    const products = await productsSchema.find({ _id: { $in: productsIds } } , 'images');
    if (products.length === 0) {
      return res.status(400).json({ message: 'No products found with the provided ids' });
    }

    const productsImages = products.flatMap(p => p.images);

    if (productsImages.length > 0) {
      await Promise.all(
        productsImages.map(item => Cloudinary.uploader.destroy(item.img_id))
      );
    }

    await productsSchema.deleteMany({ _id: { $in: productsIds } });

    res.status(200).json({ data: productsIds, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}