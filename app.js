const API_KEY = '27a20641ea5f117ba505ff21c3f964f1';
const weatherIcons = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️', '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️', '50d': '🌫️', '50n': '🌫️'
};

let currentUnit = 'metric';

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeather(lat, lon);
}

function showError(error) {
    console.error("Error in geolocation:", error);
    alert("Unable to retrieve your location. Please use the search function.");
}

async function fetchWeather(lat, lon) {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=${currentUnit}&appid=${API_KEY}`);
        const weatherData = await weatherResponse.json();

        const aqiResponse = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiResponse.json();

        updateWeather(weatherData, aqiData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateWeather(weatherData, aqiData) {
    updateCurrentWeather(weatherData.current, aqiData);
    updateHourlyForecast(weatherData.hourly);
    updateWeeklyForecast(weatherData.daily);
    updateLocation(weatherData.timezone);
    updateBackground(weatherData.current.weather[0].main);
    updateAlerts(weatherData.alerts);
}

function updateCurrentWeather(current, aqiData) {
    const temperatureElement = document.getElementById('temperature');
    const descriptionElement = document.getElementById('description');
    const iconElement = document.getElementById('icon');
    const windElement = document.getElementById('wind');
    const humidityElement = document.getElementById('humidity');
    const pressureElement = document.getElementById('pressure');
    const sunriseElement = document.getElementById('sunrise');
    const sunsetElement = document.getElementById('sunset');
    const aqiElement = document.getElementById('aqi');

    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    temperatureElement.textContent = `${Math.round(current.temp)}${unitSymbol}`;
    descriptionElement.textContent = current.weather[0].description;
    iconElement.textContent = weatherIcons[current.weather[0].icon] || '🌈';

    const windSpeed = currentUnit === 'metric' ? current.wind_speed * 3.6 : current.wind_speed;
    const windSpeedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
    windElement.textContent = `${windSpeed.toFixed(1)} ${windSpeedUnit} ${getWindDirection(current.wind_deg)}`;
    
    humidityElement.textContent = `${current.humidity}%`;
    pressureElement.textContent = `${current.pressure} hPa`;
    sunriseElement.textContent = new Date(current.sunrise * 1000).toLocaleTimeString();
    sunsetElement.textContent = new Date(current.sunset * 1000).toLocaleTimeString();
    aqiElement.textContent = getAQIDescription(aqiData.list[0].main.aqi);

    temperatureElement.classList.add('fade-in');
    descriptionElement.classList.add('fade-in');
    iconElement.classList.add('pulse');
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function getAQIDescription(aqi) {
    const descriptions = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return descriptions[aqi - 1] || 'Unknown';
}

function updateHourlyForecast(hourly) {
    const container = document.getElementById('hourly-container');
    container.innerHTML = '';

    hourly.slice(0, 24).forEach((hour, index) => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('forecast-item', 'fade-in');
        hourlyItem.style.animationDelay = `${index * 0.1}s`;

        const time = new Date(hour.dt * 1000).getHours();
        const icon = weatherIcons[hour.weather[0].icon] || '🌈';
        const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

        hourlyItem.innerHTML = `
            <p>${time}:00</p>
            <p class="forecast-icon">${icon}</p>
            <p>${Math.round(hour.temp)}${unitSymbol}</p>
        `;

        container.appendChild(hourlyItem);
    });
}

function updateWeeklyForecast(daily) {
    const container = document.getElementById('weekly-container');
    container.innerHTML = '';

    daily.forEach((day, index) => {
        const dailyItem = document.createElement('div');
        dailyItem.classList.add('forecast-item', 'fade-in');
        dailyItem.style.animationDelay = `${index * 0.1}s`;

        const date = new Date(day.dt * 1000);
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
        const icon = weatherIcons[day.weather[0].icon] || '🌈';
        const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

        dailyItem.innerHTML = `
            <p>${dayName}</p>
            <p class="forecast-icon">${icon}</p>
            <p>${Math.round(day.temp.max)}${unitSymbol} / ${Math.round(day.temp.min)}${unitSymbol}</p>
        `;

        container.appendChild(dailyItem);
    });
}

function updateLocation(timezone) {
    const locationElement = document.getElementById('location');
    locationElement.textContent = timezone.replace('/', ', ');
}

function updateBackground(weatherCondition) {
    const body = document.body;
    let backgroundImage;

    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            backgroundImage = 'url("https://www.pexels.com/photo/body-of-water-near-mountain-peaks-1592461/")';
            break;
        case 'clouds':
            backgroundImage = 'url("https://www.pexels.com/photo/purple-sky-1287142/")';
            break;
        case 'rain':
            backgroundImage = 'url("https://unsplash.com/photos/a-wet-window-with-a-traffic-light-on-it-JgDUVGAXsso")';
            break;
        case 'snow':
            backgroundImage = 'url("https://unsplash.com/photos/a-snow-covered-mountain-with-evergreen-trees-in-the-foreground-nOEaeoYLGDc")';
            break;
        default:
            backgroundImage = 'url("https://unsplash.com/photos/people-walking-near-building-2rsK_rdiDJ8")';
    }

    const weatherBackground = document.querySelector('.weather-background') || document.createElement('div');
    weatherBackground.classList.add('weather-background');
    weatherBackground.style.backgroundImage = backgroundImage;
    body.appendChild(weatherBackground);
}

function updateAlerts(alerts) {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';

    if (alerts && alerts.length > 0) {
        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.classList.add('alert');
            alertElement.innerHTML = `
                <h3>${alert.event}</h3>
                <p>${alert.description}</p>
            `;
            alertsContainer.appendChild(alertElement);
        });
    } else {
        alertsContainer.innerHTML = '<p>No current weather alerts.</p>';
    }
}

function searchWeather() {
    const searchInput = document.getElementById('search-input');
    const city = searchInput.value.trim();

    if (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const { lat, lon } = data.coord;
                fetchWeather(lat, lon);
            })
            .catch(error => {
                console.error('Error searching for city:', error);
                alert('City not found. Please try again.');
            });
    }
}

function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    document.getElementById('celsius').classList.toggle('active');
    document.getElementById('fahrenheit').classList.toggle('active');
    getLocation(); // Fetch and update weather data with new unit
}

// Event listeners
document.getElementById('search-button').addEventListener('click', searchWeather);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});
document.getElementById('celsius').addEventListener('click', () => {
    if (currentUnit !== 'metric') toggleUnit();
});
document.getElementById('fahrenheit').addEventListener('click', () => {
    if (currentUnit !== 'imperial') toggleUnit();
});

// Initialize the app
getLocation();
setInterval(getLocation, 600000); // Update weather every 10 minutes