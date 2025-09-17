# Smart Weather Dashboard

A responsive and feature-rich weather dashboard that provides real-time weather information and 5-day forecasts for any location worldwide.

![Weather Dashboard](https://img.shields.io/badge/Weather-Dashboard-blue) ![Responsive](https://img.shields.io/badge/Design-Responsive-green) ![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-orange)

## Features

- 🌤️ **Real-time Weather Data**: Current temperature, humidity, wind speed, pressure, and visibility
- 📅 **5-Day Forecast**: Detailed weather predictions for the next 5 days
- 📍 **Location Detection**: Automatic detection of user's current location
- 🔍 **City Search**: Search for any city worldwide with suggestions
- 🔔 **Smart Notifications**: Configurable weather update notifications (30min/1hr/2hr/3hr)
- 🌙 **Dark/Light Mode**: Toggle between light and dark themes
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 💾 **Local Storage**: Remembers user preferences and location
- 🎨 **Beautiful UI**: Modern design with smooth animations and 3D hover effects

## API Usage

This project uses the [OpenWeatherMap API](https://openweathermap.org/api) to fetch real-time weather data:

- **Current Weather Data**: API endpoint for current weather conditions
- **5-Day Forecast**: API endpoint for 5-day weather predictions
- **Geocoding API**: For location-based weather data

### Getting API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Generate your API key
5. Replace `YOUR_API_KEY` in `script.js` with your actual API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/smart-weather-dashboard.git
```

2. Navigate to the project directory:
```bash
cd smart-weather-dashboard
```

3. Open `index.html` in your web browser or deploy to a web server

## File Structure

```
smart-weather-dashboard/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Usage

1. Open the application in your web browser
2. Allow location access for automatic weather detection
3. Or search for any city using the search bar
4. Customize notification intervals as preferred
5. Toggle between light and dark mode using the theme switch

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Variables)
- JavaScript (ES6+)
- OpenWeatherMap API
- Font Awesome Icons
- SweetAlert2 for notifications

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Notifications by [SweetAlert2](https://sweetalert2.github.io/)

---

**Note**: Remember to add your own OpenWeatherMap API key for the application to work properly.