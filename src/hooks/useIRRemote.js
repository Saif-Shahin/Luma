/**
 * Custom React hook for IR Remote Control integration
 *
 * Connects to the IR remote WebSocket server and triggers
 * remote actions when physical IR remote buttons are pressed.
 */

import { useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:8765';
const RECONNECT_DELAY = 3000; // 3 seconds

export function useIRRemote(handleRemoteAction) {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        function connect() {
            // Skip if component unmounted or already connected
            if (!mounted || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
                return;
            }

            console.log('Connecting to IR remote server...');

            try {
                const ws = new WebSocket(WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('✅ Connected to IR remote server');
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.type === 'button_press' && data.action) {
                            console.log(`🎮 IR Remote: ${data.action}`);
                            handleRemoteAction(data.action);
                        } else if (data.type === 'connected') {
                            console.log(`📡 ${data.message}`);
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                ws.onclose = () => {
                    console.log('Disconnected from IR remote server');
                    wsRef.current = null;

                    // Attempt to reconnect after delay
                    if (mounted) {
                        console.log(`Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);
                        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
                    }
                };
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);

                // Retry connection after delay
                if (mounted) {
                    reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
                }
            }
        }

        // Initial connection
        connect();

        // Cleanup on unmount
        return () => {
            mounted = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [handleRemoteAction]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN
    };
}