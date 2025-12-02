/**
 * Custom React hook for IR Remote Control integration
 *
 * Connects to the IR remote WebSocket server and triggers
 * remote actions when physical IR remote buttons are pressed.
 *
 * If WebSocket connection fails (e.g., on deployed site),
 * automatically runs client-side demo mode.
 */

import { useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:8765';
const RECONNECT_DELAY = 3000; // 3 seconds
const DEMO_START_DELAY = 4000; // 4 seconds - wait for setup screen to load
const DEMO_TRIGGER_TIMEOUT = 3000; // 3 seconds - if can't connect, start demo

// Demo sequence matching the server simulator
const DEMO_SEQUENCE = [
    // Setup process starts
    { action: 'OK', delay: 3000 },

    // Brightness adjustment during setup
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_DOWN', delay: 500 },
    { action: 'BRIGHTNESS_DOWN', delay: 500 },
    { action: 'BRIGHTNESS_DOWN', delay: 3000 },

    { action: 'OK', delay: 3000 },
    { action: 'OK', delay: 10000 },

    // City selection (Montreal)
    { action: 'BACK', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 500 },

    // Navigate to temperature/time settings
    { action: 'RIGHT', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'OK', delay: 500 },

    { action: 'DOWN', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'RIGHT', delay: 3000 },

    { action: 'OK', delay: 3000 },
    { action: 'OK', delay: 3000 },
    { action: 'OK', delay: 10000 },

    // Navigate to settings menu
    { action: 'DOWN', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 10000 },

    // Find rearrange widgets option
    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 5000 },

    // { action: 'DOWN', delay: 500 },
    // { action: 'DOWN', delay: 500 },
    // { action: 'DOWN', delay: 500 },
    // { action: 'OK', delay: 5000 },

    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 2000 },

    { action: 'BACK', delay: 500 },
    { action: 'BACK', delay: 5000 },

    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 7000 },

    // Adjust widget position
    { action: 'EQ', delay: 500 },
    { action: 'EQ', delay: 500 },
    { action: 'UP', delay: 500 },
    { action: 'UP', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'RIGHT', delay: 500 },
    { action: 'OK', delay: 500 },
    { action: 'DOWN', delay: 500 },
    { action: 'OK', delay: 5000 },

    // Final brightness adjustments
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 500 },
    { action: 'BRIGHTNESS_UP', delay: 5000 },

    // Power off
    { action: 'POWER', delay: 3000 },

    // Power back on
    { action: 'POWER', delay: 2000 },

    // Return to main screen
    { action: 'BACK', delay: 500 },
    { action: 'BACK', delay: 1000 },
];

