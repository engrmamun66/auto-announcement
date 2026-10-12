const WebSocket = require("ws");

function parseUserAgent(ua = '') {
    const isTablet = /iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || /Tablet/i.test(ua);
    const isMobile = !isTablet && /Mobi|Android|iPhone|iPod/i.test(ua);
    const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

    let os = 'Unknown';
    if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua)) {
        const m = ua.match(/Mac OS X ([\d_]+)/);
        os = 'macOS' + (m ? ' ' + m[1].replace(/_/g, '.') : '');
    }
    else if (/Android/i.test(ua)) {
        const m = ua.match(/Android\s([\d.]+)/);
        os = 'Android' + (m ? ' ' + m[1] : '');
    }
    else if (/iPhone|iPad|iPod/i.test(ua)) {
        const m = ua.match(/OS\s([\d_]+)/);
        os = 'iOS' + (m ? ' ' + m[1].replace(/_/g, '.') : '');
    }
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Unknown';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
    else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

    return { os, browser, deviceType };
}

module.exports = function (httpServer) {
    const wsServer = new WebSocket.Server({ server: httpServer, perMessageDeflate: false });

    global.socketServer = wsServer;
    global.connectedDevices = new Map();

    let clientIdCounter = 0;

    wsServer.on("error", () => {});

    wsServer.on("connection", (socket, req) => {
    //   console.log("Frontend connected to WebSocket", new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));

        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || '';
        const { os, browser, deviceType } = parseUserAgent(userAgent);

        const deviceInfo = {
            id: ++clientIdCounter,
            ip,
            userAgent,
            os,
            browser,
            deviceType,
            connectedAt: new Date().toISOString(),
        };
        global.connectedDevices.set(socket, deviceInfo);

        socket.isAlive = true;
        socket.on("pong", () => { socket.isAlive = true; });

        socket.on("error", () => {});
        socket.on("close", () => {
            // console.log("Frontend disconnected from WebSocket", new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
            global.connectedDevices.delete(socket);
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

    // A closed tab/browser normally fires "close" right away, but an abrupt network
    // drop (crash, force-quit, connection lost) may never fire it — ping/pong catches
    // those so the connected-devices list doesn't accumulate ghost entries.
    const heartbeat = setInterval(() => {
        wsServer.clients.forEach((socket) => {
            if (socket.isAlive === false) {
                global.connectedDevices.delete(socket);
                return socket.terminate();
            }
            socket.isAlive = false;
            socket.ping();
        });
    }, 30000);

    wsServer.on("close", () => clearInterval(heartbeat));

    return wsServer;
};

