import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

function CalendarSync() {
    const { state, updateState, nextSetupStep } = useApp();
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = (calendarType) => {
        setSelectedCalendar(calendarType);
        setIsConnecting(true);

        // Simulate connection after 2 seconds
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
            updateState({
                calendarConnected: true,
                calendarType: calendarType,
            });

            // Auto-advance after showing success
            setTimeout(() => {
                nextSetupStep();
            }, 1500);
        }, 2000);
    };

    if (isConnecting) {
        return (
            <div className="w-full h-full flex items-center justify-center screen-transition">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-white text-3xl font-semibold">
                        Connecting to {selectedCalendar === 'google' ? 'Google' : 'Apple'} Calendar...
                    </h2>
                    <p className="text-gray-400 text-xl mt-4">Please wait</p>
                </div>
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="w-full h-full flex items-center justify-center screen-transition">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="inline-block w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-white text-4xl font-bold">Connected!</h2>
                    <p className="text-gray-400 text-xl mt-4">
                        Your calendar is now synced
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-3xl">
                <h1 className="text-white text-5xl font-bold mb-8">Connect Your Calendar</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Choose a calendar service to sync your events
                </p>

                <div className="flex gap-8 justify-center">
                    {/* Google Calendar */}
                    <div
                        onClick={() => handleConnect('google')}
                        className="bg-gray-800/50 rounded-2xl p-8 border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer w-64"
                    >
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center">
                                <span className="text-4xl font-bold text-blue-600">G</span>
                            </div>
                        </div>
                        <h3 className="text-white text-2xl font-semibold mb-2">Google Calendar</h3>
                        <p className="text-gray-400 text-sm">Connect with your Google account</p>
                    </div>

                    {/* Apple Calendar */}
                    <div
                        onClick={() => handleConnect('apple')}
                        className="bg-gray-800/50 rounded-2xl p-8 border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer w-64"
                    >
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center">
                                <span className="text-4xl">🍎</span>
                            </div>
                        </div>
                        <h3 className="text-white text-2xl font-semibold mb-2">Apple Calendar</h3>
                        <p className="text-gray-400 text-sm">Connect with your iCloud account</p>
                    </div>
                </div>

                <div className="mt-12">
                    <button
                        onClick={nextSetupStep}
                        className="text-gray-500 hover:text-gray-300 text-lg underline"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalendarSync;