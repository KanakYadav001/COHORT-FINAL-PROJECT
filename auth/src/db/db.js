const mongoose = require('mongoose')


async function ConnectDB(){
    try{

        await mongoose.connect(process.env.DB_URL)
        console.log("Sucessfully Connect To DB");
        

    }catch(err){
       console.log("Falied to connect to db",err);
       
    }
}

module.exports=ConnectDB