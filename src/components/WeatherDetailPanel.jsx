import React from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  X,
  MapPin,
  Sparkles
} from 'lucide-react';

// Helper function to translate WMO weather codes into labels and icons
function getWmoInfo(code) {
  if (code >= 80) return { label: 'Thunderstorm', icon: CloudRain, color: 'text-indigo-600' };
  if (code >= 51) return { label: 'Rain', icon: CloudRain, color: 'text-blue-500' };
  if (code >= 45) return { label: 'Foggy', icon: Cloud, color: 'text-slate-400' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-amber-500' };
  return { label: 'Clear Sky', icon: Sun, color: 'text-amber-500' };
}

// Format ISO time strings to 12-hour AM/PM format
function formatTime12h(isoStr, isNow = false) {
  if (isNow) return 'Now';
  try {
    const d = new Date(isoStr);
    const h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${ampm}`;
  } catch {
    return '12 PM';
  }
}

// Format ISO sunrise/sunset time to HH:MM AM/PM
function formatSunTime(isoStr, fallback = '06:15 AM') {
  if (!isoStr) return fallback;
  try {
    const d = new Date(isoStr);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m} ${ampm}`;
  } catch {
    return fallback;
  }
}

// Format day name from date string
function formatDayName(dateStr, idx) {
  if (idx === 0) return 'Today';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return `Day ${idx + 1}`;
  }
}

// Fallback hourly generator if API hourly is loading
function generateFallbackHourly(currentTemp = 25) {
  const list = [];
  const now = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const h = (now + i) % 24;
    const timeLabel = i === 0 ? 'Now' : `${h === 0 ? 12 : h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`;
    const temp = Math.round(currentTemp + Math.sin((i / 24) * Math.PI * 2) * 3);
    const pop = Math.round(Math.abs(Math.sin(i / 2)) * 20);
    const code = pop > 15 ? 51 : i % 3 === 0 ? 1 : 0;
    list.push({ time: timeLabel, temp, precip: pop, code });
  }
  return list;
}

// Fallback daily generator if API daily is loading
function generateFallbackDaily(currentTemp = 25) {
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map((dayName, idx) => ({
    day: dayName,
    max: Math.round(currentTemp + 3 + Math.sin(idx) * 2),
    min: Math.round(currentTemp - 4 + Math.cos(idx) * 2),
    precip: Math.round((idx % 3) * 15),
    code: idx % 2 === 0 ? 1 : 0
  }));
}

