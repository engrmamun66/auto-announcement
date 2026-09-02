const RECONNECT_DELAY = 5000 // ms between reconnect attempts

export function socketInit({ emitter }) {
    let socket = null
    let reconnectTimer = null
    let destroyed = false

    function connect() {
        const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost'
        const protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'wss' : 'ws'
        const port = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '' : `:${globalThis.GLOBAL_DATA?.env.PORT}`
        socket = new WebSocket(`${protocol}://${host}${port}`)

        socket.onopen = () => {
            console.log('Connected to socket server')
            clearTimeout(reconnectTimer)
            emitter.emit('is_connected_socket_server', true)
        }

        socket.onmessage = (event) => {
            try {
                let data = JSON.parse(event.data || '{}')
                if (data?.type == 'hi') {
                    emitter.emit('is_connected_socket_server', true)
                } else {
                    emitter.emit('on_socket_message', data)
                }
            } catch (error) {
                console.error('socket.onmessage__error::', {
                    error,
                    data: event.data,
                    typeof: typeof event.data,
                })
            }
        }

        socket.onclose = () => {
            console.warn('Disconnected from socket server')
            emitter.emit('is_connected_socket_server', false)
            if (!destroyed) {
                console.log(`Reconnecting in ${RECONNECT_DELAY / 1000}s...`)
                reconnectTimer = setTimeout(connect, RECONNECT_DELAY)
            }
        }

        socket.onerror = (error) => {
            console.error('WebSocket error:', error)
            // onclose fires automatically after onerror — reconnect handled there
        }
    }

    connect()

    // Return a proxy so callers can still call .send() and .close()
    return {
        send: (data) => socket?.readyState === WebSocket.OPEN && socket.send(data),
        close: () => {
            destroyed = true
            clearTimeout(reconnectTimer)
            socket?.close()
        },
        get readyState() { return socket?.readyState },
    }
}
