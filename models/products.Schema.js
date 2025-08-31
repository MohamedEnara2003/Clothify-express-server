
const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    
    createdAt : {type : Date , default: Date.now},
    
    name: {
        type: String,
        required: true,
        trim: true,
    },
    
    images: [
        {
        img_url: {type: String, required: true },
        img_id: {type: String, required: true },
        }
    ],
    
      price: {
        type: Number,
        required: true,
      },
    
      final_price: {
        type: Number,
        required: true,
      },
    
    discound: {
        type: Number,
        default: 0,
    },
    

    color: {
        type: String,
        required: true,
    },
    
  
    category: {
        type: String,
        enum: ['APPAREL', 'ACCESSORIES', 'SHOES', 'OUTERWEAR', 'TROUSERS'],
        required: true,
    },

    type: {
    type: String,
    required: true,
    },
    
    fitType	: {
    type: String,
    required: true,
    },
    
      gender: {
        type: String,
        enum: ['MEN', 'WOMEN', 'KIDS' , 'NONE'],
        required: true,
      },

      description: String,
    
    sizes: [
        {
        size: {type: String },
        stock: {type: Number},
        }
    ],

    stock : {type: Number, default: null},  
    
    tags: [
        {
        type: String,
        }
    ]
})

module.exports = mongoose.model('Product', Schema);
