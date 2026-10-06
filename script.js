const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");

const forecastContainer =
    document.getElementById("forecastContainer");

const errorMessage =
    document.getElementById("errorMessage");

const loading =
    document.getElementById("loading");


// Weather code information
const weatherCodes = {

    0: {
        description: "Clear Sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly Clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Fog",
        icon: "🌫️"
    },

    51: {
        description: "Light Drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Heavy Drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Light Rain",
        icon: "🌦️"
    },

    63: {
        description: "Rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy Rain",
        icon: "🌧️"
    },

    71: {
        description: "Light Snow",
        icon: "🌨️"
    },

    73: {
        description: "Snow",
        icon: "❄️"
    },

    75: {
        description: "Heavy Snow",
        icon: "❄️"
    },

    80: {
        description: "Rain Showers",
        icon: "🌦️"
    },

    81: {
        description: "Rain Showers",
        icon: "🌧️"
    },

    82: {
        description: "Heavy Rain Showers",
        icon: "⛈️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm with Hail",
        icon: "⛈️"
    },

    99: {
        description: "Heavy Thunderstorm",
        icon: "⛈️"
    }

};


// Search city
async function searchCity(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city.");
    }

    return data.results[0];
}


// Get weather
async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather data could not be loaded.");
    }

    return await response.json();
}


// Get weather description
function getWeatherInfo(code) {

    return weatherCodes[code] || {
        description: "Unknown Weather",
        icon: "🌍"
    };
}


// Display current weather
function displayCurrentWeather(data, location) {

    const current = data.current;

    const weatherInfo =
        getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${location.name}, ${location.country}`;

    temperature.textContent =
        Math.round(current.temperature_2m);

    weatherDescription.textContent =
        weatherInfo.description;

    weatherIcon.textContent =
        weatherInfo.icon;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;
}


// Display forecast
function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const dates = data.daily.time;

    const maxTemps =
        data.daily.temperature_2m_max;

    const minTemps =
        data.daily.temperature_2m_min;

    const weatherCodesArray =
        data.daily.weather_code;


    for (let i = 0; i < dates.length; i++) {

        const weatherInfo =
            getWeatherInfo(weatherCodesArray[i]);


        const date =
            new Date(dates[i]);

        const formattedDate =
            date.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short"
            });


        const card =
            document.createElement("div");

        card.className =
            "forecast-card";


        card.innerHTML = `

            <h3>${formattedDate}</h3>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temp">
                ${Math.round(maxTemps[i])}°C /
                ${Math.round(minTemps[i])}°C
            </div>

            <p>
                ${weatherInfo.description}
            </p>

        `;


        forecastContainer.appendChild(card);
    }
}


// Show error
function showError(message) {

    errorMessage.textContent = message;

    errorMessage.style.display = "block";
}


// Hide error
function hideError() {

    errorMessage.style.display = "none";
}


// Main function
async function loadWeather(city) {

    try {

        hideError();

        loading.style.display = "block";

        searchBtn.disabled = true;


        // Find city coordinates
        const location =
            await searchCity(city);


        // Get weather data
        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );


        // Update page
        displayCurrentWeather(
            weather,
            location
        );

        displayForecast(weather);


    } catch (error) {

        showError(error.message);

    } finally {

        loading.style.display = "none";

        searchBtn.disabled = false;
    }
}


// Search button
searchBtn.addEventListener("click", function () {

    const city =
        cityInput.value.trim();


    if (city === "") {

        showError(
            "Please enter a city name."
        );

        return;
    }


    if (city.length < 2) {

        showError(
            "Please enter a valid city name."
        );

        return;
    }


    loadWeather(city);
});


// Press Enter to search
cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        searchBtn.click();

    }

});


// Load default city
loadWeather("New Delhi");
