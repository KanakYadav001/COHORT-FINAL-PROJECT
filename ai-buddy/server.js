require('dotenv').config();
const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);
setupSocket(server);


server.listen(3005, () => {
    console.log('Server is running on port 3005');
});