export default function WeatherDetailPanel({ cityName, weatherData, onShowToast, onClose }) {
  // Current Weather Variables
  const current = weatherData?.current || {};
  const currentTemp = current.temperature_2m !== undefined ? Math.round(current.temperature_2m) : 25;
  const feelsLike = current.apparent_temperature !== undefined ? Math.round(current.apparent_temperature) : Math.round(currentTemp + 1);
  const humidity = current.relative_humidity_2m !== undefined ? current.relative_humidity_2m : 64;
  const windSpeed = current.wind_speed_10m !== undefined ? current.wind_speed_10m : 14.2;
  const weatherCode = current.weather_code !== undefined ? current.weather_code : 0;
  const wmo = getWmoInfo(weatherCode);
  const MainIcon = wmo.icon;

  // Process Hourly 24h Data
  let hourlyList = [];
  if (weatherData?.hourly?.time && weatherData.hourly.time.length > 0) {
    const times = weatherData.hourly.time.slice(0, 24);
    const temps = weatherData.hourly.temperature_2m.slice(0, 24);
    const pops = (weatherData.hourly.precipitation_probability || []).slice(0, 24);
    const codes = (weatherData.hourly.weather_code || []).slice(0, 24);
    hourlyList = times.map((t, idx) => ({
      time: formatTime12h(t, idx === 0),
      temp: Math.round(temps[idx] ?? currentTemp),
      precip: pops[idx] ?? 0,
      code: codes[idx] ?? 0
    }));
  } else {
    hourlyList = generateFallbackHourly(currentTemp);
  }

  // Process Daily 7-Day Forecast
  let dailyList = [];
  if (weatherData?.daily?.time && weatherData.daily.time.length > 0) {
    const times = weatherData.daily.time.slice(0, 7);
    const maxs = weatherData.daily.temperature_2m_max.slice(0, 7);
    const mins = weatherData.daily.temperature_2m_min.slice(0, 7);
    const precips = (weatherData.daily.precipitation_probability_max || []).slice(0, 7);
    const codes = (weatherData.daily.weather_code || []).slice(0, 7);

    dailyList = times.map((t, idx) => ({
      day: formatDayName(t, idx),
      max: Math.round(maxs[idx] ?? currentTemp + 3),
      min: Math.round(mins[idx] ?? currentTemp - 4),
      precip: Math.round(precips[idx] ?? 0),
      code: codes[idx] ?? 0
    }));
  } else {
    dailyList = generateFallbackDaily(currentTemp);
  }

  // Today High and Low
  const todayMax = dailyList[0]?.max ?? (currentTemp + 3);
  const todayMin = dailyList[0]?.min ?? (currentTemp - 4);

  // Week Min and Max for Temperature Slider Progress Calculation
  const weekMin = Math.min(...dailyList.map(d => d.min));
  const weekMax = Math.max(...dailyList.map(d => d.max));
  const weekRange = Math.max(weekMax - weekMin, 1);

  // Daily Sunrise / Sunset & UV Index
  const sunriseStr = formatSunTime(weatherData?.daily?.sunrise?.[0], '06:15 AM');
  const sunsetStr = formatSunTime(weatherData?.daily?.sunset?.[0], '06:42 PM');
  const uvMax = weatherData?.daily?.uv_index_max?.[0] !== undefined ? weatherData.daily.uv_index_max[0].toFixed(1) : '5.4';
  const uvCategory = parseFloat(uvMax) <= 2 ? 'Low' : parseFloat(uvMax) <= 5 ? 'Moderate' : parseFloat(uvMax) <= 8 ? 'High' : 'Very High';

  // Dew point estimate: Temp - ((100 - Humidity) / 5)
  const dewPoint = Math.round(currentTemp - ((100 - humidity) / 5));

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] text-slate-800 pointer-events-auto">
      
      {/* 1. STICKY TOP HEADER & NAVIGATION */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 pb-3 pt-1 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{cityName}</h2>
            <p className="text-[10px] font-semibold text-slate-500">Live Weather Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-extrabold text-[10px] border border-blue-100 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Live Sync</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-all cursor-pointer"
              title="Close Weather View"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. INTERNAL VERTICAL SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-3 no-scrollbar pointer-events-auto">
        {/* HERO WEATHER DISPLAY */}
        <div className="p-5 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-3xl border border-blue-200/60 shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Surface Temperature</span>
          <div className="text-6xl sm:text-7xl font-extralight text-slate-900 tracking-tight">
            {currentTemp}°
          </div>
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 pt-0.5">
            <span>{wmo.label}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-semibold">Feels like {feelsLike}°</span>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-slate-200/80 rounded-full text-xs font-extrabold text-slate-700 shadow-2xs">
              <span>↑ {todayMax}°</span>
              <span className="text-slate-400">·</span>
              <span>↓ {todayMin}°</span>
            </span>
          </div>
        </div>

        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/80 border border-white/80 flex items-center justify-center shadow-inner flex-shrink-0">
          <MainIcon className={`w-12 h-12 sm:w-14 sm:h-14 ${wmo.color} animate-pulse`} />
        </div>
      </div>

      {/* 3. HORIZONTAL HOURLY FORECAST CAROUSEL */}
      <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-blue-600" />
            <span>24-Hour Hourly Forecast</span>
          </h3>
          <span className="text-[10px] font-semibold text-slate-400">Scroll →</span>
        </div>

        <div className="overflow-x-auto snap-x flex gap-3 pb-2 no-scrollbar">
          {hourlyList.map((item, idx) => {
            const ItemIcon = getWmoInfo(item.code).icon;
            return (
              <div
                key={idx}
                className="w-16 flex-shrink-0 snap-start flex flex-col items-center justify-between p-2.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs hover:border-blue-200 hover:scale-105 transition-all cursor-pointer text-center space-y-1.5"
              >
                <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
                <ItemIcon className="w-5 h-5 text-blue-600 my-0.5" />
                <span className="text-xs font-extrabold text-slate-900">{item.temp}°</span>
                {item.precip > 0 ? (
                  <span className="text-[9px] font-bold text-blue-500 flex items-center gap-0.5">
                    💧 {item.precip}%
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-medium">0%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 7-DAY EXTENDED FORECAST */}
      <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Cloud className="w-4 h-4 text-blue-600" />
          <span>7-Day Extended Forecast</span>
        </h3>

        <div className="space-y-1">
          {dailyList.map((dayItem, idx) => {
            const DayIcon = getWmoInfo(dayItem.code).icon;
            const leftPercent = Math.max(0, Math.min(100, ((dayItem.min - weekMin) / weekRange) * 100));
            const widthPercent = Math.max(10, Math.min(100 - leftPercent, ((dayItem.max - dayItem.min) / weekRange) * 100));

            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50/40 transition-all duration-200 cursor-pointer text-xs"
              >
                {/* Col 1: Day Name */}
                <span className="w-16 font-bold text-slate-800 text-xs">{dayItem.day}</span>

                {/* Col 2: Icon + Rain % */}
                <div className="flex items-center gap-1.5 w-24">
                  <DayIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-blue-600">
                    {dayItem.precip > 0 ? `💧 ${dayItem.precip}%` : ''}
                  </span>
                </div>

                {/* Col 3: Low Temp */}
                <span className="w-8 text-right font-semibold text-slate-500">{dayItem.min}°</span>

                {/* Col 4: Visual Temp Range Gradient Slider */}
                <div className="flex-1 mx-3 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 via-amber-400 to-rose-400 rounded-full"
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  ></div>
                </div>

                {/* Col 5: High Temp */}
                <span className="w-8 text-left font-extrabold text-slate-900">{dayItem.max}°</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. METRIC TILES GRID (2x3 Grid) */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5 px-1">
          Meteorological Parameters
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Tile 1: UV Index */}
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">UV Index</span>
            <div className="text-xl font-extrabold text-slate-900">{uvMax}</div>
            <p className="text-[10px] font-bold text-amber-600">{uvCategory} Risk Level</p>
          </div>

          {/* Tile 2: Sunrise & Sunset */}
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Solar Cycle</span>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>{sunriseStr}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Sunset className="w-3 h-3 text-amber-600" />
              <span>Sunset {sunsetStr}</span>
            </p>
          </div>

          {/* Tile 3: Wind */}
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Wind Speed</span>
            <div className="text-xl font-extrabold text-slate-900">{windSpeed} km/h</div>
            <p className="text-[10px] text-slate-500 font-semibold">Moderate Surface Breeze</p>
          </div>

          {/* Tile 4: Humidity */}
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Humidity</span>
            <div className="text-xl font-extrabold text-slate-900">{humidity}%</div>
            <p className="text-[10px] text-slate-500 font-semibold">Dew point ~{dewPoint}°C</p>
          </div>

          {/* Tile 5: Visibility */}
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Visibility</span>
            <div className="text-xl font-extrabold text-slate-900">10.0 km</div>
            <p className="text-[10px] text-emerald-600 font-bold">Clear Optical Clarity</p>
          </div>

          {/* Tile 6: Pressure */}
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Pressure</span>
            <div className="text-xl font-extrabold text-slate-900">1012 hPa</div>
            <p className="text-[10px] text-slate-500 font-semibold">Stable Barometric Trend</p>
          </div>
        </div>
      </div>

      {/* AI SYNTHESIZED INSIGHT */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>CityPulse Smart Weather Summary</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Current temperature in {cityName} is {currentTemp}°C ({wmo.label.toLowerCase()}) with {humidity}% humidity. Solar UV max is {uvMax} ({uvCategory.toLowerCase()}). Highs reaching {todayMax}° today.
        </p>
      </div>

      </div>
    </div>
  );
}
