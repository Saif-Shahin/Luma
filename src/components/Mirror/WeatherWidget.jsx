import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getWeather, getMockWeather } from '../../utils/weatherAPI';

function WeatherWidget() {
    const { state } = useApp();
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            if (state.location.city) {
                try {
                    setIsLoading(true);
                    const data = await getWeather(
                        state.location.city,
                        state.location.lat,
                        state.location.lon
                    );
                    setWeatherData(data);
                } catch (error) {
                    console.error('Failed to fetch weather:', error);
                    setWeatherData(getMockWeather());
                } finally {
                    setIsLoading(false);
                }
            } else {
                setWeatherData(getMockWeather());
                setIsLoading(false);
            }
        };

        fetchWeather();

        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [state.location]);

    const convertTemp = (tempC) => {
        if (state.tempUnit === 'F') {
            return Math.round((tempC * 9) / 5 + 32);
        }
        return tempC;
    };

    const tempSymbol = state.tempUnit === 'C' ? '°C' : '°F';

    if (isLoading || !weatherData) {
        return (
            <div className="text-white text-right">
                <div className="text-xl text-gray-400">Loading weather...</div>
            </div>
        );
    }

    return (
        <div className="text-white text-right">
            <div className="flex items-center justify-end gap-4 mb-2">
                <span className="text-6xl">{weatherData.icon}</span>
                <span className="text-6xl font-bold">
          {convertTemp(weatherData.temp)}{tempSymbol}
        </span>
            </div>
            <div className="text-xl text-gray-300 mb-2">{weatherData.condition}</div>
            <div className="text-lg text-gray-400">
                H: {convertTemp(weatherData.high)}{tempSymbol} L:{' '}
                {convertTemp(weatherData.low)}{tempSymbol}
            </div>
            <div className="text-lg text-blue-300 mt-1">
                {weatherData.rainChance}% rain
            </div>
        </div>
    );
}

export default WeatherWidget;