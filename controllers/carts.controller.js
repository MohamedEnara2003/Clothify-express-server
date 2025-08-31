const cartsSchema = require('../models/carts.Schema');
const productsSchema = require('../models/products.Schema');


exports.getUserCarts = async (req , res , next) => {
try {

    const {userId} = req.params;
    const userCart = await cartsSchema.findOne({userId}).populate('products.productId');

    if(!userCart) return res.status(200).json({message: "Cart not found!"});
    if(userCart.products.length === 0) return res.status(200).json({data : null , message : "Cart is empty!"});

    res.status(200).json({data : userCart , message : "Fetched successfully"})
} catch (error) {
    next(error)
}
}

exports.addToCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity, selectedSize } = req.body;

    const size_id = selectedSize?.size_id || null;

    // نجيب المنتج من قاعدة البيانات للتحقق من المخزون
    const productDoc = await productsSchema.findById(productId);

    if (!productDoc) {
      return res.status(400).json({ message: "Product not found" });
    }

    // لو في مقاس مختار، نتأكد إنه موجود

    let availableStock;
    if (size_id) {
      const sizeData = productDoc.sizes.find(s => s._id.toString() === size_id);
      if (!sizeData) {
        return res.status(400).json({ message: "Selected size not found" });
      }
      availableStock = sizeData.stock;
    } else {
      availableStock = productDoc.stock;
    }

    // نجيب السلة للمستخدم
    const userCart = await cartsSchema.findOne({ userId }).populate('products.productId');

    // لو السلة مش موجودة، نعملها ونضيف المنتج
    if (!userCart) {
      if (quantity > availableStock) {
        return res.status(400).json({ message: "Quantity exceeds available stock!" });
      }

      const newCart = new cartsSchema({
        userId,
        products: [{ productId, quantity, selectedSize: selectedSize || null }]
      });

      await newCart.save();
      await newCart.populate('products.productId');

      return res.status(201).json({
        data: newCart,
        message: "Cart created and product added successfully"
      });
    }

    // البحث عن المنتج (بالمقاس أو بدونه)
    let existingProductAndSize;
if (size_id) {
  existingProductAndSize = userCart.products.find(
    item => {
    return item.productId._id.toString() === productId && item.selectedSize.size_id.toString() === size_id
    }
  );
} else {
  existingProductAndSize = userCart.products.find(
    item => item.productId._id.toString() === productId
  );
}

    if (existingProductAndSize) {
      const totalQuantity = quantity + existingProductAndSize.quantity;

      if (totalQuantity > availableStock) {
        return res.status(400).json({ message: "Quantity exceeds available stock!" });
      }

      existingProductAndSize.quantity = totalQuantity;
    } else {
      if (quantity > availableStock) {
        return res.status(400).json({ message: "Quantity exceeds available stock!" });
      }
      userCart.products.push({ productId, quantity, selectedSize: selectedSize || null });
    }

    await userCart.save();
    await userCart.populate('products.productId');

    res.status(existingProductAndSize ? 200 : 201).json({
      data: userCart,
      message: existingProductAndSize
        ? "Update product quantity successfully"
        : "Product added successfully"
    });

  } catch (error) {
    next(error);
  }
};

  
    exports.updateQuantity = async (req , res , next) => {
    try { 
    const {cartId} = req.params;
    const {productId , selectedSize , quantity , userId} = req.body;
    const size_id = selectedSize?.size_id || null;

    const userCart = await cartsSchema.findOne({ _id: cartId, userId });

    if (!userCart) return res.status(400).json({ message: "Cart not found" });
    

    const existingProduct = userCart.products.find(item => {
      const dbProductId = item.productId?._id?.toString() || item.productId?.toString();
      const dbSizeId = item.selectedSize?.size_id?.toString() || null;
      return dbProductId === productId && (dbSizeId === size_id || size_id === null);
    });
    
    if (!existingProduct)  return res.status(400).json({ message: "Product not found in cart" });
    
    existingProduct.quantity = quantity;

    await userCart.save();
    await userCart.populate('products.productId');
    res.status(200).json({data : userCart , message : "Update product quantity successfully"});
    } catch (error) {
    console.log(error);
    next(error)
    }
    }

    exports.updateSize = async (req, res, next) => {
    try {
    const {cartId } = req.params;
    const {productId, selectedSize: newSize, userId } = req.body;

    const userCart = await cartsSchema.findOne({ _id: cartId, userId });

    if (!userCart) {
    return res.status(400).json({ message: "Cart not found" });
    }

    const existingProductIndex = userCart.products.findIndex(
    (item) =>
        item.productId.toString() === productId &&
        item.selectedSize.size_id.toString() !== newSize.size_id
    );

    const sameProductAndSizeIndex = userCart.products.findIndex(
    (item) =>
        item.productId.toString() === productId &&
        item.selectedSize.size_id.toString() === newSize.size_id
    );

    if (
    existingProductIndex !== -1 &&
    sameProductAndSizeIndex !== -1 &&
    existingProductIndex !== sameProductAndSizeIndex
    ) {
    const existingProduct = userCart.products[existingProductIndex];
    const sameProductAndSize = userCart.products[sameProductAndSizeIndex];

    sameProductAndSize.quantity += existingProduct.quantity;

    if (sameProductAndSize.quantity > sameProductAndSize.selectedSize.stock) {
    return res.status(400).json({ message: "Quantity exceeds available stock!" });
    }

    userCart.products.splice(existingProductIndex, 1);
    await userCart.save();
    await userCart.populate("products.productId");

    return res.status(200).json({data: userCart, message: "Updated size and merged successfully", });
    }
    
    const existingProduct = userCart.products[existingProductIndex];

    
    if (newSize.stock < existingProduct.quantity ) {
    return res.status(400).json({ message: "Quantity exceeds available stock!" });
    }

    const updatedCart = await cartsSchema
      .findOneAndUpdate(
        {
          _id: cartId,
          userId,
          "products.productId": productId,
        },
        {
        $set: {
        "products.$.selectedSize": newSize,
        },
        },
        { new: true }
      )
      .populate("products.productId");

    return res.status(200).json({ data: updatedCart, message: "Updated size successfully" });
  } catch (error) {
    next(error);
  }
};


    exports.deleteProductFromCart = async (req , res , next) => {
    try {
        const {cartId , productId , size_id} = req.body;


        let query = { _id: cartId, 'products.productId': productId };

        if (size_id) {
        query['products.selectedSize.size_id'] = size_id;
        } else {
        query['products.selectedSize'] = null;
        }

        let pullCondition = { productId };
        if (size_id) {
        pullCondition['selectedSize.size_id'] = size_id;
        } else {
        pullCondition.selectedSize = null;
        }

        const deletedProduct = await cartsSchema.findOneAndUpdate(
            query,
            { $pull: { products: pullCondition } },
            { new: true }
        ).populate('products.productId');

    res.status(200).json({data : deletedProduct , message : "Deleted successfully"});
    } catch (error) {
    next(error) 
    }
}
