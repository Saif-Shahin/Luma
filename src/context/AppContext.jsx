import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [state, setState] = useState({
        // Setup Flow
        setupComplete: false,
        currentSetupStep: 'welcome', // 'welcome', 'remote-calibration', 'setup-prompt', 'calendar', 'location', 'time-format', 'temp-format', 'complete'
        remoteCalibrationStep: 0, // 0-4 for UP, RIGHT, DOWN, LEFT, OK

        // User Preferences
        location: {
            city: '',
            country: '',
            lat: null,
            lon: null,
        },
        timeFormat: '12', // '12' or '24'
        tempUnit: 'C', // 'C' or 'F'
        brightness: 50, // 0-100

        // Calendar
        calendarConnected: false,
        calendarType: null, // 'google' or 'apple'
        calendarEvents: [],

        // Weather
        weatherData: null,
        lastWeatherUpdate: null,

        // Widgets
        activeWidgets: {
            time: true,
            weather: true,
            calendar: true,
        },

        // Remote State
        remoteConnected: true,
        currentFocus: null, // tracks which element is focused for navigation
        currentScreen: 'setup', // 'setup', 'mirror', 'settings'

        // Settings
        settingsMenuIndex: 0, // currently selected menu item
        inSettingsSubmenu: false,

        // Display
        displayOn: true,
    });

    // Update state helper
    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Handle remote button actions
    const handleRemoteAction = (button) => {
        console.log('Remote action:', button, 'Current screen:', state.currentScreen);

        // Handle based on current screen
        if (state.currentScreen === 'setup') {
            handleSetupNavigation(button);
        } else if (state.currentScreen === 'mirror') {
            handleMirrorNavigation(button);
        } else if (state.currentScreen === 'settings') {
            handleSettingsNavigation(button);
        }

        // Global actions
        if (button === 'POWER') {
            updateState({ displayOn: !state.displayOn });
        } else if (button === 'BRIGHTNESS_UP') {
            updateState({ brightness: Math.min(100, state.brightness + 10) });
        } else if (button === 'BRIGHTNESS_DOWN') {
            updateState({ brightness: Math.max(0, state.brightness - 10) });
        }
    };

    const handleSetupNavigation = (button) => {
        const { currentSetupStep, remoteCalibrationStep } = state;

        if (currentSetupStep === 'remote-calibration') {
            const expectedButtons = ['UP', 'RIGHT', 'DOWN', 'LEFT', 'OK'];
            if (button === expectedButtons[remoteCalibrationStep]) {
                const nextStep = remoteCalibrationStep + 1;
                if (nextStep >= 5) {
                    // Calibration complete
                    updateState({
                        currentSetupStep: 'setup-prompt',
                        remoteCalibrationStep: 0,
                    });
                } else {
                    updateState({ remoteCalibrationStep: nextStep });
                }
            }
        } else if (currentSetupStep === 'setup-prompt') {
            if (button === 'OK') {
                // User selected current option (Yes/Later)
                if (state.currentFocus === 'yes' || state.currentFocus === null) {
                    updateState({ currentSetupStep: 'calendar' });
                } else {
                    // Skip setup
                    updateState({
                        setupComplete: true,
                        currentScreen: 'mirror',
                    });
                }
            } else if (button === 'LEFT' || button === 'RIGHT') {
                // Toggle between Yes/Later
                updateState({
                    currentFocus: state.currentFocus === 'yes' ? 'later' : 'yes',
                });
            }
        }
        // Add more setup step handlers as we build them
    };

    const handleMirrorNavigation = (button) => {
        // Handle navigation on main mirror display
        if (button === 'OK' && state.currentFocus === 'settings-icon') {
            updateState({ currentScreen: 'settings' });
        }
        // Add arrow key navigation to move focus around mirror widgets
    };

    const handleSettingsNavigation = (button) => {
        if (button === 'BACK') {
            if (state.inSettingsSubmenu) {
                updateState({ inSettingsSubmenu: false });
            } else {
                updateState({ currentScreen: 'mirror' });
            }
        } else if (button === 'UP') {
            updateState({
                settingsMenuIndex: Math.max(0, state.settingsMenuIndex - 1),
            });
        } else if (button === 'DOWN') {
            updateState({
                settingsMenuIndex: Math.min(6, state.settingsMenuIndex + 1), // 7 menu items (0-6)
            });
        } else if (button === 'OK') {
            // Handle menu selection
            handleSettingsMenuSelect(state.settingsMenuIndex);
        }
    };

    const handleSettingsMenuSelect = (index) => {
        const menuItems = [
            'reconnect-remote',
            'calendar',
            'time-format',
            'temperature-unit',
            'brightness',
            'widgets',
            'exit',
        ];

        const selected = menuItems[index];
        console.log('Settings menu selected:', selected);

        if (selected === 'exit') {
            updateState({ currentScreen: 'mirror' });
        } else {
            updateState({ inSettingsSubmenu: true });
            // Handle other menu items as we build them
        }
    };

    // Navigate to next setup step
    const nextSetupStep = () => {
        const steps = [
            'welcome',
            'remote-calibration',
            'setup-prompt',
            'calendar',
            'location',
            'time-format',
            'temp-format',
            'complete',
        ];
        const currentIndex = steps.indexOf(state.currentSetupStep);
        if (currentIndex < steps.length - 1) {
            updateState({ currentSetupStep: steps[currentIndex + 1] });
        } else {
            updateState({
                setupComplete: true,
                currentScreen: 'mirror',
            });
        }
    };

    const value = {
        state,
        updateState,
        handleRemoteAction,
        nextSetupStep,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}