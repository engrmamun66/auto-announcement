 

module.exports = function ({ app } = {}) {
    const http = require('http');
    const { Server } = require("socket.io"); 
    
    const { SOCKET_PORT } = global.config.env

    // --- Start: socket.io Integration ---
    const server = http.createServer(app); // Create HTTP server from Express app
    const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity. Adjust as needed for security.
        methods: ["GET", "POST"]
    }
    });

    global.socketIo = io; // Make socket.io instance accessible globally

    io.on('connection', (socket) => {
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

