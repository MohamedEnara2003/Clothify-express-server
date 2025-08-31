

const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    ip :  {type : String , require : true}
})

module.exports = mongoose.model('visitor', Schema);
