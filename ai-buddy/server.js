require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const {setupSocket} = require('./src/socket/socket.server');

const server = http.createServer(app);
setupSocket(server);

const connectDB = require('./src/db/db');
connectDB();



server.listen(3005, () => {
    console.log('Server is running on port 3005');
});









