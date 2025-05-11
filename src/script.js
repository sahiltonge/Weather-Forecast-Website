const apiKey = "022ad3332bc542a991545422251005"; 

function saveToLocalStorage(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    cities = cities.slice(0, 5); // Keep only latest 5
    localStorage.setItem("cities", JSON.stringify(cities));
    updateRecentCitiesDropdown();
  }
}

function updateRecentCitiesDropdown() {
  const dropdown = document.getElementById("recentCities");
  dropdown.innerHTML = '<option value="">-- Select a city --</option>';
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    dropdown.appendChild(option);
  });
}

function loadRecentCity(city) {
  if (city) getWeather(city);
}

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name.");
  getWeather(city);
}

function getWeatherByLocation() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    getWeather(`${latitude},${longitude}`);
  });
}

async function getWeather(query) {
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    saveToLocalStorage(data.location.name);

    // Current weather DOM update
    document.getElementById("cityName").textContent = `${data.location.name}, ${data.location.country}`;
    document.getElementById("condition").textContent = data.current.condition.text;
    document.getElementById("icon").src = `https:${data.current.condition.icon}`;
    document.getElementById("temp").textContent = `🌡️ ${data.current.temp_c}°C`;
    document.getElementById("humidity").textContent = `💧 Humidity: ${data.current.humidity}%`;
    document.getElementById("wind").textContent = `💨 Wind: ${data.current.wind_kph} km/h`;
    document.getElementById("currentWeather").classList.remove("hidden");

    // 5-day forecast
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";
    data.forecast.forecastday.forEach(day => {
      const div = document.createElement("div");
      div.className = "p-4 bg-white dark:bg-gray-700 rounded-lg text-center shadow";
      div.innerHTML = `
        <p class="font-semibold">${day.date}</p>
        <img src="https:${day.day.condition.icon}" class="mx-auto w-12 h-12" />
        <p>${day.day.condition.text}</p>
        <p>🌡️ ${day.day.avgtemp_c}°C</p>
        <p>💧 ${day.day.avghumidity}%</p>
        <p>💨 ${day.day.maxwind_kph} km/h</p>
      `;
      forecastContainer.appendChild(div);
    });
    forecastContainer.classList.remove("hidden");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Trigger search on Enter key
document.getElementById("cityInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    getWeatherByCity();
  }
});

// Load saved cities on page load
updateRecentCitiesDropdown();
