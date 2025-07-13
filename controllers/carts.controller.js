const cartsSchema = require('../models/carts.Schema');
const validationResult = require('../middlewares/validationResult');



exports.getUserCarts = async (req , res , next) => {
try {

    const {userId} = req.params;
    const carts = await cartsSchema.findOne({userId}).populate('products.productId');
    if(carts.length === 0) {
    return res.status(200).json({data : [] , message : "No carts found!"})
    }

    res.status(200).json({data : carts , message : "Fetched successfully"})
} catch (error) {
    next(error)
}
}

exports.getCartUserByProductId = async (req , res , next) => {
try {
    const {userId , productId , size_id} = req.body;
    const cart = await cartsSchema.findOne({
    userId ,
    'products.productId': productId ,
    'products.size.size_id': size_id
    }).populate('products.productId');

    if(!cart) res.status(404).json({message : "Cart not found!"});
    if(cart.products.length === 0) res.status(200).json({data : null ,message : "No products found in the cart!"});
    
    res.status(200).json({data : cart , message : "Fetched successfully"});
    
} catch (error) {
    next(error)
}
}

exports.addToCart = async (req , res , next) => {
try {
    const errors = validationResult(req);
    if(errors) throw errors;

    const {userId , productId , quantity , size} = req.body ; 
    const {size_id} = size;
    const userCart = await cartsSchema.findOne({userId});

    if (!userCart) {
        const newCart = new cartsSchema({
        userId,
        products: [{ productId, quantity, size }]
    });

    await newCart.save();
    await newCart.populate('products.productId');
    return res.status(201).json({data: newCart,message: "Cart created and product added successfully"});
    }

    const existingProductAndSize = userCart.products.find(item => 
    item.productId.toString() === productId && item.size.size_id.toString() === size_id);

    if(existingProductAndSize){

    const totalQuantity = quantity + existingProductAndSize.quantity ;

    // Check if the total quantity exceeds the stock
    if(totalQuantity > existingProductAndSize.size.stock) {
    return res.status(400).json({message : "Quantity exceeds available stock!"});
    }
    
   // Existing Product Size => update quantity 
    existingProductAndSize.quantity += quantity;
    await userCart.save();
    await userCart.populate('products.productId');
    return res.status(200).json({data :  userCart , message : "Update quantity successfully"});
    }

    const newProduct = {productId , quantity , size};
    userCart.products.push(newProduct);
    await userCart.save();
    await userCart.populate('products.productId');
    res.status(201).json({data : userCart , message : "Created successfully"});

    } 
    catch (error) {
    next(error)
    }
}

    exports.updateQuantity = async (req , res , next) => {
    try { 
    const errors = validationResult(req);
    if(errors) throw errors;
    
    const {cartId} = req.params;
    const {productId , size , quantity , userId} = req.body;
    const {size_id} = size;

    const userCart = await cartsSchema.findOne({ _id: cartId, userId });

    if (!userCart) {
    return res.status(404).json({ message: "Cart not found" });
    }

    const existingProduct = userCart.products.find(
    (item) => item.productId.toString() === productId && item.size.size_id.toString() === size_id
    );

    if (!existingProduct) {
    return res.status(404).json({ message: "Product not found in cart" });
    }
    
    existingProduct.quantity = quantity;

    await userCart.save();
    await userCart.populate('products.productId');
    res.status(200).json({data : userCart , message : "Update quantity successfully"});
    } catch (error) {
    next(error)
    }
    }

    exports.updateSize = async (req, res, next) => {
        try {
        const errors = validationResult(req);
        if (errors) throw errors;
      
        const { cartId } = req.params;
        const { productId, size: newSize, userId } = req.body;
      
        const userCart = await cartsSchema.findOne({ _id: cartId, userId });
      
        if (!userCart) {
        return res.status(404).json({ message: "Cart not found" });
        }
    
        const existingProductIndex = userCart.products.findIndex(
            (item) =>
            item.productId.toString() === productId &&
            item.size.size_id.toString() !== newSize.size_id
        );
    
        const sameProductAndSizeIndex = userCart.products.findIndex(
            (item) =>
            item.productId.toString() === productId &&
            item.size.size_id.toString() === newSize.size_id
        );
    
        if (
            existingProductIndex !== -1 &&
            sameProductAndSizeIndex !== -1 &&
            existingProductIndex !== sameProductAndSizeIndex
        ) {

            const existingProduct = userCart.products[existingProductIndex];
            const sameProductAndSize = userCart.products[sameProductAndSizeIndex];
    
        
            sameProductAndSize.quantity += existingProduct.quantity;

            if(sameProductAndSize.quantity > sameProductAndSize.size.stock){
            return res.status(400).json({ message: "Quantity exceeds available stock!" });
            }

            userCart.products.splice(existingProductIndex, 1);
            await userCart.save();
            await userCart.populate("products.productId");
    
            return res.status(200).json({ data: userCart, message: "Updated size and merged successfully" });
        }
    
        const updatedCart = await cartsSchema.findOneAndUpdate(
        {_id: cartId, userId,'products.productId': productId,},
        { $set: { 'products.$.size': newSize } },
        { new: true }
        ).populate('products.productId');
    
        return res.status(200).json({data: updatedCart , message: "Updated size successfully"});
    
        } catch (error) {
        next(error);
        }
    }; 

    exports.deleteProductFromCart = async (req , res , next) => {
    try {
        const {cartId , productId , size_id} = req.body;

        const deletedProduct = await cartsSchema.findOneAndUpdate(
        {_id: cartId , 'products.productId': productId , 'products.size.size_id': size_id},
        {$pull: { 
        products: {
        productId,
        'size.size_id': size_id ,
        } ,
    }
    },
    {new: true}
    ).populate('products.productId');

    res.status(200).json({data : deletedProduct , message : "Deleted Product successfully"});
    } catch (error) {
        next(error) 
    }
}
    exports.deleteUserCart = async (req , res , next) => {
    try {
        const errors = validationResult(req);
        if(errors) throw errors;

        const {cartId} = req.params;
        const deletedCart = await cartsSchema.findByIdAndDelete(cartId);

        if(!deletedCart) {
        return res.status(404).json({message : "Cart not found!"});
        }

        res.status(200).json({message : "Deleted successfully"});
    } catch (error) {
        next(error) 
    }
}