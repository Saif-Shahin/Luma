import React from 'react';
import { useApp } from '../../context/AppContext';
import OnScreenKeyboard from './OnScreenKeyboard';

function LocationSetup() {
    const { state } = useApp();
    const { keyboardInput, selectedCityIndex } = state;

    // Mock cities for demonstration
    const mockCities = [
        { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
        { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
        { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
        { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
        { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
        { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
    ];

    // Filter cities based on keyboard input
    const filteredCities = keyboardInput
        ? mockCities.filter(c => c.name.toLowerCase().includes(keyboardInput.toLowerCase()))
        : mockCities.slice(0, 3);

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-3xl w-full px-8">
                <h1 className="text-white text-5xl font-bold mb-8">Set Your Location</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Type your city name using the on-screen keyboard
                </p>

                {/* On-Screen Keyboard */}
                <div className="mb-8">
                    <OnScreenKeyboard />
                </div>

                {/* Matching Cities Display */}
                {keyboardInput && filteredCities.length > 0 && (
                    <div className="mt-8">
                        <p className="text-gray-400 text-lg mb-4">Matching cities (use ▲▼ on DONE to select):</p>
                        <div className="space-y-2">
                            {filteredCities.slice(0, 5).map((cityOption, index) => (
                                <div
                                    key={`${cityOption.name}-${cityOption.country}`}
                                    className={`bg-gray-800/50 rounded-xl p-4 border-2 transition-all ${
                                        index === selectedCityIndex
                                            ? 'border-blue-500 bg-blue-600/20'
                                            : 'border-gray-700'
                                    }`}
                                >
                                    <p className="text-white text-xl font-semibold">
                                        {cityOption.name}
                                    </p>
                                    <p className="text-gray-400 text-sm">{cityOption.country}</p>
                                    {index === selectedCityIndex && (
                                        <p className="text-blue-400 text-xs mt-1"> Selected</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            Navigate to DONE, then use ▲▼ to select city. Press ⏯ on DONE to confirm.
                        </p>
                    </div>
                )}

                {keyboardInput && filteredCities.length === 0 && (
                    <div className="mt-8 text-gray-500 text-lg">
                        No cities found. Try a different search.
                    </div>
                )}
            </div>
        </div>
    );
}

export default LocationSetup;