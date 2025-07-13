
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    userId : {type:  mongoose.Schema.Types.ObjectId , ref : 'User' , required : true},
    products : [
    {productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: {
    size_id: {type: mongoose.Schema.Types.ObjectId , required: true },
    size: {type: String, required: true },
    stock: {type: Number, required: true },
    }
    }
    ],
})

module.exports = mongoose.model('Cart', Schema);