/**
 * AuraWeather Studio — Master Client Application Logic
 * Telemetry, Meteorologic Analytics, Air Quality, Forecast Matrices & Geolocation
 * Author: Musfiq Ayon (Full-Stack Engineer & UI/UX Specialist)
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. CONFIGURATION & STATE
    // =========================================================================
    const apiKey = '996d9b7d732693136f6ef46cb07e05df';

    let currentUnit = localStorage.getItem('aura_unit') || 'metric'; // 'metric' (°C) or 'imperial' (°F)
    let currentCity = localStorage.getItem('aura_default_city') || 'Dhaka';
    let currentCoords = { lat: 23.8103, lon: 90.4125 }; // Default to Dhaka
    let currentWeatherRaw = null;
    let currentForecastRaw = null;
    let currentAqiRaw = null;

    let favoriteCities = JSON.parse(localStorage.getItem('aura_favorites') || '["Dhaka", "Chattogram", "Sylhet", "London", "New York"]');
    let notificationInterval = parseInt(localStorage.getItem('aura_notify_interval') || '0', 10);
    let notificationTimer = null;

    // =========================================================================
    // 2. CITY AUTOCOMPLETE DATABASE (All BD Districts + Upazilas + Major Global)
    // =========================================================================
    const cityDatabase = [
        // All 64 Districts of Bangladesh
        "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi",
        "Rajbari", "Shariatpur", "Tangail", "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura",
        "Meherpur", "Narail", "Satkhira", "Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Bandarban",
        "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati",
        "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet", "Bogra", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna",
        "Rajshahi", "Sirajganj", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
        "Mymensingh", "Jamalpur", "Netrokona", "Sherpur",

        // Notable Upazilas & Hubs of Bangladesh
        "Savar", "Keraniganj", "Dhamrai", "Uttara", "Mirpur", "Gulshan", "Banani", "Dhanmondi", "Tongi", "Kaliakair", "Sreepur",
        "Rupganj", "Siddhirganj", "Teknaf", "Hathazari", "Sitakunda", "Patiya", "Srimangal", "Kulaura", "Ishwardi", "Saidpur",

        // Major Global Capitals & Metropolitan Cities
        "London", "New York", "Tokyo", "Paris", "Dubai", "Singapore", "Sydney", "Berlin", "Toronto", "Los Angeles", "Chicago",
        "San Francisco", "Rome", "Madrid", "Amsterdam", "Vienna", "Zurich", "Bangkok", "Kuala Lumpur", "Seoul", "Beijing",
        "Shanghai", "Hong Kong", "Mumbai", "Delhi", "Kolkata", "Chennai", "Bangalore", "Karachi", "Lahore", "Islamabad", "Kathmandu",
        "Colombo", "Male", "Riyadh", "Jeddah", "Doha", "Istanbul", "Cairo", "Cape Town", "Melbourne", "Auckland", "Sao Paulo", "Buenos Aires"
    ];

    // =========================================================================
    // 3. DOM ELEMENTS CACHE
    // =========================================================================
    // Header
    const headerTime = document.getElementById('headerTime');
    const headerDate = document.getElementById('headerDate');
    const unitCelsius = document.getElementById('unitCelsius');
    const unitFahrenheit = document.getElementById('unitFahrenheit');
    const locateBtn = document.getElementById('locateBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const favCountBadge = document.getElementById('favCountBadge');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    // Search & Quick Chips
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchSubmitBtn = document.getElementById('searchSubmitBtn');
    const suggestionsPopover = document.getElementById('suggestionsPopover');
    const quickCitiesRow = document.getElementById('quickCitiesRow');
    const chipGps = document.getElementById('chipGps');
    const chipPinCurrent = document.getElementById('chipPinCurrent');

    // Hero Weather Card
    const heroCityName = document.getElementById('heroCityName');
    const heroFavToggle = document.getElementById('heroFavToggle');
    const heroCoordinates = document.getElementById('heroCoordinates');
    const lastUpdatedText = document.getElementById('lastUpdatedText');
    const refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
    const heroTemperature = document.getElementById('heroTemperature');
    const heroTempUnit = document.getElementById('heroTempUnit');
    const heroConditionIcon = document.getElementById('heroConditionIcon');
    const heroConditionBadge = document.getElementById('heroConditionBadge');
    const heroConditionText = document.getElementById('heroConditionText');
    const heroFeelsLike = document.getElementById('heroFeelsLike');
    const heroTempMax = document.getElementById('heroTempMax');
    const heroTempMin = document.getElementById('heroTempMin');
    const heroConditionSummary = document.getElementById('heroConditionSummary');

    // Sun & Celestial Cycle
    const daylightDuration = document.getElementById('daylightDuration');
    const sunProgressFill = document.getElementById('sunProgressFill');
    const sunMarker = document.getElementById('sunMarker');
    const sunriseTime = document.getElementById('sunriseTime');
    const sunsetTime = document.getElementById('sunsetTime');
    const daylightSubtext = document.getElementById('daylightSubtext');

    // Smart Advisory
    const smartAdvisoryBanner = document.getElementById('smartAdvisoryBanner');
    const advisoryIconRing = document.getElementById('advisoryIconRing');
    const advisoryHeading = document.getElementById('advisoryHeading');
    const advisoryText = document.getElementById('advisoryText');

    // Hourly Forecast
    const hourlyTimeline = document.getElementById('hourlyTimeline');
    const hourlyScrollLeft = document.getElementById('hourlyScrollLeft');
    const hourlyScrollRight = document.getElementById('hourlyScrollRight');

    // Metrics Grid
    const metricHumidity = document.getElementById('metricHumidity');
    const humidityStatus = document.getElementById('humidityStatus');
    const humidityBar = document.getElementById('humidityBar');
    const metricDewPoint = document.getElementById('metricDewPoint');

    const metricWindSpeed = document.getElementById('metricWindSpeed');
    const windSpeedUnit = document.getElementById('windSpeedUnit');
    const windStatus = document.getElementById('windStatus');
    const windCompassNeedle = document.getElementById('windCompassNeedle');
    const windDirectionLabel = document.getElementById('windDirectionLabel');
    const metricWindGust = document.getElementById('metricWindGust');

    const aqiLevelBadge = document.getElementById('aqiLevelBadge');
    const metricAqiValue = document.getElementById('metricAqiValue');
    const aqiBar = document.getElementById('aqiBar');
    const metricPm25 = document.getElementById('metricPm25');
    const metricPm10 = document.getElementById('metricPm10');

    const metricPressure = document.getElementById('metricPressure');
    const pressureStatus = document.getElementById('pressureStatus');
    const pressureBar = document.getElementById('pressureBar');

    const metricVisibility = document.getElementById('metricVisibility');
    const visibilityUnit = document.getElementById('visibilityUnit');
    const visibilityStatus = document.getElementById('visibilityStatus');
    const visibilityBar = document.getElementById('visibilityBar');
    const visibilitySub = document.getElementById('visibilitySub');

    const metricCloudCover = document.getElementById('metricCloudCover');
    const cloudStatus = document.getElementById('cloudStatus');
    const cloudCoverBar = document.getElementById('cloudCoverBar');
    const metricUvIndex = document.getElementById('metricUvIndex');

    // 5-Day Forecast
    const dailyForecastGrid = document.getElementById('dailyForecastGrid');

    // Modals & Drawers
    const favoritesBackdrop = document.getElementById('favoritesBackdrop');
    const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
    const addCurrentToFavsBtn = document.getElementById('addCurrentToFavsBtn');
    const currentCityPinLabel = document.getElementById('currentCityPinLabel');
    const favoritesList = document.getElementById('favoritesList');

    const settingsBackdrop = document.getElementById('settingsBackdrop');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const settingUserName = document.getElementById('settingUserName');
    const settingDefaultCity = document.getElementById('settingDefaultCity');
    const settingUnitsChoice = document.getElementById('settingUnitsChoice');
    const settingNotifyInterval = document.getElementById('settingNotifyInterval');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    const toastHub = document.getElementById('toastHub');

    // =========================================================================
    // 4. TOAST NOTIFICATION SYSTEM
    // =========================================================================
    const Toast = {
        show(title, desc = '', type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `app-toast toast-${type}`;

            let iconClass = 'fa-circle-info';
            if (type === 'success') iconClass = 'fa-circle-check';
            else if (type === 'error') iconClass = 'fa-circle-exclamation';
            else if (type === 'warning') iconClass = 'fa-triangle-exclamation';

            toast.innerHTML = `
                <i class="fas ${iconClass} toast-sym"></i>
                <div class="toast-msg-box">
                    <div class="toast-main-msg">${escapeHtml(title)}</div>
                    ${desc ? `<div class="toast-sub-msg">${escapeHtml(desc)}</div>` : ''}
                </div>
            `;

            toastHub.appendChild(toast);

            let timer = setTimeout(() => dismiss(toast), duration);
            toast.addEventListener('mouseenter', () => clearTimeout(timer));
            toast.addEventListener('mouseleave', () => {
                timer = setTimeout(() => dismiss(toast), 1500);
            });
        },
        success(title, desc) { this.show(title, desc, 'success'); },
        error(title, desc) { this.show(title, desc, 'error'); },
        info(title, desc) { this.show(title, desc, 'info'); },
        warning(title, desc) { this.show(title, desc, 'warning'); }
    };

    function dismiss(toast) {
        toast.style.transform = 'translateY(-10px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // =========================================================================
    // 5. LIVE CLOCK & THEME SYSTEM
    // =========================================================================
    function updateClock() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const dateOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };

        if (headerTime) headerTime.textContent = now.toLocaleTimeString([], timeOptions);
        if (headerDate) headerDate.textContent = now.toLocaleDateString([], dateOptions);
    }

    setInterval(updateClock, 1000);
    updateClock();

    function initTheme() {
        const saved = localStorage.getItem('aura_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('aura_theme', next);
            updateThemeIcon(next);
            Toast.info("Theme Switched", `Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`);
        });
    }

    initTheme();

    // =========================================================================
    // 6. UNIT CONVERTER SYSTEM (°C vs °F)
    // =========================================================================
    function setUnit(unit) {
        if (currentUnit === unit) return;
        currentUnit = unit;
        localStorage.setItem('aura_unit', unit);

        if (unit === 'metric') {
            unitCelsius.classList.add('active');
            unitFahrenheit.classList.remove('active');
        } else {
            unitFahrenheit.classList.add('active');
            unitCelsius.classList.remove('active');
        }

        // Re-render data with converted units
        if (currentWeatherRaw && currentForecastRaw) {
            fetchWeatherDataByCoords(currentCoords.lat, currentCoords.lon, false);
        }
    }

    unitCelsius.addEventListener('click', () => setUnit('metric'));
    unitFahrenheit.addEventListener('click', () => setUnit('imperial'));

    function getTempSymbol() {
        return currentUnit === 'metric' ? '°C' : '°F';
    }

    function getSpeedSymbol() {
        return currentUnit === 'metric' ? 'km/h' : 'mph';
    }

    function getDistSymbol() {
        return currentUnit === 'metric' ? 'km' : 'mi';
    }

    // =========================================================================
    // 7. OPENWEATHERMAP API TELEMETRY SERVICES
    // =========================================================================
    async function fetchWeatherByCity(cityName, notify = true) {
        if (!cityName || !cityName.trim()) return;
        setLoadingState(true);

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName.trim())}&appid=${apiKey}&units=${currentUnit}`;
            const res = await fetch(url);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "City not found in meteorologic database");
            }

            const data = await res.json();
            currentWeatherRaw = data;
            currentCoords = { lat: data.coord.lat, lon: data.coord.lon };
            currentCity = data.name;

            renderCurrentWeather(data);

            // Fetch parallel forecast & air quality
            await Promise.all([
                fetchForecast(data.coord.lat, data.coord.lon),
                fetchAirPollution(data.coord.lat, data.coord.lon)
            ]);

            setLoadingState(false);
            if (notify) Toast.success("Telemetry Synced", `Live weather for ${data.name}, ${data.sys.country}`);
            updateQuickChipsActive(data.name);
            updateFavStarIcon(data.name);

        } catch (error) {
            console.error("Fetch weather error:", error);
            setLoadingState(false);
            Toast.error("Location Not Found", error.message);
        }
    }

    async function fetchWeatherDataByCoords(lat, lon, notify = true) {
        setLoadingState(true);
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Could not fetch location coordinates");

            const data = await res.json();
            currentWeatherRaw = data;
            currentCoords = { lat: data.coord.lat, lon: data.coord.lon };
            currentCity = data.name;

            renderCurrentWeather(data);

            await Promise.all([
                fetchForecast(lat, lon),
                fetchAirPollution(lat, lon)
            ]);

            setLoadingState(false);
            if (notify) Toast.success("GPS Telemetry Locked", `${data.name}, ${data.sys.country}`);
            updateQuickChipsActive(data.name);
            updateFavStarIcon(data.name);

        } catch (error) {
            console.error("Coords weather error:", error);
            setLoadingState(false);
            Toast.error("GPS Fetch Error", error.message);
        }
    }

    async function fetchForecast(lat, lon) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
            const res = await fetch(url);
            if (!res.ok) return;

            const data = await res.json();
            currentForecastRaw = data;
            renderHourlyForecast(data.list);
            renderDailyForecast(data.list);
        } catch (e) {
            console.warn("Forecast fetch warning:", e);
        }
    }

    async function fetchAirPollution(lat, lon) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            const res = await fetch(url);
            if (!res.ok) return;

            const data = await res.json();
            currentAqiRaw = data;
            renderAirQuality(data);
        } catch (e) {
            console.warn("AQI fetch warning:", e);
        }
    }

    function setLoadingState(loading) {
        if (refreshWeatherBtn) {
            if (loading) refreshWeatherBtn.classList.add('spinning');
            else refreshWeatherBtn.classList.remove('spinning');
        }
    }

    // =========================================================================
    // 8. WEATHER ICON MAPPINGS
    // =========================================================================
    function getWeatherIcon(iconCode, mainCondition) {
        const iconMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-showers-heavy',
            '09n': 'fa-cloud-showers-heavy',
            '10d': 'fa-cloud-sun-rain',
            '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-cloud-bolt',
            '11n': 'fa-cloud-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };

        if (iconMap[iconCode]) return `fas ${iconMap[iconCode]}`;
        
        // Fallback by condition name
        const cond = (mainCondition || '').toLowerCase();
        if (cond.includes('clear')) return 'fas fa-sun';
        if (cond.includes('cloud')) return 'fas fa-cloud';
        if (cond.includes('rain')) return 'fas fa-cloud-rain';
        if (cond.includes('thunder')) return 'fas fa-cloud-bolt';
        if (cond.includes('snow')) return 'fas fa-snowflake';
        if (cond.includes('mist') || cond.includes('haze') || cond.includes('fog')) return 'fas fa-smog';
        return 'fas fa-cloud-sun';
    }

    // =========================================================================
    // 9. UI RENDERING ENGINES
    // =========================================================================
    function renderCurrentWeather(data) {
        // Location & Coordinates
        heroCityName.textContent = `${data.name}, ${data.sys.country}`;
        currentCityPinLabel.textContent = data.name;
        heroCoordinates.textContent = `${data.coord.lat.toFixed(4)}° N, ${data.coord.lon.toFixed(4)}° E`;

        const now = new Date();
        lastUpdatedText.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Temperature & Condition
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const tempMax = Math.round(data.main.temp_max);
        const tempMin = Math.round(data.main.temp_min);

        heroTemperature.textContent = temp;
        heroTempUnit.textContent = getTempSymbol();
        heroFeelsLike.textContent = `${feelsLike}${getTempSymbol()}`;
        heroTempMax.textContent = `${tempMax}${getTempSymbol()}`;
        heroTempMin.textContent = `${tempMin}${getTempSymbol()}`;

        const weatherDesc = data.weather[0]?.main || 'Clear';
        const weatherDetails = data.weather[0]?.description || '';
        const iconClass = getWeatherIcon(data.weather[0]?.icon, weatherDesc);

        heroConditionBadge.innerHTML = `<i class="${iconClass}"></i> <span id="heroConditionText">${escapeHtml(weatherDesc)}</span>`;
        heroConditionIcon.innerHTML = `<i class="${iconClass}"></i>`;

        // Atmospheric condition summary sentence
        const windKmh = currentUnit === 'metric' ? (data.wind.speed * 3.6).toFixed(1) : (data.wind.speed).toFixed(1);
        heroConditionSummary.textContent = `${capitalize(weatherDetails)} with a ${windKmh} ${getSpeedSymbol()} breeze. Humidity currently sits at ${data.main.humidity}%.`;

        // Celestial Cycle / Sun Progress
        renderCelestialCycle(data.sys.sunrise, data.sys.sunset, data.timezone);

        // Metrics Grid (Humidity, Wind, Pressure, Visibility, Clouds)
        renderMetrics(data);

        // Smart Weather Advisory
        renderSmartAdvisory(data);
    }

    function renderCelestialCycle(sunriseUnix, sunsetUnix, timezoneOffset) {
        if (!sunriseUnix || !sunsetUnix) return;

        const nowUnix = Math.floor(Date.now() / 1000);
        const sunriseDate = new Date(sunriseUnix * 1000);
        const sunsetDate = new Date(sunsetUnix * 1000);

        sunriseTime.textContent = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sunsetTime.textContent = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const totalDaylightSec = sunsetUnix - sunriseUnix;
        const hours = Math.floor(totalDaylightSec / 3600);
        const mins = Math.floor((totalDaylightSec % 3600) / 60);
        daylightDuration.textContent = `${hours}h ${mins}m`;

        // Calculate progress percentage
        let progress = 0;
        if (nowUnix >= sunsetUnix) {
            progress = 100;
            daylightSubtext.innerHTML = '<i class="fas fa-moon text-violet"></i> Sun has set. Night cycle active.';
        } else if (nowUnix <= sunriseUnix) {
            progress = 0;
            const diffHours = Math.round((sunriseUnix - nowUnix) / 3600);
            daylightSubtext.innerHTML = `<i class="fas fa-clock text-amber"></i> Dawn approaching in approx. ${diffHours}h`;
        } else {
            progress = Math.min(100, Math.max(0, Math.round(((nowUnix - sunriseUnix) / totalDaylightSec) * 100)));
            const hoursLeft = Math.floor((sunsetUnix - nowUnix) / 3600);
            const minsLeft = Math.floor(((sunsetUnix - nowUnix) % 3600) / 60);
            daylightSubtext.innerHTML = `<i class="fas fa-sun text-amber"></i> Sunset in ${hoursLeft}h ${minsLeft}m`;
        }

        sunProgressFill.style.width = `${progress}%`;
        sunMarker.style.left = `${progress}%`;
    }

    function renderMetrics(data) {
        // 1. Humidity
        metricHumidity.textContent = data.main.humidity;
        humidityBar.style.width = `${data.main.humidity}%`;
        if (data.main.humidity > 70) humidityStatus.textContent = 'High';
        else if (data.main.humidity < 30) humidityStatus.textContent = 'Dry';
        else humidityStatus.textContent = 'Optimal';

        // Dew Point approximation: T - ((100 - RH) / 5)
        const dewPoint = Math.round(data.main.temp - ((100 - data.main.humidity) / 5));
        metricDewPoint.textContent = `${dewPoint}${getTempSymbol()}`;

        // 2. Wind & Direction
        const speed = currentUnit === 'metric' ? (data.wind.speed * 3.6).toFixed(1) : (data.wind.speed).toFixed(1);
        metricWindSpeed.textContent = speed;
        windSpeedUnit.textContent = getSpeedSymbol();

        const deg = data.wind.deg || 0;
        windCompassNeedle.style.transform = `rotate(${deg}deg)`;
        windDirectionLabel.textContent = `${deg}° ${getCardinalDirection(deg)}`;

        if (speed < 10) windStatus.textContent = 'Gentle';
        else if (speed < 25) windStatus.textContent = 'Moderate';
        else windStatus.textContent = 'Brisk';

        const gustSpeed = data.wind.gust 
            ? (currentUnit === 'metric' ? (data.wind.gust * 3.6).toFixed(1) : data.wind.gust.toFixed(1))
            : (parseFloat(speed) * 1.3).toFixed(1);
        metricWindGust.textContent = `${gustSpeed} ${getSpeedSymbol()}`;

        // 3. Pressure
        metricPressure.textContent = data.main.pressure;
        const pressurePercent = Math.min(100, Math.max(0, ((data.main.pressure - 970) / 70) * 100));
        pressureBar.style.width = `${pressurePercent}%`;
        if (data.main.pressure > 1020) pressureStatus.textContent = 'High';
        else if (data.main.pressure < 1005) pressureStatus.textContent = 'Low';
        else pressureStatus.textContent = 'Steady';

        // 4. Visibility
        const visKm = (data.visibility / 1000).toFixed(1);
        const visFinal = currentUnit === 'metric' ? visKm : (visKm * 0.621371).toFixed(1);
        metricVisibility.textContent = visFinal;
        visibilityUnit.textContent = getDistSymbol();

        const visPercent = Math.min(100, (data.visibility / 10000) * 100);
        visibilityBar.style.width = `${visPercent}%`;

        if (data.visibility >= 10000) {
            visibilityStatus.textContent = 'Excellent';
            visibilitySub.textContent = 'Clear view of distant horizon';
        } else if (data.visibility >= 5000) {
            visibilityStatus.textContent = 'Good';
            visibilitySub.textContent = 'Normal atmospheric transparency';
        } else {
            visibilityStatus.textContent = 'Reduced';
            visibilitySub.textContent = 'Atmospheric haze or mist present';
        }

        // 5. Cloud Cover & Estimated UV
        metricCloudCover.textContent = data.clouds.all;
        cloudCoverBar.style.width = `${data.clouds.all}%`;
        if (data.clouds.all > 80) cloudStatus.textContent = 'Overcast';
        else if (data.clouds.all > 40) cloudStatus.textContent = 'Partly Cloudy';
        else cloudStatus.textContent = 'Clear Skies';

        // Approximate UV from time and cloud cover
        const now = new Date();
        const hr = now.getHours();
        let uvVal = "Low (1-2)";
        if (hr >= 10 && hr <= 15) {
            if (data.clouds.all < 30) uvVal = "Very High (7-8)";
            else if (data.clouds.all < 60) uvVal = "Moderate (5-6)";
            else uvVal = "Low (2-3)";
        } else if (hr >= 8 && hr <= 17) {
            uvVal = "Moderate (3-4)";
        }
        metricUvIndex.textContent = uvVal;
    }

    function renderAirQuality(data) {
        if (!data || !data.list || !data.list.length) return;

        const aqi = data.list[0].main.aqi; // 1 to 5
        const comp = data.list[0].components;

        metricAqiValue.textContent = aqi;
        aqiBar.style.width = `${(aqi / 5) * 100}%`;

        const aqiMap = {
            1: { text: 'Good', badgeClass: 'good', barColor: 'var(--accent-emerald)' },
            2: { text: 'Fair', badgeClass: 'fair', barColor: '#84CC16' },
            3: { text: 'Moderate', badgeClass: 'moderate', barColor: 'var(--accent-amber)' },
            4: { text: 'Poor', badgeClass: 'poor', barColor: '#F97316' },
            5: { text: 'Very Poor', badgeClass: 'poor', barColor: '#EF4444' }
        };

        const currentAqi = aqiMap[aqi] || aqiMap[3];
        aqiLevelBadge.textContent = currentAqi.text;
        aqiLevelBadge.className = `aqi-level-badge ${currentAqi.badgeClass}`;
        aqiBar.style.backgroundColor = currentAqi.barColor;

        metricPm25.textContent = `${comp.pm2_5 ? comp.pm2_5.toFixed(1) : '--'} µg/m³`;
        metricPm10.textContent = comp.pm10 ? comp.pm10.toFixed(1) : '--';
    }

    function renderHourlyForecast(list) {
        if (!list || !list.length) return;
        hourlyTimeline.innerHTML = '';

        // Take next 8 chunks (3-hour intervals = 24 hours)
        const next24Hours = list.slice(0, 8);

        next24Hours.forEach((item, index) => {
            const date = new Date(item.dt * 1000);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const temp = Math.round(item.main.temp);
            const iconClass = getWeatherIcon(item.weather[0]?.icon, item.weather[0]?.main);
            const popPercent = Math.round((item.pop || 0) * 100);
            const wind = currentUnit === 'metric' ? Math.round(item.wind.speed * 3.6) : Math.round(item.wind.speed);

            const card = document.createElement('div');
            card.className = 'hourly-card';
            card.innerHTML = `
                <span class="hourly-time">${index === 0 ? 'Now' : timeStr}</span>
                <i class="${iconClass} hourly-icon"></i>
                <span class="hourly-temp">${temp}${getTempSymbol()}</span>
                <span class="hourly-rain"><i class="fas fa-droplet"></i> ${popPercent}%</span>
                <span class="hourly-wind"><i class="fas fa-wind"></i> ${wind} ${getSpeedSymbol()}</span>
            `;
            hourlyTimeline.appendChild(card);
        });
    }

    function renderDailyForecast(list) {
        if (!list || !list.length) return;
        dailyForecastGrid.innerHTML = '';

        // Group by calendar day
        const dailyMap = new Map();

        list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];

            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, []);
            }
            dailyMap.get(dateKey).push(item);
        });

        // Skip day 0 (today) if we have 5 future days, else take 5 days
        const daysKeys = Array.from(dailyMap.keys()).slice(0, 5);

        daysKeys.forEach(key => {
            const items = dailyMap.get(key);
            const sample = items[Math.floor(items.length / 2)] || items[0];
            const date = new Date(sample.dt * 1000);

            const dayName = date.toLocaleDateString([], { weekday: 'short' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

            // Calculate daily min & max
            let high = -999;
            let low = 999;
            let maxPop = 0;
            let avgHumidity = 0;

            items.forEach(it => {
                if (it.main.temp_max > high) high = it.main.temp_max;
                if (it.main.temp_min < low) low = it.main.temp_min;
                if (it.pop && it.pop > maxPop) maxPop = it.pop;
                avgHumidity += it.main.humidity;
            });

            avgHumidity = Math.round(avgHumidity / items.length);
            const popPercent = Math.round(maxPop * 100);

            const iconClass = getWeatherIcon(sample.weather[0]?.icon, sample.weather[0]?.main);
            const condName = sample.weather[0]?.main || 'Clear';

            const card = document.createElement('div');
            card.className = 'daily-card';
            card.innerHTML = `
                <div class="daily-day-name">${dayName}</div>
                <div class="daily-date-sub">${dateStr}</div>
                <i class="${iconClass} daily-icon"></i>
                <div class="daily-condition-name">${escapeHtml(condName)}</div>
                <div class="daily-temp-range">
                    <span class="daily-high">${Math.round(high)}${getTempSymbol()}</span>
                    <span class="daily-low">${Math.round(low)}${getTempSymbol()}</span>
                </div>
                <div class="daily-humidity-rain">
                    <span><i class="fas fa-droplet"></i> ${popPercent}%</span>
                    <span>• ${avgHumidity}%</span>
                </div>
            `;
            dailyForecastGrid.appendChild(card);
        });
    }

    function renderSmartAdvisory(data) {
        const cond = (data.weather[0]?.main || '').toLowerCase();
        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const windKmh = data.wind.speed * 3.6;

        let icon = 'fa-wand-magic-sparkles';
        let heading = 'Comfortable Atmospheric Outlook';
        let advisory = 'Weather conditions are optimal. Favorable window for commuting, travel, and outdoor fitness.';

        if (cond.includes('rain') || cond.includes('drizzle')) {
            icon = 'fa-umbrella';
            heading = 'Precipitation Active';
            advisory = 'Rainfall present or likely. Roads may be slippery; carry an umbrella and factor extra commute time.';
        } else if (cond.includes('thunder')) {
            icon = 'fa-bolt-lightning';
            heading = 'Severe Thunderstorm Warning';
            advisory = 'Lightning risk in the area. Seek sturdy shelter and avoid open fields or trees.';
        } else if (cond.includes('snow')) {
            icon = 'fa-snowflake';
            heading = 'Freezing Snow Conditions';
            advisory = 'Icy sidewalks and reduced traction expected. Dress in thermal layers.';
        } else if (cond.includes('fog') || cond.includes('haze') || cond.includes('mist')) {
            icon = 'fa-smog';
            heading = 'Reduced Visibility / Haze';
            advisory = 'Atmospheric particulate density is elevated. Sensitive individuals should consider wearing a mask outdoors.';
        } else if (temp > 35) {
            icon = 'fa-temperature-high';
            heading = 'Excessive Heat Advisory';
            advisory = 'High thermal stress index. Avoid direct midday sun exposure, wear lightweight cotton, and hydrate frequently.';
        } else if (temp < 12) {
            icon = 'fa-mitten';
            heading = 'Cold Temperature Notice';
            advisory = 'Brisk temperatures expected. Keep warm outerwear ready for morning and evening commutes.';
        }

        advisoryIconRing.innerHTML = `<i class="fas ${icon}"></i>`;
        advisoryHeading.textContent = heading;
        advisoryText.textContent = advisory;
    }

    function getCardinalDirection(angle) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 22.5) % 16;
        return directions[index];
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // =========================================================================
    // 10. SEARCH & AUTOCOMPLETE LOGIC
    // =========================================================================
    function adaptSearchPlaceholder() {
        if (!searchInput) return;
        if (window.innerWidth <= 420) {
            searchInput.placeholder = 'Search city or district...';
        } else if (window.innerWidth <= 768) {
            searchInput.placeholder = 'Search city, district, country...';
        } else {
            searchInput.placeholder = 'Search city, district, or country (e.g. Dhaka, London)...';
        }
    }
    window.addEventListener('resize', adaptSearchPlaceholder);
    adaptSearchPlaceholder();

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        clearSearchBtn.style.display = query ? 'block' : 'none';

        if (query.length < 2) {
            suggestionsPopover.style.display = 'none';
            suggestionsPopover.innerHTML = '';
            return;
        }

        const matches = cityDatabase.filter(c => c.toLowerCase().includes(query)).slice(0, 8);

        if (matches.length === 0) {
            suggestionsPopover.style.display = 'none';
            return;
        }

        suggestionsPopover.innerHTML = '';
        matches.forEach(city => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<i class="fas fa-location-dot"></i> <span>${escapeHtml(city)}</span>`;
            item.addEventListener('click', () => {
                searchInput.value = city;
                suggestionsPopover.style.display = 'none';
                clearSearchBtn.style.display = 'block';
                fetchWeatherByCity(city);
            });
            suggestionsPopover.appendChild(item);
        });

        suggestionsPopover.style.display = 'block';
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        suggestionsPopover.style.display = 'none';
        searchInput.focus();
    });

    searchSubmitBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            suggestionsPopover.style.display = 'none';
            fetchWeatherByCity(city);
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const city = searchInput.value.trim();
            if (city) {
                suggestionsPopover.style.display = 'none';
                fetchWeatherByCity(city);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsPopover.contains(e.target)) {
            suggestionsPopover.style.display = 'none';
        }
    });

    // =========================================================================
    // 11. QUICK PRESET CHIPS & GPS
    // =========================================================================
    function updateQuickChipsActive(cityName) {
        document.querySelectorAll('.quick-chip').forEach(chip => {
            if (chip.dataset.city && chip.dataset.city.toLowerCase() === cityName.toLowerCase()) {
                chip.classList.add('active-chip');
            } else if (chip !== chipGps) {
                chip.classList.remove('active-chip');
            }
        });
    }

    quickCitiesRow.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-chip');
        if (!chip) return;

        if (chip.id === 'chipGps') {
            requestUserLocation();
            return;
        }

        if (chip.id === 'chipPinCurrent') {
            toggleBookmarkCurrentCity();
            return;
        }

        const city = chip.dataset.city;
        if (city) {
            searchInput.value = city;
            clearSearchBtn.style.display = 'block';
            fetchWeatherByCity(city);
        }
    });

    function requestUserLocation() {
        if (!navigator.geolocation) {
            Toast.warning("GPS Unavailable", "Browser does not support geolocation.");
            return;
        }

        locateBtn.classList.add('spinning');
        Toast.info("Requesting Geolocation...", "Fetching sensor coordinates.");

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                locateBtn.classList.remove('spinning');
                chipGps.classList.add('active-chip');
                fetchWeatherDataByCoords(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                locateBtn.classList.remove('spinning');
                console.warn("Geolocation denied or error:", err);
                Toast.warning("Location Permission Denied", "Defaulting to Dhaka.");
                fetchWeatherByCity(currentCity);
            },
            { timeout: 8000, enableHighAccuracy: false }
        );
    }

    locateBtn.addEventListener('click', requestUserLocation);
    refreshWeatherBtn.addEventListener('click', () => {
        fetchWeatherDataByCoords(currentCoords.lat, currentCoords.lon);
    });

    // Hourly Slider Controls
    hourlyScrollLeft.addEventListener('click', () => {
        hourlyTimeline.scrollBy({ left: -240, behavior: 'smooth' });
    });

    hourlyScrollRight.addEventListener('click', () => {
        hourlyTimeline.scrollBy({ left: 240, behavior: 'smooth' });
    });

    // =========================================================================
    // 12. FAVORITES MANAGEMENT & DRAWERS
    // =========================================================================
    function updateFavCount() {
        favCountBadge.textContent = favoriteCities.length.toString();
        localStorage.setItem('aura_favorites', JSON.stringify(favoriteCities));
    }

    function updateFavStarIcon(cityName) {
        const isFav = favoriteCities.some(c => c.toLowerCase() === (cityName || '').toLowerCase());
        const icon = heroFavToggle.querySelector('i');
        if (isFav) {
            heroFavToggle.classList.add('active');
            icon.className = 'fas fa-star';
        } else {
            heroFavToggle.classList.remove('active');
            icon.className = 'far fa-star';
        }
    }

    function toggleBookmarkCurrentCity() {
        if (!currentCity) return;
        const idx = favoriteCities.findIndex(c => c.toLowerCase() === currentCity.toLowerCase());

        if (idx >= 0) {
            favoriteCities.splice(idx, 1);
            Toast.info("City Removed", `Removed ${currentCity} from pinned favorites.`);
        } else {
            favoriteCities.unshift(currentCity);
            Toast.success("City Pinned!", `Added ${currentCity} to pinned favorites.`);
        }

        updateFavCount();
        updateFavStarIcon(currentCity);
        renderFavoritesList();
    }

    heroFavToggle.addEventListener('click', toggleBookmarkCurrentCity);

    function renderFavoritesList() {
        favoritesList.innerHTML = '';

        if (favoriteCities.length === 0) {
            favoritesList.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.84rem;">
                    <i class="far fa-star" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block; color: var(--primary);"></i>
                    No pinned cities yet. Tap "Pin Current City" to bookmark locations.
                </div>
            `;
            return;
        }

        favoriteCities.forEach(city => {
            const row = document.createElement('div');
            row.className = 'fav-item-row';
            row.innerHTML = `
                <div class="fav-item-left" data-city="${escapeHtml(city)}">
                    <i class="fas fa-location-dot text-rose"></i>
                    <span class="fav-city-name">${escapeHtml(city)}</span>
                </div>
                <button type="button" class="btn-del-fav" data-city="${escapeHtml(city)}" title="Remove city">
                    <i class="fas fa-trash-can"></i>
                </button>
            `;
            favoritesList.appendChild(row);
        });
    }

    favoritesList.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.btn-del-fav');
        if (delBtn) {
            const city = delBtn.dataset.city;
            favoriteCities = favoriteCities.filter(c => c.toLowerCase() !== city.toLowerCase());
            updateFavCount();
            updateFavStarIcon(currentCity);
            renderFavoritesList();
            Toast.info("Removed Favorite", city);
            return;
        }

        const cityItem = e.target.closest('.fav-item-left');
        if (cityItem) {
            const city = cityItem.dataset.city;
            favoritesBackdrop.classList.remove('active');
            fetchWeatherByCity(city);
        }
    });

    favoritesBtn.addEventListener('click', () => {
        renderFavoritesList();
        favoritesBackdrop.classList.add('active');
    });

    closeFavoritesBtn.addEventListener('click', () => {
        favoritesBackdrop.classList.remove('active');
    });

    favoritesBackdrop.addEventListener('click', (e) => {
        if (e.target === favoritesBackdrop) favoritesBackdrop.classList.remove('active');
    });

    addCurrentToFavsBtn.addEventListener('click', () => {
        toggleBookmarkCurrentCity();
    });

    // =========================================================================
    // 13. SETTINGS & PERIODIC NOTIFICATIONS
    // =========================================================================
    settingsBtn.addEventListener('click', () => {
        settingUserName.value = localStorage.getItem('aura_user_name') || '';
        settingDefaultCity.value = localStorage.getItem('aura_default_city') || 'Dhaka';
        settingUnitsChoice.value = currentUnit;
        settingNotifyInterval.value = notificationInterval.toString();
        settingsBackdrop.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsBackdrop.classList.remove('active');
    });

    settingsBackdrop.addEventListener('click', (e) => {
        if (e.target === settingsBackdrop) settingsBackdrop.classList.remove('active');
    });

    saveSettingsBtn.addEventListener('click', () => {
        const name = settingUserName.value.trim();
        const defCity = settingDefaultCity.value.trim() || 'Dhaka';
        const unit = settingUnitsChoice.value;
        const interval = parseInt(settingNotifyInterval.value, 10);

        if (name) localStorage.setItem('aura_user_name', name);
        localStorage.setItem('aura_default_city', defCity);

        setUnit(unit);
        setupNotificationTimer(interval);

        settingsBackdrop.classList.remove('active');
        Toast.success("Settings Saved!", "Preferences updated successfully.");

        if (defCity.toLowerCase() !== currentCity.toLowerCase()) {
            fetchWeatherByCity(defCity);
        }
    });

    function setupNotificationTimer(intervalMins) {
        notificationInterval = intervalMins;
        localStorage.setItem('aura_notify_interval', intervalMins.toString());

        if (notificationTimer) clearInterval(notificationTimer);

        if (intervalMins <= 0) return;

        // Request browser notification permission if not yet decided
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        notificationTimer = setInterval(async () => {
            if ("Notification" in window && Notification.permission === "granted" && currentWeatherRaw) {
                new Notification(`AuraWeather — ${currentWeatherRaw.name}`, {
                    body: `Current: ${Math.round(currentWeatherRaw.main.temp)}${getTempSymbol()} • ${currentWeatherRaw.weather[0]?.main}. Humidity: ${currentWeatherRaw.main.humidity}%`,
                    icon: 'favicon.svg'
                });
            }
        }, intervalMins * 60 * 1000);
    }

    // =========================================================================
    // 14. INITIAL BOOTSTRAP
    // =========================================================================
    updateFavCount();
    setupNotificationTimer(notificationInterval);

    // Initial weather fetch: try GPS first, fallback to default city
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeatherDataByCoords(pos.coords.latitude, pos.coords.longitude, false);
            },
            () => {
                fetchWeatherByCity(currentCity, false);
            },
            { timeout: 4000 }
        );
    } else {
        fetchWeatherByCity(currentCity, false);
    }
});
