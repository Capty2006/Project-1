const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location");
const currentWeatherDiv = document.querySelector(".cloudy");
const hourlyWeatherDiv = document.querySelector(".hourly .weather-list");


const API_KEY = "2ed676f67d4d4571a65151029241411";  

// Weather codes for conditions
const weatherCode = {
  clear: [1000],
  clouds: [1003,1006,1009],
  mist: [1030,1135,1147],
  rain:[1063,1150,1153,1168,1171,1180,1183,1198,1201,1240,1243,1246,1273,1276],
  moderate_heavy_rain: [1186,1189,1192,1195,1243,1246],
  snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

const displayHouryForecast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0,0,0);
  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  //filter the hourly data include the next 24 hours
   const next24HoursData = hourlyData.filter(({time}) => {
    const forecastTime = new Date(time).getTime();
    return forecastTime >= currentHour && forecastTime <= next24Hours
   })
   
   // Generate html fr hourly forecast and display
   hourlyWeatherDiv.innerHTML= next24HoursData.map(item => {
    const temperature = Math.floor(item.temp_c);
    const time = item.time.split(" ")[1].substring(0, 5);
    const weatherIcon = Object.keys(weatherCode).find(icon => weatherCode[icon].includes(item.condition.code));

    return `<li class="weather-item">
    <p class="time">${time}</p>
    <img src="icons/${weatherIcon}.png" class="weather-icon" alt="weather icon">
    <p class="temperature">${temperature}°C</p>
 </li>`;
   }).join("");

   console.log(hourlyWeatherHTML);
}

const getWeatherDetails = async (API_URL) => {
   window.innerWidth <= 768 && searchInput.blur();
   try {
     const response = await fetch(API_URL);
     const data = await response.json();

     // Check if the data is valid
     if (!data || !data.current || !data.current.condition) {
       console.log("Weather data is unavailable for this city.");
       currentWeatherDiv.querySelector(".description").innerText = "City not found. Please try again.";
       return;

     }

     const temperature = Math.floor(data.current.temp_c);
     const description = data.current.condition.text;
     
     // Get the weather icon based on the condition code
     const weatherIcon = Object.keys(weatherCode).find(icon => weatherCode[icon].includes(data.current.condition.code));

     // Update  the weather data display
     currentWeatherDiv.querySelector(".weather-icon").src = `icons/${weatherIcon}.png`;
     currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C</span>`;
     currentWeatherDiv.querySelector(".description").innerText = description;
     
     // hourly data from today and tomorrow
     const combinedHourlyData =[...data.forecast.forecastday[0].hour,...data.forecast.forecastday[1].hour];

     displayHouryForecast(combinedHourlyData);

     searchInput.value = data.location.name;
   } catch (error) {
     console.log(data.current.condition.code);
     console.log(weatherIcon);
     console.log(data.location.name); 
     console.log(error);
     currentWeatherDiv.querySelector(".description").innerText = "Failed to fetch data. Please try again later.";
   }
}

//set up the weather request for a spacific city
const setupWeatherRequest = (cityName) =>{
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
  getWeatherDetails(API_URL);
}
// Handle search input
searchInput.addEventListener("keyup", (e) => {
    const cityName = searchInput.value.trim();

    if (e.key === "Enter" && cityName) {
        console.log(cityName);
        setupWeatherRequest(cityName);
    }
});

// Get user  location
locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(position => {
    const {latitude , longitude} = position.coords;
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
    getWeatherDetails(API_URL);

  }, error => {
      alert("Location access denied.")
  });
})
