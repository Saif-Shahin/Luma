import React from 'react';
import { useApp } from '../../context/AppContext';
import GoogleDeviceAuth from './GoogleDeviceAuth';

function CalendarSync() {
    const { state } = useApp();
    const focusedOption = state.calendarFocusedOption;
    const isAuthenticating = state.calendarAuthenticating;
    const deviceCodeData = state.deviceCodeData;

    // If authenticating, show the device code auth screen
    if (isAuthenticating) {
        return (
            <GoogleDeviceAuth
                deviceCodeData={deviceCodeData}
                onSuccess={() => {
                    console.log('Authentication successful!');
                }}
                onError={(error) => {
                    console.error('Authentication error:', error);
                }}
            />
        );
    }

    // Otherwise, show the calendar selection screen
    const options = [
        { type: 'google', label: 'Google Calendar', icon: 'G', color: 'blue-600' },
        { type: 'skip', label: 'Skip for now', icon: '→', color: 'gray-700' },
    ];

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-3xl px-8">
                <h1 className="text-white text-5xl font-bold mb-8">Connect Your Calendar</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Sync your events and tasks to your mirror
                </p>

                <div className="space-y-4">
                    {options.map((option, index) => (
                        <div
                            key={option.type}
                            className={`p-8 rounded-2xl border-2 transition-all ${
                                focusedOption === index
                                    ? 'border-blue-500 bg-blue-500/20 scale-105'
                                    : 'border-gray-700 bg-gray-800/50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {option.type === 'google' ? (
                                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                                            <span className="text-3xl font-bold text-blue-600">{option.icon}</span>
                                        </div>
                                    ) : (
                                        <div className={`w-16 h-16 bg-${option.color} rounded-xl flex items-center justify-center`}>
                                            <span className="text-3xl text-white">{option.icon}</span>
                                        </div>
                                    )}
                                    <span className="text-white text-2xl font-semibold">{option.label}</span>
                                </div>
                                {focusedOption === index && (
                                    <span className="text-blue-500 text-3xl">→</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-gray-500 text-lg">
                    <p>Use ↑↓ to navigate • Press OK to select</p>
                </div>
            </div>
        </div>
    );
}

export default CalendarSync;