// DOM Elements
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const cityNameElement = document.getElementById('city-name');
const temperatureElement = document.getElementById('temperature');
const weatherIconElement = document.getElementById('weather-icon');
const weatherDescElement = document.getElementById('weather-description');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const intervalButtons = document.querySelectorAll('.interval-btn');
const suggestionsContainer = document.getElementById('suggestions');
const notificationPermissionBtn = document.getElementById('notification-permission-btn');

// Global variables
let userName = '';
let userCity = 'Dhaka';
let userCoords = { lat: 23.8103, lon: 90.4125 }; // Default to Dhaka
let updateInterval = 30; // minutes
let weatherData = null;
let notificationTimer = null;
let notificationPermission = false;

// API Key - Using your provided key
const apiKey = '996d9b7d732693136f6ef46cb07e05df';

// City database for suggestions - All districts of Bangladesh + major international cities
const cityDatabase = [
    // All Districts of Bangladesh
    "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi",
    "Rajbari", "Shariatpur", "Tangail", "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura",
    "Meherpur", "Narail", "Satkhira", "Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Bandarban",
    "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati",
    "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet", "Bogra", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna",
    "Rajshahi", "Sirajganj", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",

    // Major Upazilas of Bangladesh
    "Savar", "Keraniganj", "Dohar", "Nawabganj", "Dhamrai", "Tejgaon", "Gulshan", "Banani", "Uttara", "Mirpur",
    "Pallabi", "Kafrul", "Cantonment", "Demra", "Shyampur", "Sutrapur", "Rampura", "Khilgaon", "Badda", "Shahbagh",
    "Motijheel", "Paltan", "Jatrabari", "Kadamtali", "Kamrangirchar", "Hazaribagh", "Lalbagh", "Chawkbazar", "Kotwali", "Sabujbagh",
    "Mohammadpur", "Dhanmondi", "Adabar", "Sher-e-Bangla Nagar", "Shyamoli", "Tongi", "Kaliakair", "Sreepur", "Kapasia", "Kaliganj",
    "Narayanganj Sadar", "Sonargaon", "Bandar", "Araihazar", "Rupganj", "Siddhirganj", "Munshiganj Sadar", "Sirajdikhan", "Tongibari", "Lohajang",
    "Gazipur Sadar", "Kaliakair", "Sreepur", "Kapasia", "Kaliganj", "Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Shibpur",
    "Tangail Sadar", "Kalihati", "Basail", "Madhupur", "Ghatail", "Sakhipur", "Mirzapur", "Nagarpur", "Bhuapur", "Dhanbari",

    // Major International Cities
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Jacksonville", "Fort Worth", "Columbus", "Indianapolis", "Charlotte", "San Francisco", "Seattle", "Denver", "Washington",
    "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
    "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City", "Long Beach", "Mesa", "Atlanta", "Colorado Springs",
    "Virginia Beach", "Raleigh", "Omaha", "Miami", "Oakland", "Minneapolis", "Tulsa", "Wichita", "New Orleans", "Arlington",
    "London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Newcastle", "Sheffield", "Bristol", "Nottingham", "Southampton",
    "Glasgow", "Edinburgh", "Cardiff", "Belfast", "Leicester", "Coventry", "Bradford", "Plymouth", "Stoke-on-Trent", "Wolverhampton",
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Saitama",
    "Hiroshima", "Sendai", "Chiba", "Kitakyushu", "Setagaya", "Sakai", "Niigata", "Hamamatsu", "Shizuoka", "Sagamihara",
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
    "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne",
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Hobart",
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig",
    "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don",
    "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Chongqing", "Tianjin", "Nanjing", "Wuhan", "Xi'an",
    "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said", "Suez", "Luxor", "al-Mansura", "El-Mahalla El-Kubra", "Tanta",
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Rio de Janeiro", "São Paulo", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre",
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
    "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan", "Dibba",
    "Singapore", "Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Krabi", "Hua Hin", "Koh Samui", "Ayutthaya", "Chonburi",
    "Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Kuching", "Kota Kinabalu", "Shah Alam", "Malacca City", "Alor Setar", "Miri"
];

