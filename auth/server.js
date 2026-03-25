require('dotenv').config()
const app = require('./src/app')
const ConnectToDB = require('./src/db/db')
ConnectToDB()

app.listen(3000,()=>{
    console.log("Server Run On 3000 Port");
    
})