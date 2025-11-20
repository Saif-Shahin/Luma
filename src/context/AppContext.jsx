import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { connectGoogleCalendar, syncCalendarEvents } from '../utils/calendarAPI';

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
        calendarEvents: [
            { id: '1', title: 'Team meeting', time: '2:00 PM', type: 'event', completed: false },
            { id: '2', title: 'Grocery shopping', type: 'todo', completed: false },
            { id: '3', title: 'Dentist appointment', time: '4:30 PM', type: 'event', completed: false },
            { id: '4', title: 'Call with client', time: '5:15 PM', type: 'event', completed: false },
        ],
        calendarAuthenticating: false, // Whether device code auth is in progress
        deviceCodeData: null, // Device code data for display

        // Weather
        weatherData: null,
        lastWeatherUpdate: null,

        // Widgets
        activeWidgets: {
            time: true,
            weather: true,
            calendar: true,
        },
        widgetPositions: {
            time: { x: 5, y: 5 }, // Top-left corner (left, top positioning)
            weather: { x: 95, y: 5 }, // Top-right corner (right-aligned with translateX(-100%))
            calendar: { x: 5, y: 95 }, // Bottom-left corner (bottom-aligned with translateY(-100%))
        },

        // Remote State
        remoteConnected: true,
        currentFocus: null, // tracks which element is focused for navigation: 'settings-icon', 'calendar-0', 'calendar-1', etc.
        currentScreen: 'setup', // 'setup', 'mirror', 'settings'
        focusedCalendarIndex: -1, // -1 = no calendar item focused

        // Settings
        settingsMenuIndex: 0, // currently selected menu item
        inSettingsSubmenu: false,
        displayElementsIndex: 0, // currently selected display element (0 = time, 1 = weather, 2 = calendar)
        rearrangeWidgetIndex: 0, // currently selected widget in rearrange screen (0 = time, 1 = weather, 2 = calendar)

        // Display
        displayOn: true,

        // On-screen keyboard
        keyboardActive: false,
        keyboardInput: '',
        keyboardCursorRow: 0,
        keyboardCursorCol: 0,
        selectedCityIndex: 0, // Index of selected city from filtered list

        // Calendar setup
        calendarFocusedOption: 0, // 0 = Google, 1 = Apple, 2 = Skip
    });

    // Auto-hide timer ref
    const hideTimerRef = useRef(null);

    // Update state helper
    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));

        // Reset auto-hide timer when focus changes
        if (updates.currentFocus !== undefined) {
            resetHideTimer();
        }
    };

    // Reset the 7-second auto-hide timer
    const resetHideTimer = () => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
            setState(prev => ({
                ...prev,
                currentFocus: null,
                focusedCalendarIndex: -1,
            }));
        }, 7000); // 7 seconds
    };

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    // Toggle calendar item completion
    const toggleCalendarItem = (itemId) => {
        setState(prev => ({
            ...prev,
            calendarEvents: prev.calendarEvents.map(event =>
                event.id === itemId
                    ? { ...event, completed: !event.completed }
                    : event
            ),
        }));
    };

    // Handle remote button actions
    const handleRemoteAction = (button) => {
        console.log('Remote action:', button, 'Current screen:', state.currentScreen, 'Focus:', state.currentFocus);

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
        const { currentSetupStep, remoteCalibrationStep, calendarFocusedOption } = state;

        // Handle BACK button to go to previous step
        if (button === 'BACK' && currentSetupStep !== 'welcome') {
            // If currently authenticating, cancel authentication
            if (state.calendarAuthenticating) {
                updateState({
                    calendarAuthenticating: false,
                    deviceCodeData: null,
                });
                return;
            }
            previousSetupStep();
            return;
        }

        if (currentSetupStep === 'remote-calibration') {
            const expectedButtons = ['UP', 'RIGHT', 'DOWN', 'LEFT', 'OK', 'CHANNEL_UP', 'CHANNEL_DOWN', 'BRIGHTNESS_UP', 'BRIGHTNESS_DOWN'];
            if (button === expectedButtons[remoteCalibrationStep]) {
                const nextStep = remoteCalibrationStep + 1;
                if (nextStep >= 9) {
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
                        currentFocus: 'settings-icon', // Start with settings icon focused
                    });
                }
            } else if (button === 'LEFT' || button === 'RIGHT') {
                // Toggle between Yes/Later
                updateState({
                    currentFocus: state.currentFocus === 'yes' ? 'later' : 'yes',
                });
            }
        } else if (currentSetupStep === 'calendar') {
            // Calendar setup navigation
            if (button === 'UP') {
                updateState({
                    calendarFocusedOption: Math.max(0, calendarFocusedOption - 1),
                });
            } else if (button === 'DOWN') {
                updateState({
                    calendarFocusedOption: Math.min(1, calendarFocusedOption + 1),
                });
            } else if (button === 'OK') {
                // Handle calendar selection
                if (calendarFocusedOption === 1) {
                    // Skip
                    nextSetupStep();
                } else {
                    // Connect to Google Calendar using Device Code Flow
                    updateState({ calendarAuthenticating: true });

                    (async () => {
                        try {
                            const result = await connectGoogleCalendar((codeData) => {
                                // Callback when device code is ready
                                updateState({
                                    deviceCodeData: codeData,
                                });
                            });

                            // Update state with connection result and events
                            updateState({
                                calendarConnected: result.connected,
                                calendarType: result.type,
                                calendarEvents: result.events,
                                calendarAuthenticating: false,
                                deviceCodeData: null,
                            });

                            // Auto-advance after successful connection
                            setTimeout(() => {
                                nextSetupStep();
                            }, 2000);
                        } catch (error) {
                            console.error('Calendar connection failed:', error);
                            // Still advance even if connection fails (using mock data)
                            updateState({
                                calendarConnected: true,
                                calendarType: 'google',
                                calendarAuthenticating: false,
                                deviceCodeData: null,
                            });
                            setTimeout(() => {
                                nextSetupStep();
                            }, 1000);
                        }
                    })();
                }
            }
        } else if (currentSetupStep === 'location') {
            handleKeyboardNavigation(button);
        } else if (currentSetupStep === 'time-format') {
            // Time format selection
            if (button === 'LEFT' || button === 'RIGHT') {
                // Toggle between 12-hour and 24-hour
                updateState({ timeFormat: state.timeFormat === '12' ? '24' : '12' });
            } else if (button === 'OK') {
                // Confirm and advance to next step
                nextSetupStep();
            }
        } else if (currentSetupStep === 'temp-format') {
            // Temperature unit selection
            if (button === 'LEFT' || button === 'RIGHT') {
                // Toggle between Celsius and Fahrenheit
                updateState({ tempUnit: state.tempUnit === 'C' ? 'F' : 'C' });
            } else if (button === 'OK') {
                // Confirm and advance to next step
                nextSetupStep();
            }
        }
    };

    const handleKeyboardNavigation = (button) => {
        const { keyboardActive, keyboardCursorRow, keyboardCursorCol, keyboardInput, selectedCityIndex } = state;

        if (!keyboardActive) {
            // Activate keyboard on first interaction
            updateState({ keyboardActive: true });
            return;
        }

        // Mock cities for validation
        const mockCities = [
            { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
            { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
            { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
            { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
            { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
            { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
        ];

        const filteredCities = keyboardInput.trim()
            ? mockCities.filter(c => c.name.toLowerCase().includes(keyboardInput.toLowerCase()))
            : [];

        // Keyboard layout
        const keyboard = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '⌫'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?'],
            ['SPACE', 'DONE'],
        ];

        // When on DONE button and cities are available, allow city navigation with UP/DOWN
        const isOnDoneButton = keyboardCursorRow === 3 && keyboardCursorCol === 1;

        if (button === 'UP') {
            if (isOnDoneButton && filteredCities.length > 0) {
                // Navigate through cities
                updateState({
                    selectedCityIndex: Math.max(0, selectedCityIndex - 1),
                });
            } else {
                updateState({
                    keyboardCursorRow: Math.max(0, keyboardCursorRow - 1),
                });
            }
        } else if (button === 'DOWN') {
            if (isOnDoneButton && filteredCities.length > 0) {
                // Navigate through cities
                updateState({
                    selectedCityIndex: Math.min(filteredCities.length - 1, selectedCityIndex + 1),
                });
            } else {
                updateState({
                    keyboardCursorRow: Math.min(3, keyboardCursorRow + 1),
                });
            }
        } else if (button === 'LEFT') {
            if (keyboardCursorRow === 3) {
                updateState({ keyboardCursorCol: 0 }); // SPACE
            } else {
                updateState({
                    keyboardCursorCol: Math.max(0, keyboardCursorCol - 1),
                });
            }
        } else if (button === 'RIGHT') {
            if (keyboardCursorRow === 3) {
                updateState({ keyboardCursorCol: 1 }); // DONE
            } else {
                const maxCol = keyboard[keyboardCursorRow].length - 1;
                updateState({
                    keyboardCursorCol: Math.min(maxCol, keyboardCursorCol + 1),
                });
            }
        } else if (button === 'OK') {
            // Handle key press
            let key;
            if (keyboardCursorRow === 3) {
                key = keyboardCursorCol === 0 ? 'SPACE' : 'DONE';
            } else {
                key = keyboard[keyboardCursorRow][keyboardCursorCol];
            }

            if (key === 'DONE') {
                // Complete keyboard input - only if a city is entered
                if (keyboardInput.trim() && filteredCities.length > 0) {
                    // Select the city at selectedCityIndex
                    const selectedCity = filteredCities[selectedCityIndex];
                    updateState({
                        location: {
                            city: selectedCity.name,
                            country: selectedCity.country,
                            lat: selectedCity.lat,
                            lon: selectedCity.lon,
                        },
                        keyboardInput: '',
                        keyboardActive: false,
                        selectedCityIndex: 0, // Reset for next time
                    });
                    nextSetupStep();
                }
                // If keyboardInput is empty or no matching cities, do nothing
            } else if (key === '⌫') {
                // Backspace - reset city selection
                updateState({
                    keyboardInput: keyboardInput.slice(0, -1),
                    selectedCityIndex: 0,
                });
            } else if (key === 'SPACE') {
                // Reset city selection when typing
                updateState({
                    keyboardInput: keyboardInput + ' ',
                    selectedCityIndex: 0,
                });
            } else {
                // Reset city selection when typing
                updateState({
                    keyboardInput: keyboardInput + key,
                    selectedCityIndex: 0,
                });
            }
        }
    };

    const handleMirrorNavigation = (button) => {
        const { currentFocus, focusedCalendarIndex, calendarEvents } = state;
        const calendarItemCount = calendarEvents.length;

        if (button === 'UP') {
            // Navigate up: calendar items -> settings icon
            if (focusedCalendarIndex > 0) {
                updateState({
                    focusedCalendarIndex: focusedCalendarIndex - 1,
                    currentFocus: `calendar-${focusedCalendarIndex - 1}`,
                });
            } else if (focusedCalendarIndex === 0) {
                updateState({
                    focusedCalendarIndex: -1,
                    currentFocus: 'settings-icon',
                });
            }
        } else if (button === 'DOWN') {
            // Navigate down: settings icon -> calendar items
            if (currentFocus === 'settings-icon' && calendarItemCount > 0) {
                updateState({
                    focusedCalendarIndex: 0,
                    currentFocus: 'calendar-0',
                });
            } else if (focusedCalendarIndex >= 0 && focusedCalendarIndex < calendarItemCount - 1) {
                updateState({
                    focusedCalendarIndex: focusedCalendarIndex + 1,
                    currentFocus: `calendar-${focusedCalendarIndex + 1}`,
                });
            }
        } else if (button === 'OK') {
            if (currentFocus === 'settings-icon') {
                // Open settings
                updateState({ currentScreen: 'settings', currentFocus: null });
            } else if (focusedCalendarIndex >= 0) {
                // Toggle calendar item completion
                const item = calendarEvents[focusedCalendarIndex];
                if (item) {
                    toggleCalendarItem(item.id);
                }
            }
        }

        // If no focus set, start with settings icon
        if (!currentFocus && (button === 'UP' || button === 'DOWN')) {
            updateState({
                currentFocus: 'settings-icon',
                focusedCalendarIndex: -1,
            });
        }
    };

    const handleSettingsNavigation = (button) => {
        const { inSettingsSubmenu, settingsMenuIndex } = state;

        if (button === 'BACK') {
            // If currently authenticating, cancel authentication
            if (state.calendarAuthenticating) {
                updateState({
                    calendarAuthenticating: false,
                    deviceCodeData: null,
                });
                return;
            }

            if (inSettingsSubmenu) {
                updateState({ inSettingsSubmenu: false });
            } else {
                updateState({
                    currentScreen: 'mirror',
                    currentFocus: 'settings-icon',
                });
            }
        } else if (!inSettingsSubmenu) {
            // Main settings menu navigation
            if (button === 'UP') {
                updateState({
                    settingsMenuIndex: Math.max(0, settingsMenuIndex - 1),
                });
            } else if (button === 'DOWN') {
                updateState({
                    settingsMenuIndex: Math.min(6, settingsMenuIndex + 1), // 7 menu items (0-6)
                });
            } else if (button === 'OK') {
                handleSettingsMenuSelect(settingsMenuIndex);
            }
        } else {
            // Submenu navigation
            handleSettingsSubmenuNavigation(button);
        }
    };

    const handleSettingsSubmenuNavigation = (button) => {
        const { settingsMenuIndex, timeFormat, tempUnit, activeWidgets } = state;
        const menuItems = [
            'wifi',
            'calendar',
            'time-format',
            'temperature-unit',
            'display-elements',
            'rearrange',
            'exit',
        ];
        const currentMenu = menuItems[settingsMenuIndex];

        // Time format: toggle with left/right
        if (currentMenu === 'time-format') {
            if (button === 'LEFT' || button === 'RIGHT') {
                updateState({ timeFormat: timeFormat === '12' ? '24' : '12' });
            }
        }
        // Temperature unit: toggle with left/right
        else if (currentMenu === 'temperature-unit') {
            if (button === 'LEFT' || button === 'RIGHT') {
                updateState({ tempUnit: tempUnit === 'C' ? 'F' : 'C' });
            }
        }
        // Display elements: navigate and toggle with remote
        else if (currentMenu === 'display-elements') {
            const { displayElementsIndex } = state;
            const elementKeys = ['time', 'weather', 'calendar'];

            if (button === 'UP') {
                updateState({
                    displayElementsIndex: Math.max(0, displayElementsIndex - 1),
                });
            } else if (button === 'DOWN') {
                updateState({
                    displayElementsIndex: Math.min(2, displayElementsIndex + 1),
                });
            } else if (button === 'LEFT' || button === 'RIGHT' || button === 'OK') {
                // Toggle the currently selected element
                const currentElement = elementKeys[displayElementsIndex];
                updateState({
                    activeWidgets: {
                        ...activeWidgets,
                        [currentElement]: !activeWidgets[currentElement],
                    },
                });
            }
        }
        // Re-arrange screen: handle widget selection and pixel-based movement
        else if (currentMenu === 'rearrange') {
            const { rearrangeWidgetIndex, widgetPositions } = state;
            const widgetKeys = ['time', 'weather', 'calendar'];
            const currentWidget = widgetKeys[rearrangeWidgetIndex];
            const currentPos = widgetPositions[currentWidget] || { x: 50, y: 50 };
            const moveIncrement = 2; // Move by 2% per button press

            // Define boundaries for each widget to prevent off-screen positioning
            // Time: top-left positioning (no transform) - stays within top-left region
            // Weather: right-aligned (translateX(-100%)) - X from 20% to 100%
            // Calendar: bottom-aligned (translateY(-100%)) - Y from 20% to 100%
            const boundaries = {
                time: { minX: 0, maxX: 80, minY: 0, maxY: 80 },
                weather: { minX: 20, maxX: 100, minY: 0, maxY: 80 },
                calendar: { minX: 0, maxX: 80, minY: 20, maxY: 100 },
            };

            const bounds = boundaries[currentWidget];

            // Channel buttons to cycle through widgets
            if (button === 'CHANNEL_UP') {
                updateState({
                    rearrangeWidgetIndex: Math.min(2, rearrangeWidgetIndex + 1),
                });
                return;
            } else if (button === 'CHANNEL_DOWN') {
                updateState({
                    rearrangeWidgetIndex: Math.max(0, rearrangeWidgetIndex - 1),
                });
                return;
            }

            if (button === 'UP') {
                // Move widget up
                const newY = Math.max(bounds.minY, currentPos.y - moveIncrement);
                updateState({
                    widgetPositions: {
                        ...widgetPositions,
                        [currentWidget]: { ...currentPos, y: newY },
                    },
                });
            } else if (button === 'DOWN') {
                // Move widget down
                const newY = Math.min(bounds.maxY, currentPos.y + moveIncrement);
                updateState({
                    widgetPositions: {
                        ...widgetPositions,
                        [currentWidget]: { ...currentPos, y: newY },
                    },
                });
            } else if (button === 'LEFT') {
                // Move widget left
                const newX = Math.max(bounds.minX, currentPos.x - moveIncrement);
                updateState({
                    widgetPositions: {
                        ...widgetPositions,
                        [currentWidget]: { ...currentPos, x: newX },
                    },
                });
            } else if (button === 'RIGHT') {
                // Move widget right
                const newX = Math.min(bounds.maxX, currentPos.x + moveIncrement);
                updateState({
                    widgetPositions: {
                        ...widgetPositions,
                        [currentWidget]: { ...currentPos, x: newX },
                    },
                });
            } else if (button === 'OK') {
                // Save and exit
                updateState({ inSettingsSubmenu: false });
            }
        }
    };

    const handleSettingsMenuSelect = (index) => {
        const menuItems = [
            'wifi',
            'calendar',
            'time-format',
            'temperature-unit',
            'display-elements',
            'rearrange',
            'exit',
        ];

        const selected = menuItems[index];
        console.log('Settings menu selected:', selected);

        if (selected === 'exit') {
            updateState({
                currentScreen: 'mirror',
                currentFocus: 'settings-icon',
            });
        } else if (selected === 'wifi') {
            // WiFi is disabled for now, show disabled submenu
            updateState({ inSettingsSubmenu: true });
        } else {
            updateState({ inSettingsSubmenu: true });
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
                currentFocus: 'settings-icon', // Start with settings icon focused
            });
        }
    };

    // Navigate to previous setup step
    const previousSetupStep = () => {
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
        if (currentIndex > 0) {
            updateState({ currentSetupStep: steps[currentIndex - 1] });
        }
    };

    const value = {
        state,
        updateState,
        handleRemoteAction,
        nextSetupStep,
        previousSetupStep,
        toggleCalendarItem,
        resetHideTimer,
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