import React from 'react';
import { useApp } from '../../context/AppContext';

function TempFormat() {
    const { state } = useApp();

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Temperature Unit</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Choose your preferred temperature unit
                </p>

                <div className="flex gap-6 justify-center">
                    {/* Celsius */}
                    <div
                        className={`rounded-2xl p-10 border-2 w-64 transition-all ${
                            state.tempUnit === 'C'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-6xl font-bold mb-4">22°C</p>
                        <p className="text-gray-300 text-xl">Celsius</p>
                    </div>

                    {/* Fahrenheit */}
                    <div
                        className={`rounded-2xl p-10 border-2 w-64 transition-all ${
                            state.tempUnit === 'F'
                                ? 'bg-blue-600 border-blue-400'
                                : 'bg-gray-800/50 border-gray-700'
                        }`}
                    >
                        <p className="text-white text-6xl font-bold mb-4">72°F</p>
                        <p className="text-gray-300 text-xl">Fahrenheit</p>
                    </div>
                </div>

                <div className="mt-12 text-gray-400">
                    <p className="text-lg">Use ← → to toggle • Press OK to confirm</p>
                </div>
            </div>
        </div>
    );
}

export default TempFormat;