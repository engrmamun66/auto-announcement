export function socketInit({emitter}){

    const socket = new WebSocket(`ws://localhost:${globalThis.GLOBAL_DATA?.env.SOCKET_PORT}`); 

    socket.onopen = () => {
        console.log('Connected to socket server');
        // socket.send('Hello, Server!');
    };

    socket.onmessage = (event) => {
        try {
            emitter.emit('on_socket_message', JSON.parse(event.data || '{}'));
        } catch (error) {
            console.error('socket.onmessage__error::', {
                error,
                data: event.data,
                typeof: typeof event.data,
            });
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

