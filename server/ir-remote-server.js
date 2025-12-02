#!/usr/bin/env node
/**
 * IR Remote Control Server for Luma Mirror
 *
 * This server listens to LIRC IR remote events and broadcasts them
 * to connected clients via WebSocket.
 */

import WebSocket, { WebSocketServer } from 'ws';
import { spawn, exec } from 'child_process';

// Configuration
const WS_PORT = 8765;
const LIRC_SOCKET = '/var/run/lirc/lircd';

// IR button to Luma action mapping
// Supports short press and long press (2 seconds) actions
const BUTTON_MAP = {
    // Core navigation
    'KEY_POWER': 'POWER',
    'KEY_UP': 'UP',
    'KEY_DOWN': 'DOWN',
    'KEY_LEFT': 'LEFT',
    'KEY_RIGHT': 'RIGHT',
    'KEY_ENTER': 'OK',
    'KEY_OK': 'OK',
    'KEY_PLAY': 'OK',          // Alternative OK for media remotes
    'KEY_PLAYPAUSE': 'OK',     // Alternative OK for media remotes

    // Brightness controls
    'KEY_VOLUMEUP': 'BRIGHTNESS_UP',
    'KEY_VOLUMEDOWN': 'BRIGHTNESS_DOWN',
    'KEY_0': 'BRIGHTNESS_DOWN',
    'KEY_1': 'BRIGHTNESS_UP',

    // Special functions
    'KEY_EQUAL': 'EQ',
};

// Long press actions (hold for 2 seconds)
// These override the normal button actions when held
const LONG_PRESS_MAP = {
    'KEY_LEFT': 'BACK',        // Hold LEFT for 2s → BACK
    'KEY_UP': 'CHANNEL_UP',    // Hold UP for 2s → CHANNEL_UP
    'KEY_DOWN': 'CHANNEL_DOWN', // Hold DOWN for 2s → CHANNEL_DOWN
};

// Long press threshold (in repeat counts)
// LIRC typically sends ~10 repeats per second, so 20 ≈ 2 seconds
const LONG_PRESS_THRESHOLD = 20;

class IRRemoteServer {
    constructor() {
        this.wss = null;
        this.irProcess = null;
        this.clients = new Set();

        // Track button press state for long-press detection
        this.buttonPressState = new Map(); // button -> { startTime, repeatCount, longPressFired, timeout }
        this.releaseTimeout = 200; // ms - time without repeat events = button released
    }

    start() {
        // Create WebSocket server
        this.wss = new WebSocketServer({ port: WS_PORT });

        this.wss.on('connection', (ws) => {
            console.log('Client connected to IR remote server');
            this.clients.add(ws);

            ws.on('close', () => {
                console.log('Client disconnected from IR remote server');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });

            // Send initial connection confirmation
            ws.send(JSON.stringify({ type: 'connected', message: 'IR Remote Server Ready' }));
        });

        console.log(`WebSocket server listening on port ${WS_PORT}`);

        // Start IR listener
        this.startIRListener();
    }

    startIRListener() {
        console.log('Starting IR remote listener...');

        // Check if LIRC is available
        exec('which irw', (error) => {
            if (error) {
                console.warn('WARNING: irw command not found. IR remote will not work.');
                console.warn('Install LIRC on your Raspberry Pi: sudo apt-get install lirc');
                console.warn('Server will continue to run for testing purposes.');
                return;
            }

            // Spawn irw process to listen to LIRC
            this.irProcess = spawn('irw', [LIRC_SOCKET]);

            this.irProcess.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');

                lines.forEach((line) => {
                    if (line.length > 5) {
                        // Parse LIRC output format: <code> <repeat> <button> <remote>
                        const parts = line.trim().split(/\s+/);
                        const button = parts[2]; // Button name (e.g., KEY_UP)
                        const repeat = parseInt(parts[1], 16); // Repeat count

                        if (button) {
                            this.handleIRButton(button, repeat);
                        }
                    }
                });
            });

            this.irProcess.stderr.on('data', (data) => {
                console.error(`IR Error: ${data}`);
            });

            this.irProcess.on('close', (code) => {
                console.log(`IR process exited with code ${code}`);
            });

            console.log('IR listener started successfully');
        });
    }

    handleIRButton(button, repeat) {
        // Check if this button supports long press
        const hasLongPress = LONG_PRESS_MAP.hasOwnProperty(button);
        const normalAction = BUTTON_MAP[button];

        if (repeat === 0) {
            // Initial button press
            if (hasLongPress) {
                // Track this press for potential long-press detection
                const state = {
                    startTime: Date.now(),
                    repeatCount: 0,
                    longPressFired: false,
                    timeout: null,
                };

                // Set up release timeout
                state.timeout = setTimeout(() => {
                    // Button released - fire short press if long press wasn't fired
                    if (!state.longPressFired) {
                        console.log(`IR Button SHORT PRESS: ${button} -> Action: ${normalAction}`);
                        this.broadcastAction(normalAction);
                    }
                    this.buttonPressState.delete(button);
                }, this.releaseTimeout);

                this.buttonPressState.set(button, state);
                // Don't fire action yet - wait to see if it's a long press
            } else if (normalAction) {
                // No long press mapping, fire immediately
                console.log(`IR Button: ${button} -> Action: ${normalAction}`);
                this.broadcastAction(normalAction);
            } else {
                console.log(`Unknown IR button: ${button}`);
            }
        } else {
            // Button is being held (repeat > 0)
            const state = this.buttonPressState.get(button);

            if (state && hasLongPress) {
                // Clear the release timeout since button is still held
                if (state.timeout) {
                    clearTimeout(state.timeout);
                }

                // Reset release timeout
                state.timeout = setTimeout(() => {
                    // Button released - don't fire short press since we already handled it
                    this.buttonPressState.delete(button);
                }, this.releaseTimeout);

                state.repeatCount = repeat;

                // Check if long press threshold reached
                if (repeat >= LONG_PRESS_THRESHOLD && !state.longPressFired) {
                    // Fire long press action
                    const longPressAction = LONG_PRESS_MAP[button];
                    console.log(`IR Button LONG PRESS: ${button} (${repeat} repeats) -> Action: ${longPressAction}`);
                    this.broadcastAction(longPressAction);
                    state.longPressFired = true;
                }
            }
        }
    }

    broadcastAction(action) {
        const message = JSON.stringify({
            type: 'button_press',
            action: action,
            timestamp: Date.now()
        });

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    stop() {
        if (this.irProcess) {
            this.irProcess.kill();
        }
        if (this.wss) {
            this.wss.close();
        }
    }
}

// Handle graceful shutdown
const server = new IRRemoteServer();

process.on('SIGINT', () => {
    console.log('\nShutting down IR remote server...');
    server.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down IR remote server...');
    server.stop();
    process.exit(0);
});

// Start the server
server.start();

console.log('\n=================================');
console.log('🎮 Luma IR Remote Server Running');
console.log('=================================');
console.log(`WebSocket: ws://localhost:${WS_PORT}`);
console.log('Waiting for IR remote input...\n');
