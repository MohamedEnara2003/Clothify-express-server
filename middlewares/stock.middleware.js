const mongoose = require('mongoose');
const productsSchema = require('../models/products.Schema');


// MW => Product Stock Adjustmentconst 
exports.productStockAdjustment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productsInOrders } = req.body;

    if (!Array.isArray(productsInOrders) || productsInOrders.length === 0) {
      throw new Error("NO_PRODUCTS_IN_ORDERS");
    }

    for (const product of productsInOrders) {
      const { id, selectedSize, quantity, status, action, previousStatus } = product;
      const sizeId = selectedSize?.size_id || null;

      const existingProduct = await productsSchema.findById(id, null, { session });
      if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");

      const existingSize = sizeId
        ? existingProduct.sizes.find(({ _id }) => _id.toString() === sizeId.toString())
        : null;

      if (sizeId && !existingSize) throw new Error("SIZE_NOT_FOUND");

      const stock = existingSize?.stock ?? existingProduct.stock;
      if (quantity > stock && action === "Create") {
      throw new Error("QUANTITY_EXCEEDS_STOCK");
      }

      let newStock;
      if (sizeId && existingSize) {
        // التعامل مع المقاسات
        newStock = calculateStock(existingSize.stock, action, status, previousStatus, quantity);
        existingProduct.sizes = existingProduct.sizes.map(size =>
          size._id.toString() === sizeId.toString()
            ? { ...size.toObject(), stock: newStock }
            : size
        );
      } else {
        // التعامل مع المخزون العام
        newStock = calculateStock(existingProduct.stock, action, status, previousStatus, quantity);
        existingProduct.stock = newStock;
      }

    await existingProduct.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    next();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();

    const messages = {
      NO_PRODUCTS_IN_ORDERS: "No products found in orders.",
      PRODUCT_NOT_FOUND: "This product not found",
      SIZE_NOT_FOUND: "Size not found",
      QUANTITY_EXCEEDS_STOCK: "Quantity exceeds stock",
    };

    return messages[error.message]
      ? res.status(400).json({ message: messages[error.message] })
      : next(error);
  }
};

/**
 * حساب المخزون الجديد بناءً على الإجراء والحالة
 */

const calculateStock = (currentStock, action, status, previousStatus, quantity) => {
  // 1- إنشاء طلب جديد → تقليل المخزون
  if (action === "Create") {
    return Math.max(currentStock - quantity, 0);
  }

  // 2- تحديث حالة الطلب
  if (action === "Update") {
    // من أي حالة إلى Cancelled → رجع المخزون
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      return currentStock + quantity;
    }
    // من Cancelled إلى أي حالة تانية → قلل المخزون
    if (previousStatus === "Cancelled" && status !== "Cancelled") {
      return Math.max(currentStock - quantity, 0);
    }
    // أي تحديث تاني → بدون تغيير
    return currentStock;
  }

  // 3- حذف الطلب
  if (action === "Delete") {
    if (previousStatus === "Cancelled") {
      return currentStock;
    }
    // لو ماكانش ملغي → رجع المخزون
    return currentStock + quantity;
  }

  return currentStock;
};

