const apiKey = '808b725c829187f2360a2aee540eac71';
const cityInput = document.getElementById('city-input');
const searchForm = document.getElementById('search-form');
const weatherDataSection = document.getElementById('weather-data');
const forecastList = document.getElementById('forecast-list');
const loadingSpinner = document.getElementById('loading-spinner');

const weatherIcons = {
  '01d': 'clear-day.png',
  '01n': 'clear-night.png',
  '02d': 'partly-cloudy-day.png',
  '02n': 'partly-cloudy-night.png',
  '03d': 'scattered-clouds-day.png',
  '03n': 'scattered-clouds-night.png',
  '04d': 'broken-clouds-day.png',
  '04n': 'broken-clouds-night.png',
  '09d': 'rain-showers-day.png',
  '09n': 'rain-showers-night.png',
  '10d': 'light-rain-day.png',
  '10n': 'light-rain-night.png',
  '11d': 'thunderstorm-day.png',
  '11n': 'thunderstorm-night.png',
  '13d': 'snow-day.png',
  '13n': 'snow-night.png',
  '50d': 'mist-day.png',
  '50n': 'mist-night.png'
};

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    handleError('Please enter a valid city name');
  }
});

function fetchWeatherData(city) {
  loadingSpinner.style.display = 'block';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => displayWeatherData(data))
    .catch(error => handleError(error));
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => displayWeatherForecast(data))
    .catch(error => handleError(error));
}

function displayWeatherData(data) {
  const {
    main: { temp, humidity },
    wind: { speed },
    weather: [{ description, icon }]
  } = data;

  document.getElementById('city-name').textContent = data.name;
  document.getElementById('temperature').textContent = `${temp}°C`;
  document.querySelector('#weather-data .humidity').textContent = `${humidity}%`;
  document.querySelector('#weather-data .wind.speed').textContent = `${speed} m/s`;

  const weatherIcon = weatherIcons[icon] || 'default.png';
  document.querySelector('#weather-data .weather-icon').src = `images/weathericonss/${weatherIcon}`;
  document.querySelector('#weather-data .weather-icon').alt = description;

  loadingSpinner.style.display = 'none';
}

function displayWeatherForecast(data) {
  const dailyForecast = {};

  data.list.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });

    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        temp: [],
        humidity: [],
        windSpeed: [],
        description: [],
        icon: []
      };
    }

    dailyForecast[day].temp.push(forecast.main.temp);
    dailyForecast[day].humidity.push(forecast.main.humidity);
    dailyForecast[day].windSpeed.push(forecast.wind.speed);
    dailyForecast[day].description.push(forecast.weather[0].description);
    dailyForecast[day].icon.push(forecast.weather[0].icon);
  });

  const forecastListHTML = Object.keys(dailyForecast).map((day) => {
    const dailyTemp = dailyForecast[day].temp.reduce((a, b) => a + b, 0) / dailyForecast[day].temp.length;
    const dailyHumidity = dailyForecast[day].humidity.reduce((a, b) => a + b, 0) / dailyForecast[day].humidity.length;
    const dailyWindSpeed = dailyForecast[day].windSpeed.reduce((a, b) => a + b, 0) / dailyForecast[day].windSpeed.length;
    const dailyDescription = dailyForecast[day].description[0];
    const dailyIcon = weatherIcons[dailyForecast[day].icon[0]] || 'default.png';

    return `
      <li>
        <h3>${day}</h3>
        <img src="images/weathericonss/${dailyIcon}" class="weather-icon" alt="${dailyDescription}">
        <p>Temperature: ${dailyTemp.toFixed(1)}°C</p>
        <p>Humidity: ${dailyHumidity.toFixed(1)}%</p>
        <p>Wind Speed: ${dailyWindSpeed.toFixed(1)} m/s</p>
        <p>Description: ${dailyDescription}</p>
      </li>
    `;
  });

  forecastList.innerHTML = forecastListHTML.join('');
}

function handleError(error) {
  console.error(error);
  weatherDataSection.innerHTML = `<p>Error: ${error.message}</p>`;
  loadingSpinner.style.display = 'none';
}
