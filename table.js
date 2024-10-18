const apiKey = 'a87da7c47ef5f9c66efd2be7a7036d53';
const forecastTableBody = document.getElementById('forecast-body');
const cityInput = document.getElementById('city-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const sortDropdown = document.getElementById('sort-temperatures');

let forecastData = []; // To hold the fetched forecast data
let originalData = []; // To store the original unsorted/unfiltered forecast data
let currentPage = 1;
const entriesPerPage = 10; // Show 10 entries per page

// Event listener for the Get Weather button
getWeatherBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherForecast(city);
    } else {
        alert("Please enter a city name.");
    }
});

// Function to fetch weather forecast from OpenWeather API
async function getWeatherForecast(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.cod === '200') {
            forecastData = data.list;
            originalData = [...forecastData]; // Store the original forecast data
            currentPage = 1;
            displayForecast();
        } else {
            alert('City not found. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching the weather data:', error);
        alert('An error occurred while fetching the weather data.');
    }
}

// Function to display forecast data in the table with pagination
function displayForecast(data = forecastData) {
    forecastTableBody.innerHTML = ''; // Clear previous data
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, data.length);

    // Display forecast data for the current page
    for (let i = startIndex; i < endIndex; i++) {
        const forecast = data[i];
        const dateTime = new Date(forecast.dt_txt);
        const date = dateTime.toLocaleDateString(); // Get the date part

        // Display time in 12-hour format with AM/PM
        const time = dateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const weather = forecast.weather[0].description;
        const temp = forecast.main.temp;

        const row = `
        <tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${weather}</td>
            <td>${temp}°C</td>
        </tr>`;
        forecastTableBody.insertAdjacentHTML('beforeend', row);
    }

    updatePagination(data);
}

// Function to update pagination controls
function updatePagination(data) {
    const totalEntries = data.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Event listeners for pagination buttons
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayForecast();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(forecastData.length / entriesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayForecast();
    }
});

// Function to sort temperatures in ascending order
function sortTemperaturesAscending() {
    const sortedData = [...forecastData].sort((a, b) => a.main.temp - b.main.temp);
    displayForecast(sortedData);
}

// Function to sort temperatures in descending order
function sortTemperaturesDescending() {
    const sortedData = [...forecastData].sort((a, b) => b.main.temp - a.main.temp);
    displayForecast(sortedData);
}

// Function to filter out days without rain
function filterRainyDays() {
    const rainyDays = forecastData.filter(forecast => forecast.weather[0].description.includes('rain'));
    displayForecast(rainyDays);
}

// Function to find the day with the highest temperature
function findHighestTemperature() {
    const highestTempEntry = forecastData.reduce((prev, current) => {
        return (prev.main.temp > current.main.temp) ? prev : current;
    });
    displayForecast([highestTempEntry]);
}

// Function to reset table to its original state
function resetToNormal() {
    forecastData = [...originalData]; // Restore the original data
    displayForecast();
}

// Event listener for the sorting/filtering dropdown
sortDropdown.addEventListener('change', (event) => {
    const selectedOption = event.target.value;

    switch (selectedOption) {
        case 'Sort Temperatures Ascending':
            sortTemperaturesAscending();
            break;
        case 'Sort Temperatures Descending':
            sortTemperaturesDescending();
            break;
        case 'Filter Rainy Days':
            filterRainyDays();
            break;
        case 'Show Highest Temperature':
            findHighestTemperature();
            break;
        case 'Reset to Normal':
            resetToNormal(); // Call the reset function
            break;
        default:
            displayForecast(); // Default to displaying the original forecast data
    }
});
   // Chatbot functionality
   const chatInput = document.getElementById('chat-input');
   const sendChatButton = document.getElementById('send-chat');
   const chatResponse = document.getElementById('chat-response');

   sendChatButton.addEventListener('click', () => {
       const message = chatInput.value.trim();
       if (message) {
           getChatbotResponse(message);
           chatInput.value = ''; // Clear input field
       }
   });

   async function getChatbotResponse(message) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions'; // Adjust as necessary
    const requestBody = {
        model: 'gpt-3.5-turbo', // or your specific model
        messages: [{ role: 'user', content: message }],
        max_tokens: 100, // Adjust token limit as needed
        temperature: 0.5
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extracting the text from the response
        if (data.candidates && data.candidates.length > 0) {
            const chatbotReply = data.candidates[0].content.parts[0].text.trim();
            chatResponse.innerText = chatbotReply; // Display only the response
        } else {
            chatResponse.innerText = 'Sorry, I could not find an answer.';
        }
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        chatResponse.innerText = 'An error occurred while fetching the response. ' + error.message;
    }
}
