#!/usr/bin/env node
/**
 * IR Remote Demo Simulator for Luma Mirror
 *
 * This script simulates IR remote button presses by sending WebSocket messages
 * to connected clients. Use this for demonstrations when physical IR remote is unavailable.
 */

import WebSocket from 'ws';

// Configuration
const WS_PORT = 8765;

// Available actions to simulate
const ACTIONS = [
    'POWER',
    'UP',
    'DOWN',
    'LEFT',
    'RIGHT',
    'OK',
    'BACK',
    'BRIGHTNESS_UP',
    'BRIGHTNESS_DOWN',
    'CHANNEL_UP',
    'CHANNEL_DOWN',
    'EQ'
];

class IRDemoSimulator {
    constructor() {
        this.wss = null;
        this.clients = new Set();
    }

    start() {
        // Create WebSocket server
        this.wss = new WebSocket.Server({ port: WS_PORT });

        this.wss.on('connection', (ws) => {
            console.log('Client connected to IR demo simulator');
            this.clients.add(ws);

            ws.on('close', () => {
                console.log('Client disconnected from IR demo simulator');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });

            // Send initial connection confirmation
            ws.send(JSON.stringify({ type: 'connected', message: 'IR Demo Simulator Ready' }));
        });

        console.log(`WebSocket server listening on port ${WS_PORT}`);
    }

    simulateButtonPress(action) {
        if (!ACTIONS.includes(action)) {
            console.error(`Unknown action: ${action}`);
            console.log(`Available actions: ${ACTIONS.join(', ')}`);
            return;
        }

        console.log(`Simulating button press: ${action}`);

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

    async runDemoSequence() {
        console.log('\n🎬 Starting Luma Mirror Demo Sequence...\n');
        console.log('This demo will:');
        console.log('  1. Complete initial setup (Montreal, Celsius, 12-hour time)');
        console.log('  2. Navigate to settings and rearrange widgets');
        console.log('  3. Move clock widget to center');
        console.log('  4. Power off\n');
        console.log('⏳ Waiting 7 seconds for setup screen to load...\n');

        await this.sleep(7000);

        const sequence = [
            // Setup process starts
            { action: 'OK', delay: 3000, description: 'Start setup' },

            // Brightness adjustment during setup
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Adjust brightness up' },
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Adjust brightness up' },
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Adjust brightness up' },
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Adjust brightness up' },
            { action: 'BRIGHTNESS_DOWN', delay: 500, description: 'Adjust brightness down' },
            { action: 'BRIGHTNESS_DOWN', delay: 500, description: 'Adjust brightness down' },
            { action: 'BRIGHTNESS_DOWN', delay: 3000, description: 'Adjust brightness down' },

            { action: 'OK', delay: 3000, description: 'Confirm brightness' },
            { action: 'OK', delay: 10000, description: 'Continue setup' },

            // City selection (Montreal)
            { action: 'BACK', delay: 500, description: 'Back to city list' },
            { action: 'DOWN', delay: 500, description: 'Navigate to Montreal' },
            { action: 'OK', delay: 500, description: 'Select Montreal' },

            // Navigate to temperature/time settings
            { action: 'RIGHT', delay: 500, description: 'Navigate settings' },
            { action: 'RIGHT', delay: 500, description: 'Navigate settings' },
            { action: 'RIGHT', delay: 500, description: 'Navigate settings' },
            { action: 'RIGHT', delay: 500, description: 'Navigate settings' },
            { action: 'RIGHT', delay: 500, description: 'Navigate settings' },
            { action: 'OK', delay: 500, description: 'Confirm setting' },

            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'RIGHT', delay: 3000, description: 'Select option' },

            { action: 'OK', delay: 3000, description: 'Confirm selection' },
            { action: 'OK', delay: 3000, description: 'Continue' },
            { action: 'OK', delay: 10000, description: 'Complete setup' },

            // Navigate to settings menu
            { action: 'DOWN', delay: 500, description: 'Navigate to settings' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'OK', delay: 6000, description: 'Enter settings' },

            // Find rearrange widgets option
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'OK', delay: 5000, description: 'Select option' },

            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'OK', delay: 5000, description: 'Enter rearrange widgets' },

            { action: 'DOWN', delay: 500, description: 'Select clock widget' },
            { action: 'OK', delay: 2000, description: 'Pick up clock widget' },