// Initialize the app
function initApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Check if user has previously provided name
    userName = localStorage.getItem('weatherUserName');
    if (!userName) {
        askForUserName();
    } else {
        showWelcomeMessage(userName);
    }

    // Load user preferences
    const savedCity = localStorage.getItem('weatherCity');
    if (savedCity) {
        userCity = savedCity;
        searchInput.value = userCity;
    }

    const savedCoords = localStorage.getItem('weatherCoords');
    if (savedCoords) {
        userCoords = JSON.parse(savedCoords);
    }

    const savedInterval = localStorage.getItem('updateInterval');
    if (savedInterval) {
        updateInterval = parseInt(savedInterval);
        setActiveIntervalButton(updateInterval);
    }

    // Load theme preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Show loading state
    showLoadingState();

    // Check if browser supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userCoords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                localStorage.setItem('weatherCoords', JSON.stringify(userCoords));
                fetchWeatherDataByCoords(userCoords.lat, userCoords.lon);
            },
            error => {
                console.error('Geolocation error:', error);
                fetchWeatherData(userCity);
            },
            { timeout: 10000 } // 10 seconds timeout
        );
    } else {
        fetchWeatherData(userCity);
    }

    // Set up periodic updates
    setupWeatherUpdates();

    // Check notification permission
    checkNotificationPermission();
}

// Show loading state
function showLoadingState() {
    cityNameElement.textContent = "Loading...";
    temperatureElement.textContent = "--°C";
    weatherDescElement.textContent = "Fetching weather data";
    feelsLikeElement.textContent = "--°C";
    humidityElement.textContent = "--%";
    windSpeedElement.textContent = "-- km/h";
    pressureElement.textContent = "-- hPa";
    visibilityElement.textContent = "-- km";
    document.getElementById('coordinates').textContent = "--° N, --° E";
    document.getElementById('last-updated').textContent = "Just now";

    forecastContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">Loading...</div>
            <i class="fas fa-sync forecast-icon"></i>
            <div class="forecast-temp">--°C</div>
            <div class="weather-desc">Loading data</div>
        `;
        forecastContainer.appendChild(forecastCard);
    }
}

// Ask for user's name with SweetAlert
function askForUserName() {
    Swal.fire({
        title: 'Welcome to Smart Weather!',
        input: 'text',
        inputLabel: 'What should we call you?',
        inputPlaceholder: 'Enter your name',
        showCancelButton: false,
        confirmButtonText: 'Continue',
        allowOutsideClick: false,
        inputValidator: (value) => {
            if (!value) {
                return 'Please enter your name!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            userName = result.value;
            localStorage.setItem('weatherUserName', userName);
            showWelcomeMessage(userName);
        }
    });
}

// Show welcome message with user's name
function showWelcomeMessage(name) {
    Swal.fire({
        title: `Hello, ${name}!`,
        text: 'Welcome to your personalized weather dashboard.',
        icon: 'success',
        confirmButtonText: 'Get Weather Updates'
    });
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    timeElement.textContent = now.toLocaleTimeString([], timeOptions);
    dateElement.textContent = now.toLocaleDateString([], dateOptions);
}

// Fetch weather data from API by city name
async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'City not found');
        }

        const data = await response.json();

        // Validate data
        if (!data || !data.main || !data.weather) {
            throw new Error('Invalid data received from server');
        }

        // Update coordinates
        userCoords = {
            lat: data.coord.lat,
            lon: data.coord.lon
        };
        localStorage.setItem('weatherCoords', JSON.stringify(userCoords));

        // Process weather data
        processWeatherData(data);

        // Fetch forecast
        fetchForecastData();

    } catch (error) {
        console.error('Error fetching weather data:', error);
        Swal.fire({
            title: 'Error',
            text: `Could not fetch weather data: ${error.message}. Please check the city name and try again.`,
            icon: 'error'
        });
    }
}

// Fetch weather data by coordinates
async function fetchWeatherDataByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Location not found');
        }

        const data = await response.json();

        // Validate data
        if (!data || !data.main || !data.weather) {
            throw new Error('Invalid data received from server');
        }

        processWeatherData(data);
        fetchForecastData();

    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Fallback to default city
        fetchWeatherData(userCity);
    }
}

// Fetch forecast data
async function fetchForecastData() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${userCoords.lat}&lon=${userCoords.lon}&appid=${apiKey}&units=metric`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Forecast not available');
        }

        const data = await response.json();

        // Validate data
        if (!data || !data.list) {
            throw new Error('Invalid forecast data received from server');
        }

        processForecastData(data);

    } catch (error) {
        console.error('Error fetching forecast data:', error);
        Swal.fire({
            title: 'Forecast Unavailable',
            text: '5-day forecast data is not available at the moment.',
            icon: 'info',
            timer: 3000
        });
    }
}

