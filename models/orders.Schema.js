const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  orders: [
    {
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
          quantity: { type: Number, required: true },
          selectedSize: {
            size_id: { type: mongoose.Schema.Types.ObjectId, },
            size: { type: String},
            stock: { type: Number },
          },
        },
      ],

      paymentMethod: {
        type: String,
        enum: ['Delivery', 'Vodafone-Cash', 'Instapay', 'Visa', 'MasterCard', 'PayPal'],
        default: undefined,
      },

      orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'],
      },

      userData: {
        email: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        country: { type: String, required: true, default: 'Egypt' },
        city: { type: String },
        stateRegion: { type: String },
        postalCode: { type: String },
      },

      receipt: {
      receipt_img : {type: String} ,
      receipt_id :  {type: String} ,
      },
      totalPrice: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Order', orderSchema);
