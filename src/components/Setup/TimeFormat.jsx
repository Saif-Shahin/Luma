import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

function TimeFormat() {
    const { state, updateState, nextSetupStep } = useApp();
    const [selected, setSelected] = useState(state.timeFormat || '12');

    const handleSelect = (format) => {
        setSelected(format);
        updateState({ timeFormat: format });

        // Auto-advance after a short delay
        setTimeout(() => {
            nextSetupStep();
        }, 500);
    };

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Time Format</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    How would you like to display the time?
                </p>

                <div className="flex gap-6 justify-center">
                    {/* 12-hour format */}
                    <div
                        onClick={() => handleSelect('12')}
                        className={`bg-gray-800/50 rounded-2xl p-10 border-2 transition-all cursor-pointer w-64 ${
                            selected === '12'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <p className="text-white text-5xl font-bold mb-4">2:30 PM</p>
                        <p className="text-gray-400 text-xl">12-hour format</p>
                        {selected === '12' && (
                            <div className="mt-4">
                                <div className="inline-block w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 24-hour format */}
                    <div
                        onClick={() => handleSelect('24')}
                        className={`bg-gray-800/50 rounded-2xl p-10 border-2 transition-all cursor-pointer w-64 ${
                            selected === '24'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <p className="text-white text-5xl font-bold mb-4">14:30</p>
                        <p className="text-gray-400 text-xl">24-hour format</p>
                        {selected === '24' && (
                            <div className="mt-4">
                                <div className="inline-block w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-gray-500">
                    <p className="text-lg">Click to select</p>
                </div>
            </div>
        </div>
    );
}

export default TimeFormat;