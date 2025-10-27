// Weather API integration using OpenWeatherMap

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch weather data for a given city
 * @param {string} city - City name
 * @param {number} lat - Latitude (optional, takes precedence over city)
 * @param {number} lon - Longitude (optional, takes precedence over city)
 * @returns {Promise<Object>} Weather data
 */
export async function getWeather(city, lat = null, lon = null) {
    try {
        let url;

        if (lat && lon) {
            url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        } else {
            url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            temp: Math.round(data.main.temp),
            high: Math.round(data.main.temp_max),
            low: Math.round(data.main.temp_min),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: getWeatherIcon(data.weather[0].icon),
            rainChance: calculateRainChance(data),
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('Failed to fetch weather data:', error);

        // Return mock data as fallback
        return getMockWeather();
    }
}

/**
 * Calculate rain chance from weather data
 * This is a simplified calculation - real implementation would use forecast API
 */
function calculateRainChance(data) {
    const weatherId = data.weather[0].id;

    // Weather codes: https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) return 90; // Thunderstorm
    if (weatherId >= 300 && weatherId < 400) return 60; // Drizzle
    if (weatherId >= 500 && weatherId < 600) return 80; // Rain
    if (weatherId >= 600 && weatherId < 700) return 70; // Snow
    if (weatherId >= 700 && weatherId < 800) return 20; // Atmosphere
    if (weatherId === 800) return 0; // Clear
    if (weatherId > 800) return 30; // Clouds

    return 0;
}

/**
 * Convert OpenWeatherMap icon code to emoji
 */
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️',  // clear sky day
        '01n': '🌙',  // clear sky night
        '02d': '⛅',  // few clouds day
        '02n': '☁️',  // few clouds night
        '03d': '☁️',  // scattered clouds
        '03n': '☁️',  // scattered clouds
        '04d': '☁️',  // broken clouds
        '04n': '☁️',  // broken clouds
        '09d': '🌧️',  // shower rain
        '09n': '🌧️',  // shower rain
        '10d': '🌦️',  // rain day
        '10n': '🌧️',  // rain night
        '11d': '⛈️',  // thunderstorm
        '11n': '⛈️',  // thunderstorm
        '13d': '❄️',  // snow
        '13n': '❄️',  // snow
        '50d': '🌫️',  // mist
        '50n': '🌫️',  // mist
    };

    return iconMap[iconCode] || '⛅';
}

/**
 * Get mock weather data for testing/fallback
 */
export function getMockWeather() {
    return {
        temp: 22,
        high: 25,
        low: 18,
        condition: 'Partly Cloudy',
        description: 'partly cloudy',
        icon: '⛅',
        rainChance: 30,
        humidity: 65,
        windSpeed: 12,
        timestamp: Date.now(),
    };
}

/**
 * Check if weather data is stale (older than 30 minutes)
 */
export function isWeatherStale(timestamp) {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    return Date.now() - timestamp > THIRTY_MINUTES;
}