// Process weather data
function processWeatherData(data) {
    weatherData = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].main,
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: (data.wind.speed * 3.6).toFixed(1), // Convert m/s to km/h
        pressure: data.main.pressure,
        visibility: (data.visibility / 1000).toFixed(1), // Convert meters to km
        icon: getWeatherIcon(data.weather[0].icon),
        coordinates: `${data.coord.lat.toFixed(4)}° N, ${data.coord.lon.toFixed(4)}° E`
    };

    updateWeatherUI();
}

// Process forecast data correctly
function processForecastData(data) {
    // OpenWeatherMap provides forecast data for every 3 hours (5 days = 40 items)
    // We need to get one forecast per day (usually around 12:00 PM)
    const dailyForecasts = [];
    const seenDays = new Set();

    for (let i = 0; i < data.list.length; i++) {
        const item = data.list[i];
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString();

        // Get one forecast per day (around 12:00 PM if available)
        if (!seenDays.has(day)) {
            seenDays.add(day);

            dailyForecasts.push({
                date: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
                temp: Math.round(item.main.temp),
                icon: getWeatherIcon(item.weather[0].icon),
                description: item.weather[0].main
            });

            // We only need 5 days forecast
            if (dailyForecasts.length >= 5) break;
        }
    }

    weatherData.forecast = dailyForecasts;
    updateForecastUI();
}

// Get weather icon based on OpenWeatherMap icon code
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud-sun',
        '02n': 'cloud-moon',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud',
        '04n': 'cloud',
        '09d': 'cloud-rain',
        '09n': 'cloud-rain',
        '10d': 'cloud-sun-rain',
        '10n': 'cloud-moon-rain',
        '11d': 'bolt',
        '11n': 'bolt',
        '13d': 'snowflake',
        '13n': 'snowflake',
        '50d': 'smog',
        '50n': 'smog'
    };

    return iconMap[iconCode] || 'sun';
}

// Update UI with weather data
function updateWeatherUI() {
    if (!weatherData) return;

    cityNameElement.textContent = `${weatherData.city}, ${weatherData.country}`;
    temperatureElement.textContent = `${weatherData.temperature}°C`;
    weatherDescElement.textContent = weatherData.description;
    feelsLikeElement.textContent = `${weatherData.feelsLike}°C`;
    humidityElement.textContent = `${weatherData.humidity}%`;
    windSpeedElement.textContent = `${weatherData.windSpeed} km/h`;
    pressureElement.textContent = `${weatherData.pressure} hPa`;
    visibilityElement.textContent = `${weatherData.visibility} km`;
    document.getElementById('coordinates').textContent = weatherData.coordinates;

    // Set weather icon
    weatherIconElement.className = `fas fa-${weatherData.icon}`;

    // Update last updated time
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}

