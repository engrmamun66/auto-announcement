export function socketInit({emitter}){

    const socket = new WebSocket(`ws://localhost:${globalThis.GLOBAL_DATA?.env.SOCKET_PORT}`); 

    socket.onopen = () => {
        console.log('Connected to socket server');
        // socket.send('Hello, Server!');
        emitter.emit('toaster-success', { message: 'Connecte to socket server' })
        emitter.emit('is_connected_socket_server', true)

    };

    socket.onmessage = (event) => {
        try {
            let data = JSON.parse(event.data || '{}')
            if(data?.type == 'hi'){
                emitter.emit('is_connected_socket_server', true)
            } else {
                emitter.emit('on_socket_message', data);
            }
        } catch (error) {
            console.error('socket.onmessage__error::', {
                error,
                data: event.data,
                typeof: typeof event.data,
            });
        }
    };

    socket.onclose = () => {
        console.log('Disconnected socket from server');
        // emitter.emit('toaster-error', { message: 'Disconnected socket from server' })
        console.warn('Disconnected socket from server')
        emitter.emit('is_connected_socket_server', false)
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return socket
}

