import React from 'react';
import { useApp } from '../../context/AppContext';

function WeatherWidget() {
    const { state } = useApp();

    // Mock weather data for now (will be replaced with API)
    const mockWeather = {
        temp: 22,
        high: 25,
        low: 18,
        condition: 'Partly Cloudy',
        icon: '⛅',
        rainChance: 30,
    };

    const convertTemp = (tempC) => {
        if (state.tempUnit === 'F') {
            return Math.round((tempC * 9) / 5 + 32);
        }
        return tempC;
    };

    const tempSymbol = state.tempUnit === 'C' ? '°C' : '°F';

    return (
        <div className="text-white text-right">
            <div className="flex items-center justify-end gap-4 mb-2">
                <span className="text-6xl">{mockWeather.icon}</span>
                <span className="text-6xl font-bold">
          {convertTemp(mockWeather.temp)}{tempSymbol}
        </span>
            </div>
            <div className="text-xl text-gray-300 mb-2">{mockWeather.condition}</div>
            <div className="text-lg text-gray-400">
                H: {convertTemp(mockWeather.high)}{tempSymbol} L:{' '}
                {convertTemp(mockWeather.low)}{tempSymbol}
            </div>
            <div className="text-lg text-blue-300 mt-1">
                {mockWeather.rainChance}% rain
            </div>
        </div>
    );
}

export default WeatherWidget;