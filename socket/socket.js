const { Server } = require("socket.io");

const { SOCKET_PORT } = global.config.env
 

module.exports = function ({ server } = {}) {
    
    const io = new Server(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
    });
      
    global.socketIo = io; // Make socket.io instance accessible globally
      
    global.socketIo.on('connection', (socket) => {
        console.log('Frontend connected to socket.io');
      
        socket.on('disconnect', () => {
          console.log('Frontend disconnected from socket.io');
        });
      
        socket.on('message', (message) => {
          console.log('Received:', message);
          socket.emit('echo', `Echo: ${message}`); // Use emit to send back an event
        });
    });
 
    console.log(`WebSocket server running on ws://localhost:${SOCKET_PORT}`);
};

