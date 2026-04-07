const socketIO = require('socket.io');



function setupSocket(server) {

    const io = socketIO(server, {})



    io.on('connection', (socket) => {
        console.log('new user connected');
    });

}




module.exports = setupSocket;