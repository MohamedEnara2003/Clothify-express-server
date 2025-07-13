
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    fullName : {type : String , require : true},
    email : {type : String , require : true},
    role : {type : String , default: 'User', enum: ['User', 'Admin']},
    password : {type : String , require : true},
    refreshToken : {type : String},
    ip : {type : String},
    createdAt : {type : Date , default: Date.now},
})

module.exports = mongoose.model('User', Schema);