export function useIRRemote(handleRemoteAction) {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const demoTimeoutRef = useRef(null);
    const fallbackTimeoutRef = useRef(null);
    const demoRunningRef = useRef(false);
    const connectionAttemptedRef = useRef(false);
    const handlerRef = useRef(handleRemoteAction);

    // Keep handler ref up to date
    useEffect(() => {
        handlerRef.current = handleRemoteAction;
    }, [handleRemoteAction]);

    useEffect(() => {
        let mounted = true;

        // Check if demo mode is forced via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const forceDemoMode = urlParams.get('demo') === 'true';

        // Run demo sequence client-side
        async function runDemoSequence() {
            if (demoRunningRef.current) return;

            demoRunningRef.current = true;
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff00ff; font-weight: bold');
            console.log('%c🎬 DEMO MODE ACTIVATED!', 'color: #ff00ff; font-size: 20px; font-weight: bold; background: #000');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff00ff; font-weight: bold');
            console.log('%c⏳ Waiting 4 seconds for setup screen to load...', 'color: #ffff00; font-size: 14px');
            console.log('BEFORE sleep - mounted:', mounted, 'demoRunning:', demoRunningRef.current);

            // Wait for setup screen to load
            await sleep(DEMO_START_DELAY);

            console.log('AFTER sleep - mounted:', mounted, 'demoRunning:', demoRunningRef.current);

            console.log('%c🔍 DEBUG: About to run demo sequence', 'color: yellow; font-size: 14px');
            console.log('Sequence length:', DEMO_SEQUENCE.length);
            console.log('mounted:', mounted);
            console.log('demoRunningRef.current:', demoRunningRef.current);

            // Run through demo sequence
            for (let i = 0; i < DEMO_SEQUENCE.length; i++) {
                const step = DEMO_SEQUENCE[i];

                console.log('%c🔍 Loop iteration ' + i, 'color: cyan');
                console.log('mounted:', mounted, 'demoRunningRef.current:', demoRunningRef.current);

                if (!mounted || !demoRunningRef.current) {
                    console.log('%c❌ Breaking loop - mounted or demoRunning is false', 'color: red; font-size: 14px');
                    break;
                }

                console.log('%c🎮 DEMO ACTION [' + (i + 1) + '/' + DEMO_SEQUENCE.length + ']: ' + step.action,
                    'color: #00ff00; font-size: 14px; font-weight: bold; background: #001100; padding: 4px');
                handlerRef.current(step.action);

                console.log('%c⏱️  Delay: ' + step.delay + 'ms (' + (step.delay / 1000) + 's)',
                    'color: #ffaa00; font-size: 12px; font-style: italic');
                await sleep(step.delay);
            }

            console.log('%c🔍 DEBUG: Loop completed', 'color: yellow; font-size: 14px');

            console.log('%c✅ DEMO SEQUENCE COMPLETE!', 'color: #00ff00; font-size: 18px; font-weight: bold; background: #003300; padding: 8px');
            demoRunningRef.current = false;
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

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
                    connectionAttemptedRef.current = true;
                    // Cancel demo mode if connected successfully
                    if (demoTimeoutRef.current) {
                        clearTimeout(demoTimeoutRef.current);
                        demoTimeoutRef.current = null;
                    }
                    if (fallbackTimeoutRef.current) {
                        clearTimeout(fallbackTimeoutRef.current);
                        fallbackTimeoutRef.current = null;
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.type === 'button_press' && data.action) {
                            console.log(`🎮 IR Remote: ${data.action}`);
                            handlerRef.current(data.action);
                        } else if (data.type === 'connected') {
                            console.log(`📡 ${data.message}`);
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);

                    // If first connection fails, trigger demo mode
                    if (!connectionAttemptedRef.current && !demoRunningRef.current && !demoTimeoutRef.current) {
                        console.log('⚠️ Cannot connect to IR server - starting demo mode');
                        demoTimeoutRef.current = setTimeout(() => {
                            runDemoSequence();
                        }, 1000);
                    }
                };

                ws.onclose = () => {
                    console.log('Disconnected from IR remote server');
                    wsRef.current = null;

                    // If never connected successfully, trigger demo mode
                    if (!connectionAttemptedRef.current && !demoRunningRef.current && !demoTimeoutRef.current) {
                        console.log('⚠️ Cannot connect to IR server - starting demo mode');
                        demoTimeoutRef.current = setTimeout(() => {
                            runDemoSequence();
                        }, 1000);
                    } else if (connectionAttemptedRef.current && mounted) {
                        // If was connected before, try to reconnect
                        console.log(`Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);
                        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
                    }
                };
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);

                // If can't create connection, trigger demo mode
                if (!connectionAttemptedRef.current && !demoRunningRef.current && !demoTimeoutRef.current) {
                    console.log('⚠️ Cannot connect to IR server - starting demo mode');
                    demoTimeoutRef.current = setTimeout(() => {
                        runDemoSequence();
                    }, 1000);
                } else if (mounted) {
                    // Retry connection after delay
                    reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
                }
            }
        }

        // Always start demo mode automatically
        console.log('🎯 Auto-starting demo mode...');
        setTimeout(() => {
            runDemoSequence();
        }, 500); // Small delay to let app initialize

        // Optional: Try to connect to IR server in background (doesn't affect demo)
        connect();

        // Cleanup on unmount
        return () => {
            mounted = false;
            demoRunningRef.current = false;

            if (fallbackTimeoutRef.current) {
                clearTimeout(fallbackTimeoutRef.current);
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (demoTimeoutRef.current) {
                clearTimeout(demoTimeoutRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []); // Empty dependency array - effect runs once on mount

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        isDemoMode: demoRunningRef.current
    };
}
