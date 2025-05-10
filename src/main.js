//window on load listener
window.addEventListener("load", () => {
  const cities = JSON.parse(sessionStorage.getItem("cities")) || [];
  if (cities.length > 0) getWeatherAndForecastByCity("London");
  else getWeatherAndForecastByCity("London", true);
});

//form event listener and input validation
document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const city = event.target["cityName"].value;
  if (!city) alert("Search field cannot be empty");
  else if (!/^[\p{L}\s'-]+$/u.test(city.trim()))
    alert("Please type a valid city name");
  else getWeatherAndForecastByCity(city);
});

// current location button click event listener
document.getElementById("curr-loc").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition((pos) =>
    getWeatherAndForecastByLatLong(pos.coords.latitude, pos.coords.longitude)
  );
});

//get current weather and forecast by city
async function getWeatherAndForecastByCity(cityName, empty = false) {
  try {
    const [weather, forecast] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=022b1a3606f21c7d4aa672208b6a6e20`
      ).then((res) => res.json()),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=022b1a3606f21c7d4aa672208b6a6e20`
      ).then((res) => res.json()),
    ]);
    updateWeatherDOM(weather);
    updateForecastDOM(forecast.list);
    if (!empty)
      dropDownhandler(
        cityName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      );
  } catch (e) {
    e.message == "Invalid time value"
      ? alert("Invalid city name")
      : alert(e.message);
  }
}

// function to update current weather view
function updateWeatherDOM(data) {
  const { dt, main, wind, weather, name } = data;
  const date = new Date(dt * 1000).toISOString().split("T")[0];
  const temp = Math.round(main.temp - 273.15);
  const weatherMain = weather[0];

  document.getElementById("city").innerText = `${name} (${date})`;
  document.getElementById("temperature").innerText = temp;
  document.getElementById("wind").innerText = wind.speed;
  document.getElementById("humidity").innerText = main.humidity;
  document.getElementById("weather").innerText = weatherMain.main;
  document.getElementById(
    "weather-icon"
  ).src = `https://openweathermap.org/img/wn/${weatherMain.icon}@2x.png`;
}

// get current weather and forecast using latitude and longitude
async function getWeatherAndForecastByLatLong(lat, lon) {
  try {
    const [weather, forecast] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=022b1a3606f21c7d4aa672208b6a6e20`
      ).then((res) => res.json()),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=022b1a3606f21c7d4aa672208b6a6e20`
      ).then((res) => res.json()),
    ]);
    updateWeatherDOM(weather);
    updateForecastDOM(forecast.list);
  } catch (e) {
    alert(e.message);
  }
}

//function to update 5 day forecast view
function updateForecastDOM(data) {
  const forecastBlock = document.querySelectorAll(".forecast-block");
  forecastBlock.forEach((block, index) => {
    const forecast = data[index * 8 + 7];
    const { dt, main, wind, weather } = forecast;
    const pTags = block.querySelectorAll("p");

    const img = block.querySelector("img");
    img.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    const date = new Date(dt * 1000).toISOString().split("T")[0];
    const temp = Math.round(main.temp - 273.15);

    pTags[0].textContent = `(${date})`;
    pTags[1].querySelector("span").textContent = temp;
    pTags[2].querySelector("span").textContent = wind.speed;
    pTags[3].querySelector("span").textContent = main.humidity;
  });
}

const input = document.getElementById("cityName");
const icon = document.getElementById("dropdownIcon");
const list = document.getElementById("dropdownList");

icon.onclick = () => {
  list.classList.toggle("hidden");
};

// dropdown handler
function dropDownhandler(city) {
  let cities = JSON.parse(sessionStorage.getItem("cities"));

  if (!cities?.includes(city)) {
    if (cities && cities.length >= 1 && cities.length < 5)
      sessionStorage.setItem("cities", JSON.stringify([city, ...cities]));
    else if (cities && cities.length == 5)
      sessionStorage.setItem(
        "cities",
        JSON.stringify([city, ...cities.slice(0, -1)])
      );
    else sessionStorage.setItem("cities", JSON.stringify([city]));
  }

  cities = JSON.parse(sessionStorage.getItem("cities"));

  list.innerHTML = "";
  if (cities.length == 0) {
    icon.style.display = "none";
    list.classList.add("hidden");
  } else {
    icon.style.display = "inline";
    cities.forEach((item) => {
      const div = document.createElement("div");
      div.textContent = item;
      div.className = "px-3 py-2 hover:bg-gray-100 text-black cursor-pointer";
      div.addEventListener("click", () => {
        input.value = item;
        list.classList.add("hidden");
      });
      list.appendChild(div);
    });
  }
}
