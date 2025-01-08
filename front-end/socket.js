export function socketInit({emitter}){

    const socket = new WebSocket('ws://localhost:2424'); 

    socket.onopen = () => {
        console.log('Connected to socket server');
        // socket.send('Hello, Server!');
    };

    socket.onmessage = (event) => {
        try {
            emitter.emit('on_socket_message', JSON.parse(event.data));
        } catch (error) {
            emitter.emit('on_socket_message', event.data);
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from server');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return socket
}

