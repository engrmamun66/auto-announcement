const WebSocket = require("ws");

const { SOCKET_PORT } = global.config.env

module.exports = function () {
    const server = new WebSocket.Server({ port: SOCKET_PORT });

    global.socketServer = server; // Make WebSocket server accessible globally

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`WebSocket port ${SOCKET_PORT} is already in use. Retrying...`);
        setTimeout(() => {
          server.close();
          module.exports();
        }, 2000);
      } else {
        console.error('WebSocket server error:', err);
      }
    });

    server.on("connection", (socket) => {
      console.log("Frontend connected to WebSocket", new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    
        socket.on("close", () => {
            console.log("Frontend disconnected from WebSocket", new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        });
        socket.on("message", (message) => {
            const decodedMessage = JSON.parse(message.toString());
            server.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(decodedMessage));
                }
            });
        });
    });

    console.log(`WebSocket server running on ws://localhost:${SOCKET_PORT}`);
};

