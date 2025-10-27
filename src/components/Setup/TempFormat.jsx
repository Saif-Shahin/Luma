import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

function TempFormat() {
    const { state, updateState, nextSetupStep } = useApp();
    const [selected, setSelected] = useState(state.tempUnit || 'C');

    const handleSelect = (unit) => {
        setSelected(unit);
        updateState({ tempUnit: unit });

        // Auto-advance after a short delay
        setTimeout(() => {
            nextSetupStep();
        }, 500);
    };

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Temperature Unit</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    How would you like to display the temperature?
                </p>

                <div className="flex gap-6 justify-center">
                    {/* Celsius */}
                    <div
                        onClick={() => handleSelect('C')}
                        className={`bg-gray-800/50 rounded-2xl p-10 border-2 transition-all cursor-pointer w-64 ${
                            selected === 'C'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <p className="text-white text-6xl font-bold mb-4">22°C</p>
                        <p className="text-gray-400 text-xl">Celsius</p>
                        {selected === 'C' && (
                            <div className="mt-4">
                                <div className="inline-block w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fahrenheit */}
                    <div
                        onClick={() => handleSelect('F')}
                        className={`bg-gray-800/50 rounded-2xl p-10 border-2 transition-all cursor-pointer w-64 ${
                            selected === 'F'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <p className="text-white text-6xl font-bold mb-4">72°F</p>
                        <p className="text-gray-400 text-xl">Fahrenheit</p>
                        {selected === 'F' && (
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

export default TempFormat;