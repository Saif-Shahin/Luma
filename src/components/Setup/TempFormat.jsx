import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

function TempFormat() {
    const { state, updateState, nextSetupStep } = useApp();

    useEffect(() => {
        // Auto-select Celsius (default)
        const timer = setTimeout(() => {
            updateState({ tempUnit: 'C' });
            nextSetupStep();
        }, 2000);

        return () => clearTimeout(timer);
    }, [updateState, nextSetupStep]);

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Temperature Unit</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Setting default temperature unit...
                </p>

                <div className="flex gap-6 justify-center">
                    {/* Celsius - Selected */}
                    <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-blue-500 bg-blue-500/20 w-64">
                        <p className="text-white text-6xl font-bold mb-4">22°C</p>
                        <p className="text-gray-400 text-xl">Celsius</p>
                        <div className="mt-4">
                            <div className="inline-block w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Fahrenheit */}
                    <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-gray-700 w-64 opacity-50">
                        <p className="text-white text-6xl font-bold mb-4">72°F</p>
                        <p className="text-gray-400 text-xl">Fahrenheit</p>
                    </div>
                </div>

                <div className="mt-12 text-gray-500">
                    <p className="text-lg">You can change this in settings</p>
                </div>
            </div>
        </div>
    );
}

export default TempFormat;