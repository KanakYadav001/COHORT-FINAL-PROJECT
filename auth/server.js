require('dotenv').config()
const app = require('./src/app')
const ConnectToDB = require('./src/db/db')
const { connect } = require('./src/broker/broker')
connect()
ConnectToDB()

app.listen(3000,()=>{
    console.log("Server Run On 3000 Port");
    
})