// Update forecast UI
function updateForecastUI() {
    if (!weatherData || !weatherData.forecast) return;

    forecastContainer.innerHTML = '';

    weatherData.forecast.forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${day.date}</div>
            <i class="fas fa-${day.icon} forecast-icon"></i>
            <div class="forecast-temp">${day.temp}°C</div>
            <div class="weather-desc">${day.description}</div>
        `;

        forecastContainer.appendChild(forecastCard);
    });
}

// Show city suggestions
function showSuggestions(query) {
    if (!query) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const filteredCities = cityDatabase.filter(city =>
        city.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredCities.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';
    filteredCities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = city;
        item.addEventListener('click', () => {
            searchInput.value = city;
            suggestionsContainer.style.display = 'none';
            userCity = city;
            localStorage.setItem('weatherCity', userCity);
            fetchWeatherData(userCity);
        });
        suggestionsContainer.appendChild(item);
    });

    suggestionsContainer.style.display = 'block';
}

// Set active interval button
function setActiveIntervalButton(interval) {
    intervalButtons.forEach(btn => {
        if (parseInt(btn.dataset.interval) === interval) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Setup weather updates with interval
function setupWeatherUpdates() {
    if (notificationTimer) {
        clearInterval(notificationTimer);
    }

    notificationTimer = setInterval(() => {
        if (userCoords) {
            fetchWeatherDataByCoords(userCoords.lat, userCoords.lon);
        } else {
            fetchWeatherData(userCity);
        }

        if (notificationPermission) {
            showNotification();
        }
    }, updateInterval * 60 * 1000);
}

// Check notification permission
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        notificationPermissionBtn.style.display = 'none';
        return;
    }

    if (Notification.permission === 'granted') {
        notificationPermission = true;
        notificationPermissionBtn.textContent = 'Notifications Enabled';
        notificationPermissionBtn.disabled = true;
    } else if (Notification.permission === 'denied') {
        notificationPermissionBtn.style.display = 'none';
    }
}

// Request notification permission
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        Swal.fire({
            title: 'Notifications not supported',
            text: 'Your browser does not support notifications.',
            icon: 'warning'
        });
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            notificationPermission = true;
            notificationPermissionBtn.textContent = 'Notifications Enabled';
            notificationPermissionBtn.disabled = true;
            showNotification();
        } else {
            Swal.fire({
                title: 'Permission denied',
                text: 'You will not receive notification updates.',
                icon: 'info'
            });
        }
    });
}

// Show notification
function showNotification() {
    if (!weatherData || !notificationPermission) return;

    const notification = new Notification('Weather Update', {
        body: `Current temperature in ${weatherData.city} is ${weatherData.temperature}°C - ${weatherData.description}`,
        icon: 'https://example.com/icon.png' // Replace with your icon URL
    });

    setTimeout(() => {
        notification.close();
    }, 5000);
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    if (searchInput.value.trim() !== '') {
        userCity = searchInput.value.trim();
        localStorage.setItem('weatherCity', userCity);
        fetchWeatherData(userCity);
        suggestionsContainer.style.display = 'none';
    }
});

searchInput.addEventListener('input', () => {
    showSuggestions(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        userCity = searchInput.value.trim();
        localStorage.setItem('weatherCity', userCity);
        fetchWeatherData(userCity);
        suggestionsContainer.style.display = 'none';
    }
});

searchInput.addEventListener('blur', () => {
    setTimeout(() => {
        suggestionsContainer.style.display = 'none';
    }, 200);
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('darkMode', null);
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

intervalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        updateInterval = parseInt(btn.dataset.interval);
        localStorage.setItem('updateInterval', updateInterval);
        setActiveIntervalButton(updateInterval);
        setupWeatherUpdates();

        Swal.fire({
            title: 'Update Interval Changed',
            text: `Weather will update every ${updateInterval} minutes.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    });
});

notificationPermissionBtn.addEventListener('click', requestNotificationPermission);

// Initialize the app
window.addEventListener('load', initApp);