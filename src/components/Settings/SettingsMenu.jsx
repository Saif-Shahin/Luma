import React from 'react';
import { useApp } from '../../context/AppContext';
import { connectGoogleCalendar, disconnectCalendar, syncCalendarEvents } from '../../utils/calendarAPI';
import GoogleDeviceAuth from '../Setup/GoogleDeviceAuth';

function SettingsMenu() {
    const { state, updateState } = useApp();
    const { settingsMenuIndex, inSettingsSubmenu } = state;

    const menuItems = [
        { id: 'wifi', label: 'WiFi', icon: '📶', disabled: true },
        { id: 'calendar', label: 'Calendar', icon: '📅' },
        { id: 'time-format', label: 'Time Format', icon: '🕐' },
        { id: 'temperature-unit', label: 'Temperature Unit', icon: '🌡️' },
        { id: 'display-elements', label: 'Display Elements', icon: '📋' },
        { id: 'rearrange', label: 'Re-arrange Screen', icon: '🔧' },
        { id: 'exit', label: 'Exit Settings', icon: '❌' },
    ];

    if (inSettingsSubmenu) {
        // Show submenu based on selected item
        return renderSubmenu(menuItems[settingsMenuIndex]);
    }

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-5xl font-bold mb-12 text-center">Settings</h1>

                <div className="space-y-3">
                    {menuItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-4 p-6 rounded-xl transition-all ${
                                index === settingsMenuIndex
                                    ? 'bg-blue-600 border-2 border-blue-400'
                                    : 'bg-gray-800/50 border-2 border-gray-700'
                            } ${item.disabled ? 'opacity-50' : ''}`}
                        >
                            <span className="text-4xl">{item.icon}</span>
                            <span className="text-white text-2xl font-semibold flex-1">
                {item.label}
                                {item.disabled && <span className="text-sm text-gray-400 ml-2">(Coming Soon)</span>}
              </span>
                            {index === settingsMenuIndex && !item.disabled && (
                                <span className="text-white text-2xl">→</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-gray-500 text-lg">
                    <p>Use ↑↓ to navigate • Press OK to select • Press BACK to exit</p>
                </div>
            </div>
        </div>
    );

    function renderSubmenu(item) {
        if (item.disabled) {
            return (
                <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
                    <div className="max-w-2xl w-full text-center">
                        <h1 className="text-white text-4xl font-bold mb-12">{item.label}</h1>
                        <p className="text-gray-400 text-2xl mb-8">This feature is coming soon</p>
                        <p className="text-gray-500">Press BACK to return</p>
                    </div>
                </div>
            );
        }

        switch (item.id) {
            case 'time-format':
                return <TimeFormatSetting />;
            case 'temperature-unit':
                return <TemperatureUnitSetting />;
            case 'display-elements':
                return <DisplayElementsSelector />;
            case 'rearrange':
                return <RearrangeScreen />;
            case 'calendar':
                return <CalendarSetting />;
            default:
                return null;
        }
    }
}

// Display Elements Selector (formerly Widgets)
function DisplayElementsSelector() {
    const { state } = useApp();
    const { displayElementsIndex } = state;

    const displayElements = [
        { key: 'time', label: 'Time & Date', icon: '🕐' },
        { key: 'weather', label: 'Weather', icon: '☀️' },
        { key: 'calendar', label: 'Schedule & Tasks', icon: '📅' },
    ];

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Display Elements
                </h1>
                <p className="text-gray-400 text-xl mb-8 text-center">
                    Choose which information to show on your mirror
                </p>

                <div className="space-y-4">
                    {displayElements.map((element, index) => {
                        const isActive = state.activeWidgets[element.key];
                        const isFocused = index === displayElementsIndex;
                        return (
                            <div
                                key={element.key}
                                className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                                    isFocused
                                        ? 'bg-blue-600/30 border-blue-500'
                                        : 'bg-gray-800/50 border-gray-700'
                                }`}
                            >
                                <span className="text-4xl">{element.icon}</span>
                                <span className="text-white text-2xl font-semibold flex-1">
                  {element.label}
                </span>
                                <div
                                    className={`w-16 h-8 rounded-full transition-all ${
                                        isActive ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 bg-white rounded-full mt-1 transition-all ${
                                            isActive ? 'ml-9' : 'ml-1'
                                        }`}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center text-gray-500">
                    <p>Use ↑↓ to navigate • Toggle with ← → or OK • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Re-arrange Screen Feature with Pixel-based Positioning
function RearrangeScreen() {
    const { state } = useApp();
    const { rearrangeWidgetIndex, widgetPositions } = state;

    const widgets = [
        { key: 'time', label: 'Time & Date', icon: '🕐' },
        { key: 'weather', label: 'Weather', icon: '☀️' },
        { key: 'calendar', label: 'Schedule', icon: '📅' },
    ];

    const currentWidget = widgets[rearrangeWidgetIndex];
    const currentPos = widgetPositions[currentWidget.key] || { x: 50, y: 50 };

    return (
        <div className="w-full h-full bg-black flex screen-transition">
            {/* Left Panel - Widget Preview */}
            <div className="w-2/3 relative border-r-2 border-gray-700">
                <div className="absolute inset-4 bg-gray-900 rounded-xl overflow-hidden">
                    {/* Preview Screen */}
                    <div className="relative w-full h-full">
                        {widgets.map((widget, index) => {
                            const pos = widgetPositions[widget.key] || { x: 50, y: 50 };
                            const isSelected = rearrangeWidgetIndex === index;

                            // Different transform for each widget to match MainMirror positioning
                            let transform = '';
                            if (widget.key === 'weather') {
                                transform = 'translateX(-100%)';
                            } else if (widget.key === 'calendar') {
                                transform = 'translateY(-100%)';
                            }

                            return (
                                <div
                                    key={widget.key}
                                    className={`absolute transition-all ${
                                        isSelected ? 'scale-110 z-10' : 'opacity-50'
                                    }`}
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                        transform: transform,
                                    }}
                                >
                                    <div
                                        className={`bg-gray-800 rounded-lg p-3 border-2 ${
                                            isSelected ? 'border-blue-500' : 'border-gray-600'
                                        }`}
                                    >
                                        <span className="text-2xl">{widget.icon}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="text-blue-400 text-xs text-center mt-1 whitespace-nowrap">
                                            {widget.label}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Position Indicator */}
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
                        Position: {Math.round(currentPos.x)}%, {Math.round(currentPos.y)}%
                    </div>
                </div>
            </div>

            {/* Right Panel - Controls */}
            <div className="w-1/3 flex flex-col items-center justify-center p-8">
                <h1 className="text-white text-3xl font-bold mb-6 text-center">
                    Re-arrange Elements
                </h1>

                <p className="text-gray-400 text-lg mb-8 text-center">
                    Move {currentWidget.label} anywhere on the screen
                </p>

                <div className="space-y-4 w-full max-w-sm">
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-gray-300 text-sm mb-2">Current Element:</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-4xl">{currentWidget.icon}</span>
                            <span className="text-white text-xl font-semibold">
                {currentWidget.label}
              </span>
                        </div>
                    </div>

                    <div className="bg-blue-600/20 border-2 border-blue-500 rounded-xl p-4">
                        <p className="text-blue-300 text-sm mb-3 text-center">Controls:</p>
                        <div className="space-y-2 text-white text-sm">
                            <div className="flex justify-between">
                                <span>Switch Widget:</span>
                                <span className="font-mono">CH+/CH−</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Move:</span>
                                <span className="font-mono">↑ ↓ ← →</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Save & Exit:</span>
                                <span className="font-mono">OK</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cancel:</span>
                                <span className="font-mono">BACK</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-xs">
                    <p>Position elements anywhere on screen</p>
                    <p className="mt-1">Changes save when you press OK</p>
                </div>
            </div>
        </div>
    );
}

// Time Format Setting
function TimeFormatSetting() {
    const { state } = useApp();

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Time Format
                </h1>

                <div className="flex gap-6 justify-center">
                    <div
                        className={`p-10 rounded-2xl border-2 transition-all w-64 ${
                            state.timeFormat === '12'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-5xl font-bold mb-4 text-center">
                            2:30 PM
                        </p>
                        <p className="text-gray-300 text-xl text-center">12-hour</p>
                    </div>

                    <div
                        className={`p-10 rounded-2xl border-2 transition-all w-64 ${
                            state.timeFormat === '24'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-5xl font-bold mb-4 text-center">
                            14:30
                        </p>
                        <p className="text-gray-300 text-xl text-center">24-hour</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500">
                    <p>Use ← → to toggle • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Temperature Unit Setting
function TemperatureUnitSetting() {
    const { state } = useApp();

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Temperature Unit
                </h1>

                <div className="flex gap-6 justify-center">
                    <div
                        className={`p-10 rounded-2xl border-2 transition-all w-64 ${
                            state.tempUnit === 'C'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-6xl font-bold mb-4 text-center">
                            22°C
                        </p>
                        <p className="text-gray-300 text-xl text-center">Celsius</p>
                    </div>

                    <div
                        className={`p-10 rounded-2xl border-2 transition-all w-64 ${
                            state.tempUnit === 'F'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-6xl font-bold mb-4 text-center">
                            72°F
                        </p>
                        <p className="text-gray-300 text-xl text-center">Fahrenheit</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500">
                    <p>Use ← → to toggle • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Calendar Setting
function CalendarSetting() {
    const { state, updateState } = useApp();
    const { calendarConnected, calendarType, calendarAuthenticating, deviceCodeData } = state;
    const [focusedOption, setFocusedOption] = React.useState(0);

    // If authenticating, show the device code auth screen
    if (calendarAuthenticating) {
        return (
            <GoogleDeviceAuth
                deviceCodeData={deviceCodeData}
                onSuccess={() => {
                    console.log('Authentication successful from settings!');
                }}
                onError={(error) => {
                    console.error('Authentication error from settings:', error);
                }}
            />
        );
    }

    React.useEffect(() => {
        const handleNavigation = (button) => {
            if (button === 'UP') {
                setFocusedOption(prev => Math.max(0, prev - 1));
            } else if (button === 'DOWN') {
                setFocusedOption(prev => Math.min(1, prev + 1));
            } else if (button === 'OK') {
                handleOptionSelect();
            }
        };

        // Add keyboard listener (you may need to adjust this based on your navigation system)
        // This is a simplified version
        return () => {};
    }, [focusedOption]);

    const handleOptionSelect = async () => {
        if (focusedOption === 0) {
            // Reconnect/Connect Google Calendar using Device Code Flow
            updateState({ calendarAuthenticating: true });

            try {
                const result = await connectGoogleCalendar((codeData) => {
                    // Callback when device code is ready
                    updateState({
                        deviceCodeData: codeData,
                    });
                });

                updateState({
                    calendarConnected: result.connected,
                    calendarType: result.type,
                    calendarEvents: result.events,
                    calendarAuthenticating: false,
                    deviceCodeData: null,
                });
            } catch (error) {
                console.error('Failed to connect calendar:', error);
                updateState({
                    calendarAuthenticating: false,
                    deviceCodeData: null,
                });
            }
        } else if (focusedOption === 1) {
            // Disconnect Calendar
            if (!calendarConnected) {
                return; // Do nothing if not connected
            }

            // Disconnect
            disconnectCalendar();
            updateState({
                calendarConnected: false,
                calendarType: null,
                calendarEvents: [],
            });
        }
    };

    // Simplified options - only show what's relevant
    const getOptions = () => {
        if (!calendarConnected) {
            return [
                {
                    label: 'Connect Google Calendar',
                    description: 'Sign in to sync your Google Calendar events',
                    disabled: false,
                },
                {
                    label: 'Sync Now',
                    description: 'No calendar connected',
                    disabled: true,
                },
            ];
        }

        return [
            {
                label: 'Reconnect Calendar',
                description: 'Reconnect to Google Calendar',
                disabled: false,
            },
            {
                label: 'Disconnect Calendar',
                description: 'Remove calendar connection',
                disabled: false,
            },
        ];
    };

    const options = getOptions();

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-8 text-center">
                    Calendar Settings
                </h1>

                {/* Connection Status */}
                <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-lg mb-1">Status</p>
                            <p className="text-white text-2xl font-semibold">
                                {calendarConnected ? (
                                    <span className="text-green-400">
                                        Connected to Google Calendar
                                    </span>
                                ) : (
                                    <span className="text-yellow-400">Not Connected</span>
                                )}
                            </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full ${calendarConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-2xl border-2 transition-all ${
                                option.disabled
                                    ? 'border-gray-800 bg-gray-900/30 opacity-50'
                                    : focusedOption === index
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-gray-700 bg-gray-800/50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white text-2xl font-semibold mb-1">
                                        {option.label}
                                    </p>
                                    <p className="text-gray-400 text-lg">{option.description}</p>
                                </div>
                                {focusedOption === index && !option.disabled && (
                                    <span className="text-blue-500 text-3xl">→</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-gray-500">
                    <p>Use ↑↓ to navigate • Press OK to select • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

export default SettingsMenu;