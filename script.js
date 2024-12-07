document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '5825e9b1bfc3b47b7f7508a6e3c9bfd6';
    let currentUnit = 'metric';
    
    // DOM Elements
    const cityInput = document.getElementById('city');
    const searchButton = document.getElementById('search');
    const locateButton = document.getElementById('locate');
    const weatherInfo = document.getElementById('weather-info');
    const errorDiv = document.getElementById('error');
    const unitButtons = document.querySelectorAll('.unit-btn');
    
    // Weather Elements
    const elements = {
        cityName: document.getElementById('city-name'),
        dateTime: document.getElementById('date-time'),
        weatherIcon: document.getElementById('weather-icon'),
        temperature: document.getElementById('temp'),
        feelsLike: document.querySelector('#feels-like span'),
        description: document.getElementById('description'),
        tempMax: document.getElementById('temp-max'),
        tempMin: document.getElementById('temp-min'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind'),
        pressure: document.getElementById('pressure'),
        visibility: document.getElementById('visibility'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset')
    };

    async function getWeather(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`
            );

            if (!response.ok) throw new Error('City not found');

            const data = await response.json();
            displayWeather(data);
            
            weatherInfo.classList.remove('hide');
            errorDiv.classList.add('hide');
        } catch (error) {
            weatherInfo.classList.add('hide');
            errorDiv.classList.remove('hide');
        }
    }

    function displayWeather(data) {
        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
        
        elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        elements.dateTime.textContent = new Date().toLocaleString();
        elements.temperature.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
        elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}${tempUnit}`;
        elements.description.textContent = data.weather[0].description;
        elements.tempMax.textContent = `${Math.round(data.main.temp_max)}${tempUnit}`;
        elements.tempMin.textContent = `${Math.round(data.main.temp_min)}${tempUnit}`;
        elements.humidity.textContent = `${data.main.humidity}%`;
        elements.wind.textContent = `${Math.round(currentUnit === 'metric' ? data.wind.speed * 3.6 : data.wind.speed)} ${speedUnit}`;
        elements.pressure.textContent = `${data.main.pressure} hPa`;
        elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        
        // Convert sunrise/sunset timestamps to local time
        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { timeStyle: 'short' });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { timeStyle: 'short' });
        elements.sunrise.textContent = sunriseTime;
        elements.sunset.textContent = sunsetTime;
        
        // Update weather icon
        const iconCode = data.weather[0].icon;
        elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        elements.weatherIcon.alt = data.weather[0].description;
    }

    // Geolocation
    async function getWeatherByLocation(position) {
        try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${currentUnit}&appid=${API_KEY}`
            );
            
            if (!response.ok) throw new Error('Location not found');

            const data = await response.json();
            displayWeather(data);
            
            weatherInfo.classList.remove('hide');
            errorDiv.classList.add('hide');
        } catch (error) {
            weatherInfo.classList.add('hide');
            errorDiv.classList.remove('hide');
        }
    }

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) getWeather(city);
        }
    });

    locateButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeatherByLocation, null, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        }
    });

    // Unit toggle
    unitButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.unit === currentUnit) return;
            
            currentUnit = button.dataset.unit;
            unitButtons.forEach(btn => btn.classList.toggle('active'));
            
            const city = cityInput.value.trim();
            if (city) getWeather(city);
        });
    });
}); 