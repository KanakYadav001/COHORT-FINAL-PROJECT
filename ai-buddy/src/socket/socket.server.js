const socketIO = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

async function setupSocket(server) {

    const io = socketIO(server, {})


    io.use((socket, next) => {

        const cookies = socket.handshake.headers.cookie;
        const token = cookie.parse(cookies || '').token;

        if(!token) {
            return next(new Error('Token is required!!!'));
        }
    
    
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    socket.user = decoded;
    next();
  }
  catch (error) {
    return next(new Error('Invalid token!!!'));
  }

    })


    io.on('connection', (socket) => {
        console.log('new user connected');
    });

}




module.exports = {
    setupSocket
}