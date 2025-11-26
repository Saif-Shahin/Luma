import React from 'react';
import { useApp } from '../../context/AppContext';

function TimeFormat() {
    const { state } = useApp();

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Time Format</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Choose your preferred time format
                </p>

                <div className="flex gap-6 justify-center">
                    {/* 12-hour format */}
                    <div
                        className={`rounded-2xl p-10 border-2 w-64 transition-all ${
                            state.timeFormat === '12'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-5xl font-bold mb-4">2:30 PM</p>
                        <p className="text-gray-300 text-xl">12-hour</p>
                    </div>

                    {/* 24-hour format */}
                    <div
                        className={`rounded-2xl p-10 border-2 w-64 transition-all ${
                            state.timeFormat === '24'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-5xl font-bold mb-4">14:30</p>
                        <p className="text-gray-300 text-xl">24-hour</p>
                    </div>
                </div>

                <div className="mt-12 text-gray-400">
                    <p className="text-lg">Use ⏮ ⏭ to toggle • Press ⏯ to confirm</p>
                </div>
            </div>
        </div>
    );
}

export default TimeFormat;