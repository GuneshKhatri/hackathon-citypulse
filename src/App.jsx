import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Toast from './components/Toast';

import Home from './pages/Home';
import NavigatePage from './pages/NavigatePage';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import Community from './pages/Community';
import About from './pages/About';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isNavigate = location.pathname === '/navigate';

  const [toast, setToast] = useState(null);

  // Global state for universal location & city name (default: Jaipur center 26.9124, 75.7873)
  const [currentLocation, setCurrentLocation] = useState({ lat: 26.9124, lon: 75.7873 });
  const [cityName, setCityName] = useState('Jaipur');

  // Shared live telemetry metrics for AI Assistant context
  const [liveMetrics, setLiveMetrics] = useState({ temp: '25°C', weather: 'Clear Sky', aqi: '149' });
  const [activeLayer, setActiveLayer] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [activeAnomalies, setActiveAnomalies] = useState([]);

  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  // Browser Geolocation on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Reverse geocode to get local city name
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();
            if (data && data.address) {
              const detectedCity = data.address.city || data.address.town || data.address.suburb || data.address.state || 'Local Area';
              setCurrentLocation({ lat, lon, name: detectedCity });
              setCityName(detectedCity);
              showToast({ type: 'success', message: `Located current location: ${detectedCity}` });
            } else {
              setCurrentLocation({ lat, lon, name: 'Jaipur' });
            }
          } catch (e) {
            console.warn('Reverse geocoding error:', e);
            setCurrentLocation({ lat, lon, name: 'Jaipur' });
            setCityName('Jaipur');
          }
        },
        (error) => {
          console.log('Geolocation denied or unavailable, defaulting to Jaipur:', error.message);
        }
      );
    }
  }, []);

  // Update global location from Search Bar
  const handleSearchLocation = (newCoords, newLocationName) => {
    if (newCoords && newCoords.length === 2) {
      setCurrentLocation({ lat: newCoords[0], lon: newCoords[1], name: newLocationName });
      setCityName(newLocationName);
    }
  };

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100/50 selection:text-blue-700">
      {/* Top Floating Glassmorphic Header Navigation for Non-Home pages */}
      {!isHome && !isNavigate && <Header onSearchLocation={handleSearchLocation} onShowToast={showToast} />}

      {/* Multi-Page Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              currentLocation={currentLocation}
              cityName={cityName}
              onShowToast={showToast}
              setLiveMetrics={setLiveMetrics}
              onSearchLocation={handleSearchLocation}
              onTelemetryUpdate={(data) => {
                if (data.weatherData) setWeatherData(data.weatherData);
                if (data.aqiData) setAqiData(data.aqiData);
                if (data.anomalies) setActiveAnomalies(data.anomalies);
                if (data.activeLayer !== undefined) setActiveLayer(data.activeLayer);
              }}
            />
          }
        />
        <Route
          path="/navigate"
          element={
            <NavigatePage
              currentLocation={currentLocation}
              cityName={cityName}
              onShowToast={showToast}
            />
          }
        />
        <Route path="/insights" element={<Insights onShowToast={showToast} />} />
        <Route path="/reports" element={<Reports onShowToast={showToast} />} />
        <Route path="/community" element={<Community onShowToast={showToast} />} />
        <Route path="/about" element={<About onShowToast={showToast} />} />
      </Routes>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
