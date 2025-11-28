import React from 'react';
import { useApp } from '../../context/AppContext';

function BrightnessSetup() {
    const { state } = useApp();
    const { brightness } = state;

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Adjust Brightness</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Learn how to adjust your mirror's brightness
                </p>

                {/* Brightness Display */}
                <div className="mb-12">
                    <div className="bg-gray-800/50 rounded-2xl p-10 border-2 border-gray-700">
                        <div className="mb-6">
                            <p className="text-white text-7xl font-bold">{brightness}%</p>
                            <p className="text-gray-300 text-xl mt-2">Current Brightness</p>
                        </div>

                        {/* Visual brightness bar */}
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-300"
                                style={{ width: `${brightness}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="text-gray-400 space-y-3">
                    <p className="text-lg">Use VOL+ to increase brightness</p>
                    <p className="text-lg">Use VOL- to decrease brightness</p>
                    <p className="text-lg mt-6">Press ⏯ to continue</p>
                </div>
            </div>
        </div>
    );
}

export default BrightnessSetup;
