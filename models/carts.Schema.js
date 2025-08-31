
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    userId : {type:  mongoose.Schema.Types.ObjectId , ref : 'User' , required : true},
    products : [
    {productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: {
    size_id: {type: mongoose.Schema.Types.ObjectId },
    size: {type: String },
    stock: {type: Number},
    },
    }
    ],
})

module.exports = mongoose.model('Cart', Schema);