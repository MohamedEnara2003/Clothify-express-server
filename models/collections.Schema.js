
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    titleEn : {type : String , required: true},
    titleAr : {type : String , required: true},
    queries: {
    gender:   { type: [String] },
    category: { type: [String] },
    type:     { type: [String] },
    fitType:  { type: [String] },
    color:    { type: [String] },
    tags:     { type: [String] },
    minPrice: { type: Number },
    maxPrice: { type: Number },
    },
    products : [
    {
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    }
    ],
    createdAt : {type : Date , default: Date.now},
})

module.exports = mongoose.model('Collection', Schema);