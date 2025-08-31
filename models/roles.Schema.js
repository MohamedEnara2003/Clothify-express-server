
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    email : {type : String , require : true},
    password : {type : String , require : true},
    role : {type : String , require : true, enum: ['Moderator' , 'Admin' , 'SuperAdmin']},
    sentEmail  : {type : String , require : true}, 
    createdAt : {type : Date , default: Date.now},
})

module.exports = mongoose.model('Role', Schema);