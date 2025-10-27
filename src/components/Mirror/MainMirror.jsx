import React from 'react';
import { useApp } from '../../context/AppContext';
import TimeWidget from './TimeWidget';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import SettingsIcon from './SettingsIcon';

function MainMirror() {
    const { state } = useApp();
    const { activeWidgets } = state;

    return (
        <div className="w-full h-full bg-black relative p-12">
            {/* Top Row - Time (left) and Weather (right) */}
            <div className="absolute top-12 left-12 right-12 flex justify-between items-start">
                {/* Time Widget - Top Left */}
                {activeWidgets.time && (
                    <div>
                        <TimeWidget />
                    </div>
                )}

                {/* Weather Widget - Top Right */}
                {activeWidgets.weather && (
                    <div>
                        <WeatherWidget />
                    </div>
                )}
            </div>

            {/* Bottom Row - Calendar (left) */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                {/* Calendar Widget - Bottom Left */}
                {activeWidgets.calendar && (
                    <div className="max-w-md">
                        <CalendarWidget />
                    </div>
                )}

                {/* Bottom Right - Last Updated */}
                <div className="text-gray-600 text-sm">
                    Updated {new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                })}
                </div>
            </div>

            {/* Settings Icon - Bottom Left Corner */}
            <div className="absolute bottom-12 left-12">
                <SettingsIcon />
            </div>

            {/* Center Area - Clear for reflection */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-gray-800 text-sm opacity-30">
                    {/* This area is intentionally clear for mirror reflection */}
                </div>
            </div>
        </div>
    );
}

export default MainMirror;