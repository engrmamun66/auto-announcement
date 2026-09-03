const WebSocket = require("ws");

module.exports = function (httpServer) {
    const wsServer = new WebSocket.Server({ server: httpServer, perMessageDeflate: false });

    global.socketServer = wsServer;

    wsServer.on("error", () => {});

    wsServer.on("connection", (socket) => {
    //   console.log("Frontend connected to WebSocket", new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));

        socket.on("error", () => {});
        socket.on("close", () => {
            // console.log("Frontend disconnected from WebSocket", new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        });
        socket.on("message", (message) => {
            const decodedMessage = JSON.parse(message.toString());
            wsServer.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(decodedMessage));
                }
            });
        });
    });

    return wsServer;
};

