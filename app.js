// API key for OpenWeather
const API_KEY = 'a87da7c47ef5f9c66efd2be7a7036d53';

// DOM elements
const cityInput = document.getElementById('city-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const toggleUnitBtn = document.getElementById('toggle-unit-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const unitLabel = document.getElementById('unit-label');
const weather = document.getElementById('weather');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');

let isCelsius = true;

// Get the appropriate weather icon based on the weather description
function getWeatherIcon(description) {
    description = description.toLowerCase(); // Ensure case insensitivity
    if (description.includes('clear')) return '☀️'; // Clear
    if (description.includes('cloud')) return '☁️'; // Cloudy
    if (description.includes('rain')) return '🌧️'; // Rainy
    if (description.includes('snow')) return '❄️'; // Snowy
    if (description.includes('thunderstorm')) return '⛈️'; // Thunderstorm
    if (description.includes('fog') || description.includes('haze')) return '🌫️'; // Foggy
    return '🌈'; // Default icon
}

// Event listeners
getWeatherBtn.addEventListener('click', fetchWeather);
toggleUnitBtn.addEventListener('click', toggleUnit);

// Fetch weather data from OpenWeather API
async function fetchWeather() {
    const city = cityInput.value;
    if (!city) return;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${isCelsius ? 'metric' : 'imperial'}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${isCelsius ? 'metric' : 'imperial'}`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        updateCharts(weatherData.main.temp, forecastData.list);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Update weather UI
function updateWeatherUI(data) {
    cityName.textContent = data.name;
    temperature.textContent = Math.round(data.main.temp);
    unitLabel.textContent = isCelsius ? 'C' : 'F';
    weather.textContent = data.weather[0].description;
    weather.innerHTML += ` ${getWeatherIcon(data.weather[0].description)}`; // Add weather icon
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;
}

// Update forecast UI
function updateForecastUI(data) {
    forecastContainer.innerHTML = ''; // Clear previous forecasts

    data.list.forEach((item, index) => {
        if (index % 8 === 0) { // Show 1 forecast per day (every 8th entry)
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${new Date(item.dt * 1000).toLocaleDateString()}</div>
                <div class="forecast-icon">${getWeatherIcon(item.weather[0].description)}</div> <!-- Use the weather icon function -->
                <div class="forecast-temp">${Math.round(item.main.temp)}°${isCelsius ? 'C' : 'F'}</div>
            `;
            forecastContainer.appendChild(forecastItem);
        }
    });
}

// Toggle between Celsius and Fahrenheit
function toggleUnit() {
    isCelsius = !isCelsius;
    toggleUnitBtn.textContent = isCelsius ? 'Switch to °F' : 'Switch to °C';
    fetchWeather(); // Re-fetch weather data with new unit
}

// Update charts with current temperature and forecast data
function updateCharts(currentTemp, forecastData) {
    const temperatures = forecastData.map(item => item.main.temp);
    const weatherConditions = forecastData.map(item => item.weather[0].main);

    // Count occurrences of each weather condition
    const conditionCounts = {};
    weatherConditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });

    // Bar chart
    const barChartCtx = document.getElementById('barChart').getContext('2d');
    barChartCtx.clearRect(0, 0, barChartCtx.canvas.width, barChartCtx.canvas.height);
    const barChart = new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: [...Array(forecastData.length / 8).keys()].map(i => new Date(forecastData[i * 8].dt * 1000).toLocaleDateString()),
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures.filter((_, index) => index % 8 === 0),
                backgroundColor: [
                    '#FF5733', '#33FF57', '#3357FF', '#FF33A1',
                    '#FFD433', '#33FFF6', '#FF8C33', '#C433FF'
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });

    // Doughnut chart
    const doughnutLabels = Object.keys(conditionCounts);
    const doughnutData = Object.values(conditionCounts);
    const doughnutChartCtx = document.getElementById('doughnutChart').getContext('2d');
    doughnutChartCtx.clearRect(0, 0, doughnutChartCtx.canvas.width, doughnutChartCtx.canvas.height);
    const doughnutChart = new Chart(doughnutChartCtx, {
        type: 'doughnut',
        data: {
            labels: doughnutLabels,
            datasets: [{
                label: 'Weather Conditions',
                data: doughnutData,
                backgroundColor: [
                    '#FF5733', '#33FF57', '#3357FF', '#FF33A1',
                    '#FFD433', '#33FFF6', '#FF8C33', '#C433FF'
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutoutPercentage: 70, // Makes it look more like a doughnut
        }
    });

    // Line chart
    const lineChartCtx = document.getElementById('lineChart').getContext('2d');
    lineChartCtx.clearRect(0, 0, lineChartCtx.canvas.width, lineChartCtx.canvas.height);
    const lineChart = new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: [...Array(forecastData.length / 8).keys()].map(i => new Date(forecastData[i * 8].dt * 1000).toLocaleDateString()),
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures.filter((_, index) => index % 8 === 0),
                borderColor: '#FF33A1',
                backgroundColor: 'rgba(255, 51, 165, 0)', // No fill
                borderWidth: 2, // Thicker line for better visibility
                pointRadius: 4, // Slightly larger points
                pointBackgroundColor: '#FF33A1', // Color of points
                pointBorderColor: '#fff', // Border color of points
                pointBorderWidth: 2, // Border width of points
                fill: false // Disable filling
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 5 // Limit number of x-axis labels
                    }
                }
            }
        }
    });
}

// Function to get the appropriate background image based on the weather description
function getWeatherBackgroundImage(description) {
    description = description.toLowerCase(); // Ensure case insensitivity
    if (description.includes('clear')) return 'url(./images/clearSky.jpeg)'; // Clear
    if (description.includes('cloud')) return 'url(./images/cloudy.jpeg)'; // Cloudy
    if (description.includes('rain')) return 'url(./images/rainy.jpeg)'; // Rainy
    if (description.includes('snow')) return 'url(./images/day_snowy.jpeg)'; // Snowy
    if (description.includes('thunderstorm')) return 'url(./images/day_thunderstorm.jpeg)'; // Thunderstorm
    if (description.includes('fog') || description.includes('haze')) return 'url(./images/haze.jpeg)'; // Foggy
    return 'url(./images/default.jpeg)'; // Default image
}

// Update weather UI
function updateWeatherUI(data) {
    cityName.textContent = data.name;
    temperature.textContent = Math.round(data.main.temp);
    unitLabel.textContent = isCelsius ? 'C' : 'F';
    weather.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;

    // Set the background image based on weather description
    const backgroundImage = getWeatherBackgroundImage(data.weather[0].description);
    document.querySelector('.weather-widget').style.backgroundImage = backgroundImage;
}
let currentPage = 1;
const entriesPerPage = 10;



const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.getElementById('sidebar');

hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active'); // Toggle the sidebar
});
