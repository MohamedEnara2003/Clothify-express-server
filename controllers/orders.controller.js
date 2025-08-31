const orderSchema = require('../models/orders.Schema')
const cartSchema = require('../models/carts.Schema')




exports.getAllUserOrder = async (req, res, next) => {
  try {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 12;
   const skip = (page - 1) * limit;
   const { status } = req.query;

   const orders = await orderSchema.find()
   .skip(skip)
   .limit(limit)
   .populate('orders.products.productId' , 'images name category type final_price stock sizes');

  const total = orders.reduce((acc, { orders }) => acc + orders.length, 0);
  if (orders.length === 0) {
      return res.status(200).json({ data: [], message: 'No Orders Found!' });
  }

    res.status(200).json({
      data: {
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      },
      message: 'Fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserOrder = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userOrder = await orderSchema.findOne({ userId })
      .populate('orders.products.productId', 'images name category type final_price stock sizes');

    // Check if no order document exists at all
    if (!userOrder || userOrder.orders.length === 0) {
      return res.status(200).json({ message: "No orders found for this user" });
    }

   res.status(200).json({ data: userOrder, message: 'Fetched successfully' });

  } catch (error) {
   next(error);
  }
};

exports.createUserOrder = async (req, res, next) => {
  try {
    const { orders, userId } = req.body;

    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: 'Order is required!' });
    }

    const userCart = await cartSchema.findOne({ userId });
    if (!userCart) {
      return res.status(404).json({ message: 'Cart not found!' });
    }

    // delete User Cart products
    userCart.products = [];
    await userCart.save();

    const previousOrder = await orderSchema.findOne({ userId });

    // Update to Push order
    if (previousOrder) {
    previousOrder.orders.push(...orders);
    await previousOrder.save();
    await previousOrder.populate('orders.products.productId');
    return res.status(200).json({ data: previousOrder, message: 'Order added successfully' });
    }

    // Create order
    const orderData = new orderSchema({ userId, orders });
    const savedOrder = await orderData.save();
    await savedOrder.populate('orders.products.productId');

    res.status(201).json({ data: savedOrder, message: 'Order added successfully' });
  }
  catch (error) {
  next(error);
  }
}


exports.updateUserOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, userId } = req.body;

if (status && status !== "Cancelled" && req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
  return res.status(400).json({ message: 'Only Admins can update to statuses other than Cancelled' });
}

    const userOrder = await orderSchema.findOne({ userId }).populate('orders.products.productId');

    if (!userOrder || userOrder.orders.length === 0) {
      return res.status(400).json({ message: "User order not found" });
    }

    const order = userOrder.orders.find((order) => order._id.toString() === orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }


  order.orderStatus = status;
  await userOrder.save();
  res.status(200).json({ data: order, message: 'Updated successfully' });
  } catch (error) {
  next(error);
  }
}


exports.deleteUserOrder = async (req, res, next) => {
  try {
    const {ordersIds} = req.body;

    if (!Array.isArray(ordersIds) || ordersIds.length === 0) {
    return res.status(400).json({ message: 'ordersIds must be a non-empty array' });
    }

      const allUserOrders = await orderSchema.find();
      const updatedOrders = [];

      for (const doc of allUserOrders) {
      const originalLength = doc.orders.length;

      // حذف الطلبات اللي الـ _id بتاعها موجود في ordersIds
      doc.orders = doc.orders.filter(order => !ordersIds.includes(order._id.toString()));

      // لو حصل تعديل نحفظ ونضيف للنتيجة
      if (doc.orders.length < originalLength) {
      await doc.save();
      updatedOrders.push(doc);
      }
   }

      res.status(200).json({
      message: 'Deleted successfully',
      updatedCount: updatedOrders.length,
      updatedUsers: updatedOrders
});
} catch (error) {
next(error);
}
};

