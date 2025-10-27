import React from 'react';
import { useApp } from '../../context/AppContext';
import TimeWidget from './TimeWidget';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import SettingsIcon from './SettingsIcon';

function MainMirror() {
    const { state } = useApp();
    const { activeWidgets, widgetPositions } = state;

    // Get widget positions with defaults
    const timePos = widgetPositions.time || { x: 5, y: 5 };
    const weatherPos = widgetPositions.weather || { x: 95, y: 5 };
    const calendarPos = widgetPositions.calendar || { x: 5, y: 95 };

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
            {/* Time Widget - Positioned by percentage */}
            {activeWidgets.time && (
                <div
                    className="absolute pointer-events-none transition-all duration-300"
                    style={{
                        left: `${timePos.x}%`,
                        top: `${timePos.y}%`,
                        zIndex: 10,
                    }}
                >
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                        <TimeWidget />
                    </div>
                </div>
            )}

            {/* Weather Widget - Positioned by percentage */}
            {activeWidgets.weather && (
                <div
                    className="absolute pointer-events-none transition-all duration-300"
                    style={{
                        left: `${weatherPos.x}%`,
                        top: `${weatherPos.y}%`,
                        transform: 'translateX(-100%)',
                        zIndex: 10,
                    }}
                >
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                        <WeatherWidget />
                    </div>
                </div>
            )}

            {/* Calendar Widget - Positioned by percentage */}
            {activeWidgets.calendar && (
                <div
                    className="absolute pointer-events-none transition-all duration-300"
                    style={{
                        left: `${calendarPos.x}%`,
                        top: `${calendarPos.y}%`,
                        transform: 'translateY(-100%)',
                        zIndex: 10,
                    }}
                >
                    <div className="max-w-md bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                        <CalendarWidget />
                    </div>
                </div>
            )}

            {/* Settings Icon - Bottom Center */}
            <div
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
                style={{ zIndex: 10 }}
            >
                <SettingsIcon />
            </div>

            {/* Last Updated - Bottom Right */}
            <div
                className="absolute bottom-12 right-12 pointer-events-none"
                style={{ zIndex: 10 }}
            >
                <div className="text-gray-600 text-sm bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1">
                    Updated {new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                })}
                </div>
            </div>
        </div>
    );
}

export default MainMirror;