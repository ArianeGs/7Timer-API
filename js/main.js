document.addEventListener("DOMContentLoaded", function () {
  const locationSelect = document.getElementById('locationSelect');
  const weather = document.getElementById('weather');
  const loading = document.getElementById('loading'); // Add a reference to the load component

  // Hide the animation when the elements are displayed
  loading.style.display = 'none';

  locationSelect.addEventListener('change', function () {
      const selectedOption = locationSelect.options[locationSelect.selectedIndex];
      const data = selectedOption.dataset;
      const longitude = data.longitude;
      const latitude = data.latitude;
      const title = data.title;

      if (longitude && latitude && title) {
          // Show the animation whe the API data are trigged
          loading.style.display = 'block';
          // Call the getWeather function to search and return new API data.
          getWeather(longitude, latitude, title);
      }
  });

  fetch('city_coordinates.csv')
      .then(response => response.text())
      .then(csvData => {
          const rows = csvData.split('\n').slice(1);
          rows.forEach(row => {
              const [latitude, longitude, city, country] = row.trim().split(',');
              const option = document.createElement('option');
              option.value = `${city}, ${country}`;
              option.dataset.longitude = longitude;
              option.dataset.latitude = latitude;
              option.dataset.title = `${city}, ${country}`;
              option.textContent = `${city}, ${country}`;
              locationSelect.appendChild(option);
          });
      })
      .catch(error => {
          console.error('Erro ao buscar o arquivo CSV:', error);
      });
});

function getWeather(longitude, latitude, title) {
  const url = `https://www.7timer.info/bin/astro.php?lon=${longitude}&lat=${latitude}&ac=0&unit=metric&output=json&tzshift=0`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
          let html = `<h3>Weather for ${title}</h3>`;
          const currentDate = new Date();
          const nextSevenDays = data.dataseries.slice(0, 7); // Return the next seven days, based on today date.

          nextSevenDays.forEach((item, index) => {
              const day = new Date(currentDate);
              const weatherIcon = getWeatherIcon(item.cloudcover, item.seeing, item.transparency, item.lifted_index, item.rh2m, item.prec_type);
              day.setDate(currentDate.getDate() + index); // Adjust for the next day

              html += (`
              <div class="day">
                  <strong>${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</strong>
                  <img class="icon" src="${weatherIcon}" alt="Weather Icon">
                  <div>Wind Direction: ${item.wind10m.direction}</div>
                  <div>Wind Speed: ${item.wind10m.speed} km/min</div>
                  <div>Temp: ${item.temp2m} °C</div>
              </div>
              `);
          });

          weather.innerHTML = html;

          //Hide the animation when the elements render on screen.
          loading.style.display = 'none';
      });
}

function getWeatherIcon(cloudcover, seeing, transparency, lifted_index, rh2m, prec_type) {
  // Simples change of icon based on weather of the day.
  if (cloudcover >= 8) {
      return "./images/cloudy.png";
  } else if (seeing < 6) {
      return "./images/pcloudy.png";
  } else if (transparency < 3) {
      return "./images/fog.png";
  } else if (lifted_index > 10) {
      return "./images/clear.png";
  } else if (rh2m >= 8) {
      return "./images/humid.png";
  } else if (prec_type != "none"){
      return "./images/rain.png"; 
  } else {
      return "./images/ishower.png"; //default image, just for the example of change, a switch case would be better.
    }
}
getWeatherIcon();