import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

function TimeFormat() {
    const { state, updateState, nextSetupStep } = useApp();

    useEffect(() => {
        // Auto-select 12-hour format (default)
        const timer = setTimeout(() => {
            updateState({ timeFormat: '12' });
            nextSetupStep();
        }, 2000);

        return () => clearTimeout(timer);
    }, [updateState, nextSetupStep]);

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Time Format</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Setting default time format...
                </p>

                <div className="flex gap-6 justify-center">
                    {/* 12-hour format - Selected */}
                    <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-blue-500 bg-blue-500/20 w-64">
                        <p className="text-white text-5xl font-bold mb-4">2:30 PM</p>
                        <p className="text-gray-400 text-xl">12-hour format</p>
                        <div className="mt-4">
                            <div className="inline-block w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 24-hour format */}
                    <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-gray-700 w-64 opacity-50">
                        <p className="text-white text-5xl font-bold mb-4">14:30</p>
                        <p className="text-gray-400 text-xl">24-hour format</p>
                    </div>
                </div>

                <div className="mt-12 text-gray-500">
                    <p className="text-lg">You can change this in settings</p>
                </div>
            </div>
        </div>
    );
}

export default TimeFormat;