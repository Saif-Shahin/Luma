#!/usr/bin/env node
/**
 * IR Remote Control Server for Luma Mirror
 *
 * This server listens to LIRC IR remote events and broadcasts them
 * to connected clients via WebSocket.
 */

const WebSocket = require('ws');
const { spawn } = require('child_process');
const { exec } = require('child_process');

// Configuration
const WS_PORT = 8765;
const LIRC_SOCKET = '/var/run/lirc/lircd';

// IR button to Luma action mapping
const BUTTON_MAP = {
  'KEY_POWER': 'POWER',
  'KEY_UP': 'UP',
  'KEY_DOWN': 'DOWN',
  'KEY_LEFT': 'LEFT',
  'KEY_RIGHT': 'RIGHT',
  'KEY_ENTER': 'OK',
  'KEY_OK': 'OK',
  'KEY_BACK': 'BACK',
  'KEY_EXIT': 'BACK',
  'KEY_CHANNELUP': 'CHANNEL_UP',
  'KEY_CHANNELDOWN': 'CHANNEL_DOWN',
  'KEY_VOLUMEUP': 'BRIGHTNESS_UP',
  'KEY_VOLUMEDOWN': 'BRIGHTNESS_DOWN',
  'KEY_0': 'BRIGHTNESS_DOWN',
  'KEY_1': 'BRIGHTNESS_UP',
};

class IRRemoteServer {
  constructor() {
    this.wss = null;
    this.irProcess = null;
    this.clients = new Set();
  }

  start() {
    // Create WebSocket server
    this.wss = new WebSocket.Server({ port: WS_PORT });

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

            // Ignore repeat presses to avoid flooding
            if (button && repeat === 0) {
              this.handleIRButton(button);
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

  handleIRButton(button) {
    const action = BUTTON_MAP[button];

    if (action) {
      console.log(`IR Button: ${button} -> Action: ${action}`);
      this.broadcastAction(action);
    } else {
      console.log(`Unknown IR button: ${button}`);
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
