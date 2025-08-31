const orderSchema = require('../models/orders.Schema')

exports.checkStockAvailability = async (req, res, next) => {
  try {
    const { userId, orders , status : newStatus} = req.body;
    const { orderId } = req.params;

    // Create Order
    if (Array.isArray(orders) && orders.length > 0) {
      req.body.productsInOrders = orders.flatMap(order =>
        Array.isArray(order.products) ? order.products.map(product => ({
          id: product.productId?._id || product.productId,
          selectedSize: product.selectedSize || null,
          quantity: product.quantity,
          status: order.orderStatus,
          action : 'Create'
        })) : []
      );
      return next();
    }

    // Update Order Status
    if (orderId && userId ) {
      const existingOrder = await orderSchema.findOne({ userId, 'orders._id': orderId });
      if (!existingOrder) return res.status(400).json({ message: 'Order not found.' });
      const targetOrder = existingOrder.orders.find(order => order._id.toString() === orderId);
      if (!targetOrder) return res.status(400).json({ message: 'Order not found in user orders.' });

      req.body.productsInOrders = targetOrder.products.map(product => ({
        id: product.productId?._id || product.productId,
        selectedSize: product.selectedSize || null,
        quantity: product.quantity,
        status: newStatus || targetOrder.orderStatus ,
        previousStatus: targetOrder.orderStatus, 
        action : 'Update'
      }));
      return next();
    }

    // Delete Order
  const {ordersIds} = req.body;

    if (Array.isArray(ordersIds) && ordersIds.length > 0) {
        const ordersToDelete = await orderSchema.find({ 'orders._id': { $in: ordersIds } });
        if (ordersToDelete.length === 0) {
            return res.status(404).json({ message: 'No orders found for the provided IDs.' });
        }
    
        req.body.productsInOrders = ordersToDelete.flatMap(order =>
            order.orders.filter(o => ordersIds.includes(o._id.toString())).flatMap(o =>
            o.products.map(product => ({
                id: product.productId?._id || product.productId ,
                selectedSize: product.selectedSize || null,
                quantity: product.quantity,
                status: 'Cancelled',
                previousStatus: o.orderStatus,
                action : 'Delete'
            }))
            )
        );
        return next();
    }
    next(); 
  } catch (error) {
    next(error);
  }
};