            { action: 'BACK', delay: 500, description: 'Navigate' },
            { action: 'BACK', delay: 5000, description: 'Navigate' },

            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'OK', delay: 500, description: 'Confirm' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'OK', delay: 7000, description: 'Place widget in center' },

            // Adjust widget position
            { action: 'EQ', delay: 500, description: 'Fine-tune position' },
            { action: 'EQ', delay: 500, description: 'Fine-tune position' },
            { action: 'UP', delay: 500, description: 'Adjust up' },
            { action: 'UP', delay: 500, description: 'Adjust up' },
            { action: 'RIGHT', delay: 500, description: 'Adjust right' },
            { action: 'RIGHT', delay: 500, description: 'Adjust right' },
            { action: 'RIGHT', delay: 500, description: 'Adjust right' },
            { action: 'OK', delay: 500, description: 'Confirm position' },
            { action: 'DOWN', delay: 500, description: 'Navigate down' },
            { action: 'OK', delay: 5000, description: 'Save changes' },

            // Final brightness adjustments
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Increase brightness' },
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Increase brightness' },
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Increase brightness' },
            { action: 'BRIGHTNESS_UP', delay: 500, description: 'Increase brightness' },
            { action: 'BRIGHTNESS_UP', delay: 5000, description: 'Maximum brightness' },

            // Power off
            { action: 'POWER', delay: 1000, description: 'Power off display' },
        ];

        for (const step of sequence) {
            console.log(`▶ ${step.description} (${step.action})`);
            this.simulateButtonPress(step.action);
            await this.sleep(step.delay);
        }

        console.log('\n✅ Demo sequence complete!\n');
    }

    async runInteractiveMode() {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n🎮 Interactive Mode');
        console.log('===================');
        console.log('Type a button action and press Enter to simulate it.');
        console.log(`Available actions: ${ACTIONS.join(', ')}`);
        console.log('Type "demo" to run automated demo sequence');
        console.log('Type "help" to see this message again');
        console.log('Type "quit" or "exit" to exit\n');

        const promptUser = () => {
            rl.question('Enter action: ', async (input) => {
                const action = input.trim().toUpperCase();

                if (action === 'QUIT' || action === 'EXIT') {
                    console.log('Goodbye!');
                    rl.close();
                    process.exit(0);
                    return;
                }

                if (action === 'HELP') {
                    console.log(`\nAvailable actions: ${ACTIONS.join(', ')}`);
                    console.log('Type "demo" to run automated demo sequence\n');
                    promptUser();
                    return;
                }

                if (action === 'DEMO') {
                    await this.runDemoSequence();
                    promptUser();
                    return;
                }

                if (ACTIONS.includes(action)) {
                    this.simulateButtonPress(action);
                } else {
                    console.log(`Unknown action: ${action}`);
                    console.log(`Available actions: ${ACTIONS.join(', ')}`);
                }

                promptUser();
            });
        };

        promptUser();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        if (this.wss) {
            this.wss.close();
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'interactive';

// Handle graceful shutdown
const simulator = new IRDemoSimulator();

process.on('SIGINT', () => {
    console.log('\nShutting down IR demo simulator...');
    simulator.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down IR demo simulator...');
    simulator.stop();
    process.exit(0);
});

// Start the simulator
simulator.start();

console.log('\n========================================');
console.log('🎬 Luma IR Demo Simulator');
console.log('========================================');
console.log(`WebSocket: ws://localhost:${WS_PORT}`);
console.log('Simulating IR remote button presses...\n');

// Run based on mode
if (mode === 'demo') {
    // Wait a moment for clients to connect, then run demo
    setTimeout(() => {
        if (simulator.clients.size === 0) {
            console.log('⚠️  No clients connected. Waiting for clients...');
            console.log('   (Demo will start automatically when a client connects)\n');

            // Watch for first client connection
            const originalAdd = simulator.clients.add.bind(simulator.clients);
            simulator.clients.add = function(client) {
                const result = originalAdd(client);
                if (simulator.clients.size === 1) {
                    console.log('✓ Client connected! Starting demo in 2 seconds...\n');
                    setTimeout(() => simulator.runDemoSequence(), 2000);
                }
                return result;
            };
        } else {
            simulator.runDemoSequence();
        }
    }, 1000);
} else {
    // Interactive mode
    setTimeout(() => simulator.runInteractiveMode(), 500);
}
