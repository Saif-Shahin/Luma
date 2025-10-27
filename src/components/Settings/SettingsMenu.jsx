import React from 'react';
import { useApp } from '../../context/AppContext';

function SettingsMenu() {
    const { state, updateState } = useApp();
    const { settingsMenuIndex, inSettingsSubmenu } = state;

    const menuItems = [
        { id: 'reconnect-remote', label: 'Reconnect Remote', icon: '📡' },
        { id: 'calendar', label: 'Calendar', icon: '📅' },
        { id: 'time-format', label: 'Time Format', icon: '🕐' },
        { id: 'temperature-unit', label: 'Temperature Unit', icon: '🌡️' },
        { id: 'brightness', label: 'Display Brightness', icon: '💡' },
        { id: 'widgets', label: 'Widgets', icon: '🎛️' },
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
                            }`}
                        >
                            <span className="text-4xl">{item.icon}</span>
                            <span className="text-white text-2xl font-semibold flex-1">
                {item.label}
              </span>
                            {index === settingsMenuIndex && (
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
        switch (item.id) {
            case 'brightness':
                return <BrightnessControl />;
            case 'widgets':
                return <WidgetSelector />;
            case 'time-format':
                return <TimeFormatSetting />;
            case 'temperature-unit':
                return <TemperatureUnitSetting />;
            case 'calendar':
                return <CalendarSetting />;
            case 'reconnect-remote':
                return <ReconnectRemote />;
            default:
                return null;
        }
    }
}

// Brightness Control Submenu
function BrightnessControl() {
    const { state } = useApp();

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Display Brightness
                </h1>

                <div className="bg-gray-800/50 rounded-2xl p-12 border-2 border-gray-700">
                    {/* Brightness Slider Visualization */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full transition-all duration-200"
                                    style={{ width: `${state.brightness}%` }}
                                ></div>
                            </div>
                            <span className="text-white text-3xl font-bold w-20 text-right">
                {state.brightness}%
              </span>
                        </div>
                    </div>

                    <div className="flex justify-between text-gray-400 text-xl mb-8">
                        <span>Dim</span>
                        <span>Bright</span>
                    </div>

                    <p className="text-gray-500 text-lg text-center">
                        Use ← → arrows or +/− buttons to adjust
                    </p>
                </div>

                <div className="mt-8 text-center text-gray-500">
                    <p>Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Widget Selector Submenu
function WidgetSelector() {
    const { state, updateState } = useApp();
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const widgets = [
        { key: 'time', label: 'Time & Date', icon: '🕐' },
        { key: 'weather', label: 'Weather', icon: '☀️' },
        { key: 'calendar', label: 'Calendar & Events', icon: '📅' },
    ];

    const handleToggle = (key) => {
        updateState({
            activeWidgets: {
                ...state.activeWidgets,
                [key]: !state.activeWidgets[key],
            },
        });
    };

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Display Widgets
                </h1>

                <div className="space-y-4">
                    {widgets.map((widget, index) => {
                        const isActive = state.activeWidgets[widget.key];
                        return (
                            <div
                                key={widget.key}
                                onClick={() => handleToggle(widget.key)}
                                className="flex items-center gap-4 p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                            >
                                <span className="text-4xl">{widget.icon}</span>
                                <span className="text-white text-2xl font-semibold flex-1">
                  {widget.label}
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
                    <p>Click to toggle • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Time Format Setting
function TimeFormatSetting() {
    const { state, updateState } = useApp();

    const handleSelect = (format) => {
        updateState({ timeFormat: format });
    };

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Time Format
                </h1>

                <div className="flex gap-6 justify-center">
                    <div
                        onClick={() => handleSelect('12')}
                        className={`p-10 rounded-2xl border-2 transition-all cursor-pointer w-64 ${
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
                        onClick={() => handleSelect('24')}
                        className={`p-10 rounded-2xl border-2 transition-all cursor-pointer w-64 ${
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
                    <p>Click to select • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Temperature Unit Setting
function TemperatureUnitSetting() {
    const { state, updateState } = useApp();

    const handleSelect = (unit) => {
        updateState({ tempUnit: unit });
    };

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full">
                <h1 className="text-white text-4xl font-bold mb-12 text-center">
                    Temperature Unit
                </h1>

                <div className="flex gap-6 justify-center">
                    <div
                        onClick={() => handleSelect('C')}
                        className={`p-10 rounded-2xl border-2 transition-all cursor-pointer w-64 ${
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
                        onClick={() => handleSelect('F')}
                        className={`p-10 rounded-2xl border-2 transition-all cursor-pointer w-64 ${
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
                    <p>Click to select • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Calendar Setting
function CalendarSetting() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full text-center">
                <h1 className="text-white text-4xl font-bold mb-12">
                    Calendar Settings
                </h1>
                <p className="text-gray-400 text-2xl mb-8">
                    Calendar management coming soon
                </p>
                <p className="text-gray-500">Press BACK to return</p>
            </div>
        </div>
    );
}

// Reconnect Remote
function ReconnectRemote() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-12">
            <div className="max-w-2xl w-full text-center">
                <h1 className="text-white text-4xl font-bold mb-12">
                    Reconnect Remote
                </h1>
                <div className="mb-8">
                    <div className="inline-block w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                            className="w-16 h-16 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>
                <p className="text-gray-400 text-2xl mb-8">Remote is connected</p>
                <p className="text-gray-500">Press BACK to return</p>
            </div>
        </div>
    );
}

export default SettingsMenu;