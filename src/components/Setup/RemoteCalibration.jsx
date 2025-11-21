import React from 'react';
import { useApp } from '../../context/AppContext';

function RemoteCalibration() {
    const { state } = useApp();
    const { remoteCalibrationStep } = state;

    const steps = [
        { button: 'UP', symbol: '↑', label: 'Up', alternatives: [] },
        { button: 'RIGHT', symbol: '→', label: 'Right', alternatives: [] },
        { button: 'DOWN', symbol: '↓', label: 'Down', alternatives: [] },
        { button: 'LEFT', symbol: '←', label: 'Left', alternatives: [] },
        { button: 'OK', symbol: 'OK', label: 'OK/Select/Play', alternatives: [] },
        { button: 'CHANNEL_UP', symbol: 'CH+', label: 'Channel Up', alternatives: ['Next (▶▶|) or 2'] },
        { button: 'CHANNEL_DOWN', symbol: 'CH−', label: 'Channel Down', alternatives: ['Prev (|◀◀) or 8'] },
        { button: 'BRIGHTNESS_UP', symbol: '+', label: 'Brightness Up', alternatives: ['VOL+ or 1'] },
        { button: 'BRIGHTNESS_DOWN', symbol: '−', label: 'Brightness Down', alternatives: ['VOL− or 0'] },
    ];

    const currentStep = steps[remoteCalibrationStep];

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Remote Calibration</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Let's test your remote control
                </p>

                <div className="bg-gray-800/50 rounded-2xl p-12 border-2 border-gray-700">
                    <p className="text-gray-400 text-xl mb-6">Press the button on your remote:</p>

                    <div className="mb-8">
                        <div className="inline-block bg-blue-600 text-white text-7xl font-bold rounded-xl px-12 py-8 mb-4">
                            {currentStep.symbol}
                        </div>
                        <p className="text-white text-3xl font-semibold">{currentStep.label}</p>
                        {currentStep.alternatives && currentStep.alternatives.length > 0 && (
                            <p className="text-gray-400 text-lg mt-3">
                                {currentStep.alternatives.map((alt, i) => (
                                    <span key={i}>{alt}</span>
                                ))}
                            </p>
                        )}
                    </div>

                    {/* Progress indicators */}
                    <div className="flex justify-center gap-3">
                        {steps.map((step, index) => (
                            <div
                                key={step.button}
                                className={`w-4 h-4 rounded-full transition-all ${
                                    index < remoteCalibrationStep
                                        ? 'bg-green-500'
                                        : index === remoteCalibrationStep
                                            ? 'bg-blue-500 animate-pulse'
                                            : 'bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>

                    <p className="text-gray-500 text-sm mt-6">
                        Step {remoteCalibrationStep + 1} of {steps.length}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RemoteCalibration;