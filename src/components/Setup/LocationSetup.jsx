import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

function LocationSetup() {
    const { updateState, nextSetupStep } = useApp();
    const [city, setCity] = useState('');

    // Mock cities for demonstration
    const mockCities = [
        { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
        { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
        { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
        { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
        { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
        { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
    ];

    const filteredCities = city
        ? mockCities.filter(c => c.name.toLowerCase().includes(city.toLowerCase()))
        : mockCities.slice(0, 3);

    const handleSelectCity = (selectedCity) => {
        updateState({
            location: {
                city: selectedCity.name,
                country: selectedCity.country,
                lat: selectedCity.lat,
                lon: selectedCity.lon,
            },
        });
        nextSetupStep();
    };

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl w-full px-8">
                <h1 className="text-white text-5xl font-bold mb-8">Set Your Location</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    This helps us show accurate weather information
                </p>

                <div className="mb-8">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Search for your city..."
                        className="w-full bg-gray-800 text-white text-2xl px-6 py-4 rounded-xl border-2 border-gray-700 focus:border-blue-500 focus:outline-none"
                        autoFocus
                    />
                </div>

                <div className="space-y-3">
                    {filteredCities.map((cityOption) => (
                        <div
                            key={`${cityOption.name}-${cityOption.country}`}
                            onClick={() => handleSelectCity(cityOption)}
                            className="bg-gray-800/50 rounded-xl p-6 border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
                        >
                            <p className="text-white text-2xl font-semibold">
                                {cityOption.name}
                            </p>
                            <p className="text-gray-400 text-lg">{cityOption.country}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <p className="text-gray-500 text-sm">
                        Type to search or select from the list above
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LocationSetup;