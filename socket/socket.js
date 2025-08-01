const WebSocket = require("ws");

const { SOCKET_PORT } = global.config.env

module.exports = function () {
    const server = new WebSocket.Server({ port: SOCKET_PORT });

    global.socketServer = server; // Make WebSocket server accessible globally
    
    server.on("connection", (socket) => {
      console.log("Frontend connected to WebSocket");
    
        socket.on("close", () => {
            console.log("Frontend disconnected from WebSocket");
        });
        socket.on("message", (message) => {
            console.log("Received:", message);
            socket.send("Echo: " + message);
        });
    });

    console.log(`WebSocket server running on ws://localhost:${SOCKET_PORT}`);
};

