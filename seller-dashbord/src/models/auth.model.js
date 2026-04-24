const mongoose = require('mongoose')

const addressScema = new mongoose.Schema({
    
      street : String,
      zipCode : String,
      country  : String,
      city : String,
      state : String,
      isDefault :{type : Boolean, default: false}
    
})

const UserScema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique: true
    },
    fullName :{
        firstName : {type : String,require:true},
        lastName : {type : String,require:true},
    },
    email : {
        type : String,
        required : true,
        unique: true
    },
    password : {
         type : String,
         select : false
    },
    role : {
        type : String,
        enum : ["user","seller"],
        default : "user",
    },
    address : [addressScema]
})

const UserModel = mongoose.model('users',UserScema)


module.exports=UserModel