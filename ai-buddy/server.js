require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const {integrateSocket} = require('./src/socket/socket.server')

const server = http.createServer(app);

integrateSocket(server);



server.listen(3005, () => {
    console.log('Server is running on port 3005');
});









