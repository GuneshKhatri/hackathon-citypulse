import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polygon, Polyline, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { fetchCivicSummary } from '../services/geminiService';
import {
  generateDynamicIncidents,
  geocodeAddress,
  getAQIColor,
  getAQITheme,
  getAQICategory,
  getAreaBoundary,
  PRESET_JAIPUR_AREAS,
  generateCityAnomalies,
  getPredictiveDisruptionSpread,
  generateImpactZone
} from '../utils/geoUtils';
import TrafficDetailPanel from '../components/TrafficDetailPanel';
import WeatherDetailPanel from '../components/WeatherDetailPanel';
import AQIDetailPanel from '../components/AQIDetailPanel';
import IncidentsDetailPanel from '../components/IncidentsDetailPanel';
import AnomalyDetailPanel from '../components/AnomalyDetailPanel';
import PredictiveDetailPanel from '../components/PredictiveDetailPanel';
import ImpactZonePanel from '../components/ImpactZonePanel';
import {
  Activity,
  GitMerge,
  Zap,
  CloudRain,
  Droplet,
  Car,
  ArrowRight,
  MapPin,
  Map as MapIcon,
  Globe,
  Navigation,
  Plus,
  Minus,
  Layers,
  TrafficCone,
  CloudSun,
  AlertOctagon,
  Bus,
  Wind,
  Video,
  ActivitySquare,
  Sparkles,
  Search,
  X,
  Building2,
  AlertTriangle,
  Star,
  Trash2,
  TrendingUp,
  Target
} from 'lucide-react';

function MapController({ mapRef, currentLocation }) {
  const map = useMap();

  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      map.flyTo([currentLocation.lat, currentLocation.lon], 13, { duration: 1.5 });
    }
  }, [currentLocation, map]);

  return null;
}

function MapResizer({ activeLayer, isMenuHovered }) {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 500); 
    return () => clearTimeout(timeout);
  }, [activeLayer, isMenuHovered, map]);
  return null;
}

function MapMouseTracker({ setHoverLatLng }) {
  useMapEvents({
    mousemove(e) {
      setHoverLatLng(e.latlng);
    },
    mouseout() {
      setHoverLatLng(null);
    },
  });
  return null;
}

function MiniMapController({ hoverLatLng }) {
  const miniMap = useMap();
  useEffect(() => {
    if (hoverLatLng) {
      miniMap.setView([hoverLatLng.lat, hoverLatLng.lng], 16, { animate: false });
    }
  }, [hoverLatLng, miniMap]);
  return null;
}

function SynchronizedMiniMap({ hoverLatLng, mapType }) {
  if (!hoverLatLng) return null;

  const tileUrl = mapType === 'map'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="absolute top-40 right-6 w-64 h-64 z-[1001] pointer-events-none transition-all duration-300 ease-premium scale-100 opacity-100 rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-3xl saturate-[1.5] border border-white/60 ring-1 ring-black/[0.03] p-2.5 flex flex-col justify-between">
      <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between px-2 py-1 rounded-lg bg-white/80 backdrop-blur-md border border-white/60 shadow-2xs z-10">
        <span className="flex items-center gap-1 text-blue-600 font-extrabold">
          <Sparkles className="w-3.5 h-3.5" /> Hover Magnifier (16x)
        </span>
        <span className="text-slate-600 font-mono text-[9px] font-bold">
          {hoverLatLng.lat.toFixed(4)}, {hoverLatLng.lng.toFixed(4)}
        </span>
      </div>
      <div className="w-full flex-1 rounded-xl overflow-hidden border border-slate-200/80 shadow-inner relative">
        <MapContainer
          center={[hoverLatLng.lat, hoverLatLng.lng]}
          zoom={16}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MiniMapController hoverLatLng={hoverLatLng} />
          <TileLayer url={tileUrl} />
          <CircleMarker
            center={[hoverLatLng.lat, hoverLatLng.lng]}
            radius={6}
            pathOptions={{ color: '#e11d48', fillColor: '#f43f5e', fillOpacity: 0.9, weight: 2 }}
          />
        </MapContainer>
      </div>
    </div>
  );
}

const createCityPin = (label, color = 'bg-blue-600') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-md text-[11px] font-bold text-slate-800 border border-slate-200/80 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
        <span class="w-2.5 h-2.5 rounded-full ${color}"></span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createFavoritePin = (label) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white backdrop-blur-md rounded-full shadow-lg text-[11px] font-black border-2 border-white whitespace-nowrap -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
        <span>⭐</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createInvisibleIcon = () => {
  return L.divIcon({
    className: 'invisible-context-marker',
    html: '<div style="width:1px;height:1px;opacity:0;pointer-events:none;"></div>',
    iconSize: [1, 1],
    iconAnchor: [0, 0]
  });
};

function MapRightClickContextMenu({ onSaveLocation, onShowToast }) {
  const [contextPopup, setContextPopup] = useState(null);

  useMapEvents({
    contextmenu(e) {
      if (e.originalEvent) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      }
      const { lat, lng } = e.latlng;
      setContextPopup({ lat, lon: lng, isSaving: false });
    }
  });

  if (!contextPopup) return null;

  const handleSaveLocation = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setContextPopup(prev => prev ? { ...prev, isSaving: true } : null);
    let placeName = `Location (${contextPopup.lat.toFixed(3)}, ${contextPopup.lon.toFixed(3)})`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${contextPopup.lat}&lon=${contextPopup.lon}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CityPulseSmartCityApp/1.0'
          }
        }
      );
      const data = await res.json();
      if (data && data.display_name) {
        placeName = data.name || data.display_name.split(',')[0] || placeName;
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }

    const newFav = {
      id: `fav-${Date.now()}`,
      name: placeName,
      lat: contextPopup.lat,
      lon: contextPopup.lon
    };

    onSaveLocation(newFav);
    setContextPopup(null);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        message: `⭐ Saved "${placeName}" to your favorite locations!`
      });
    }
  };

  return (
    <Marker
      position={[contextPopup.lat, contextPopup.lon]}
      icon={createInvisibleIcon()}
    >
      <Popup
        autoClose={false}
        closeOnClick={false}
        closeOnEscapeKey={true}
        onClose={() => setContextPopup(null)}
        className="custom-context-popup rounded-2xl"
      >
        <div 
          className="p-3 font-sans space-y-2 min-w-[215px] pointer-events-auto relative z-[9999]"
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              Save Location
            </span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">
              {contextPopup.lat.toFixed(4)}, {contextPopup.lon.toFixed(4)}
            </span>
          </div>

          <p className="text-xs font-extrabold text-slate-800 leading-snug">
            Save this map coordinate to your Favorite Locations?
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={contextPopup.isSaving}
              className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 pointer-events-auto"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>{contextPopup.isSaving ? 'Geocoding...' : 'Save Location'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setContextPopup(null);
              }}
              className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer pointer-events-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const DEFAULT_FAVORITES = [
  { id: 'fav-1', name: 'Vaishali Nagar', lat: 26.9067, lon: 75.7441 },
  { id: 'fav-2', name: 'Malviya Nagar', lat: 26.8526, lon: 75.8152 },
  { id: 'fav-3', name: 'C-Scheme', lat: 26.9083, lon: 75.8031 }
];

export default function Home({ currentLocation, cityName, onShowToast, setLiveMetrics, onSearchLocation, onToggleChat, onTelemetryUpdate }) {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('map');

  const [activeLayer, setActiveLayer] = useState(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [hoverLatLng, setHoverLatLng] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounced Photon Autocomplete Geocoding Effect (400ms pause threshold)
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await geocodeAddress(searchQuery);
        setSearchResults(results || []);
      } catch (err) {
        console.error('Home search geocoding error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // FAVORITES STATE & LOCALSTORAGE PERSISTENCE
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('citypulse_favorites');
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch (e) {
      return DEFAULT_FAVORITES;
    }
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('citypulse_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  const addFavorite = (newFav) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === newFav.id || (Math.abs(f.lat - newFav.lat) < 0.0001 && Math.abs(f.lon - newFav.lon) < 0.0001))) {
        return prev;
      }
      return [newFav, ...prev];
    });
  };

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    if (onShowToast) {
      onShowToast({ type: 'info', message: 'Removed location from favorites.' });
    }
  };

  const defaultBoundary = getAreaBoundary('Vaishali Nagar', currentLocation.lat, currentLocation.lon);
  const [selectedArea, setSelectedArea] = useState({
    name: 'Vaishali Nagar',
    lat: defaultBoundary.center[0],
    lon: defaultBoundary.center[1],
    polygon: defaultBoundary.polygon,
    isApproximate: defaultBoundary.isApproximate,
    aqiVal: 149
  });

  const [weatherData, setWeatherData] = useState({ temp: '26°C', weather: 'Clear Sky' });
  const [aqiData, setAqiData] = useState({ aqiVal: '149', current: { us_aqi: 149, pm2_5: 58.4, pm10: 112.0, ozone: 45, nitrogen_dioxide: 22 } });
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);

  // Flagship Anomaly Detection & Impact Zone Engine State
  const [anomalies, setAnomalies] = useState(() => generateCityAnomalies(cityName, currentLocation.lat, currentLocation.lon));
  const [selectedAnomalyId, setSelectedAnomalyId] = useState('anom-1');
  const [selectedSpreadNodeId, setSelectedSpreadNodeId] = useState('origin-vaishali');
  const [impactTimeStep, setImpactTimeStep] = useState(0);
  const [impactLayerToggles, setImpactLayerToggles] = useState({ people: true, roads: true, infra: true, emergency: true });
  const [isWhatIfSimulating, setIsWhatIfSimulating] = useState(false);
  // Sync telemetry state to parent App for CityPulseChatbot AI context
  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({ weatherData, aqiData, anomalies, activeLayer });
    }
  }, [weatherData, aqiData, anomalies, activeLayer, onTelemetryUpdate]);

  const handleAreaSelect = (areaName, lat, lon, boundingbox = null) => {
    const boundaryInfo = getAreaBoundary(areaName, lat, lon, boundingbox);
    const targetLat = boundaryInfo.center[0];
    const targetLon = boundaryInfo.center[1];
    const targetAqi = boundaryInfo.presetAqi || (typeof aqiData === 'object' ? aqiData.aqiVal : aqiData) || 149;

    const newArea = {
      name: boundaryInfo.presetName || areaName,
      lat: targetLat,
      lon: targetLon,
      polygon: boundaryInfo.polygon,
      isApproximate: boundaryInfo.isApproximate,
      aqiVal: targetAqi
    };

    setSelectedArea(newArea);
    setActiveLayer('aqi');

    setAqiData({
      aqiVal: targetAqi,
      current: {
        us_aqi: targetAqi,
        pm2_5: targetAqi * 0.4,
        pm10: targetAqi * 0.75,
        ozone: 45.0,
        nitrogen_dioxide: 22.1
      }
    });

    if (onShowToast) {
      onShowToast({ type: 'info', message: `Selected ${newArea.name} (AQI ${targetAqi} ${getAQICategory(targetAqi)}). Map shifted right.` });
    }

    if (mapRef.current) {
      mapRef.current.flyTo([targetLat, targetLon], 14, { duration: 1.2 });
    }
  };

  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      setAnomalies(generateCityAnomalies(cityName, currentLocation.lat, currentLocation.lon));
    }
  }, [currentLocation, cityName]);

  useEffect(() => {
    if (!currentLocation || !currentLocation.lat || !currentLocation.lon) return;
    const { lat, lon } = currentLocation;

    let isMounted = true;
    setIsSummaryLoading(true);

    const fetchRealTimeData = async () => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto`
        );
        const wData = await weatherRes.json();
        
        let tempStr = '25°C';
        let weatherDesc = 'Clear Sky';

        if (wData && wData.current) {
          tempStr = `${Math.round(wData.current.temperature_2m)}°C`;
          const code = wData.current.weather_code;
          if (code >= 51 && code <= 67) weatherDesc = 'Rain / Drizzle';
          else if (code >= 80 && code <= 99) weatherDesc = 'Heavy Rain';
          else if (code >= 1 && code <= 3) weatherDesc = 'Partly Cloudy';
          else if (code >= 45 && code <= 48) weatherDesc = 'Foggy';
        }

        const aqiRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone`
        );
        const aData = await aqiRes.json();
        
        let aqiVal = selectedArea.aqiVal || 149;
        if (aData && aData.current && aData.current.us_aqi !== undefined && !selectedArea.presetName) {
          aqiVal = Math.round(aData.current.us_aqi);
        }

        if (!isMounted) return;

        const fullWeatherObj = {
          temp: tempStr,
          weather: weatherDesc,
          current: wData.current || { temperature_2m: 25, apparent_temperature: 26, relative_humidity_2m: 64, wind_speed_10m: 14.2, precipitation: 0, weather_code: 0 },
          hourly: wData.hourly || null,
          daily: wData.daily || null
        };

        const fullAqiObj = {
          aqiVal: aqiVal,
          current: aData.current || { us_aqi: parseInt(aqiVal) || 149, pm2_5: 58.4, pm10: 112.0, ozone: 45.0, nitrogen_dioxide: 22.1, carbon_monoxide: 310 }
        };

        setWeatherData(fullWeatherObj);
        setAqiData(fullAqiObj);

        if (setLiveMetrics) {
          setLiveMetrics({ temp: tempStr, weather: weatherDesc, aqi: aqiVal });
        }

        const dynIncidents = generateDynamicIncidents(lat, lon, weatherDesc, aqiVal);
        setIncidents(dynIncidents);

        const summaryText = await fetchCivicSummary(cityName, `${tempStr} ${weatherDesc}`, aqiVal);
        if (isMounted) {
          setAiSummary(summaryText);
        }
      } catch (err) {
        console.error('Error fetching real-time telemetry:', err);
        if (isMounted) {
          setAiSummary(`Real-time civic telemetry active for ${cityName}. Systems monitoring localized environmental status.`);
        }
      } finally {
        if (isMounted) setIsSummaryLoading(false);
      }
    };

    fetchRealTimeData();

    return () => {
      isMounted = false;
    };
  }, [currentLocation, cityName, setLiveMetrics]);

  const handleSelectSearchResult = (place) => {
    const { lat, lon, shortName, boundingbox } = place;

    if (onSearchLocation) {
      onSearchLocation([lat, lon], shortName);
    }

    handleAreaSelect(shortName, lat, lon, boundingbox);
    setSearchQuery(shortName);
    setIsSearchFocused(false);
    setSearchResults([]);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        message: place.isTypoCorrected
          ? `Auto-corrected "${place.originalQuery}" to "${shortName}"!`
          : `Located "${shortName}" on map!`
      });
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    if (onShowToast) onShowToast({ type: 'info', message: `Searching map for "${searchQuery}"...` });

    try {
      const results = await geocodeAddress(searchQuery);

      if (results && results.length > 0) {
        const place = results[0];
        handleSelectSearchResult(place);
      } else {
        const clean = searchQuery.toLowerCase().trim();
        for (const key in PRESET_JAIPUR_AREAS) {
          if (clean.includes(key)) {
            const p = PRESET_JAIPUR_AREAS[key];
            handleAreaSelect(p.name, p.center[0], p.center[1]);
            setIsSearchFocused(false);
            return;
          }
        }

        if (onShowToast) {
          onShowToast({ type: 'error', message: 'No location found. Please try a different search.' });
        }
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast({ type: 'error', message: 'Geocoding request failed. Please check internet connection.' });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.flyTo([currentLocation.lat, currentLocation.lon], 13, { duration: 1.2 });
    }
  };

  const tileUrl = mapType === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = mapType === 'satellite'
    ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const layersList = [
    { id: 'impact', name: 'Impact Zone Analysis', icon: Target, color: 'text-rose-600' },
    { id: 'anomalies', name: 'Anomalies', icon: AlertTriangle, color: 'text-purple-600' },
    { id: 'predictive', name: 'Predictive Spread', icon: TrendingUp, color: 'text-amber-600' },
    { id: 'traffic', name: 'Traffic', icon: TrafficCone, color: 'text-amber-500' },
    { id: 'weather', name: 'Weather', icon: CloudSun, color: 'text-blue-500' },
    { id: 'incidents', name: 'Incidents', icon: AlertOctagon, color: 'text-rose-500' },
    { id: 'aqi', name: 'Air Quality', icon: Wind, color: 'text-emerald-500' },
  ];

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Navigate', path: '/navigate' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Community', path: '/community' },
    { label: 'About', path: '/about' }
  ];

  const currentAqiValue = typeof aqiData === 'object' ? aqiData.aqiVal : aqiData;
  const currentAqiColor = getAQIColor(currentAqiValue);

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden">
      
      {/* 0. BASE MAP LAYER */}
      <div className={`absolute top-0 right-0 h-full transition-all duration-500 ease-in-out ${
        activeLayer ? (isMenuHovered ? 'w-[calc(100%-32%-16rem)]' : 'w-[calc(100%-32%-6rem)]') : (isMenuHovered ? 'w-[calc(100%-16rem)]' : 'w-full')
      }`}>
        <MapContainer
          center={[currentLocation.lat, currentLocation.lon]}
          zoom={13}
          zoomControl={false}
          style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          className="w-full h-full absolute inset-0 z-0"
          attributionControl={true}
        >
          <MapController mapRef={mapRef} currentLocation={currentLocation} />
          
          <MapResizer activeLayer={activeLayer} isMenuHovered={isMenuHovered} />

          <MapMouseTracker setHoverLatLng={setHoverLatLng} />

          <MapRightClickContextMenu onSaveLocation={addFavorite} onShowToast={onShowToast} />

          <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />

          {/* SAVED FAVORITE PINS ON MAP */}
          {favorites.map((fav) => (
            <Marker
              key={`fav-pin-${fav.id}`}
              position={[fav.lat, fav.lon]}
              icon={createFavoritePin(fav.name)}
              eventHandlers={{
                click: () => handleAreaSelect(fav.name, fav.lat, fav.lon)
              }}
            >
              <Popup className="rounded-xl">
                <div className="p-1.5 font-sans space-y-1">
                  <div className="flex items-center gap-1 text-amber-600 font-extrabold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{fav.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {fav.lat.toFixed(4)}, {fav.lon.toFixed(4)}
                  </p>
                  <button
                    onClick={() => handleAreaSelect(fav.name, fav.lat, fav.lon)}
                    className="w-full py-1 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-md shadow-2xs cursor-pointer"
                  >
                    View Telemetry
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Center Location Pin */}
          <Marker
            position={[currentLocation.lat, currentLocation.lon]}
            icon={createCityPin(cityName)}
          >
            <Popup className="rounded-xl">
              <div className="p-1 font-sans">
                <h4 className="font-bold text-xs text-slate-800">{cityName} Center</h4>
                <p className="text-[10px] text-slate-500">Live Weather: {weatherData.weather} • Temp: {weatherData.temp}</p>
              </div>
            </Popup>
          </Marker>

          {/* PRESET AREA PINS */}
          {Object.entries(PRESET_JAIPUR_AREAS).map(([key, area]) => {
            const colorClass = area.defaultAqi <= 100 ? 'bg-emerald-500' : area.defaultAqi <= 200 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <Marker
                key={`preset-${key}`}
                position={area.center}
                icon={createCityPin(`${area.name} (${area.defaultAqi} AQI)`, colorClass)}
                eventHandlers={{
                  click: () => handleAreaSelect(area.name, area.center[0], area.center[1])
                }}
              >
                <Popup className="rounded-xl">
                  <div className="p-1 font-sans space-y-1">
                    <h4 className="font-bold text-xs text-slate-800">{area.name}</h4>
                    <p className="text-[10px] text-slate-600">AQI: {area.defaultAqi} ({getAQICategory(area.defaultAqi)})</p>
                    <button
                      onClick={() => handleAreaSelect(area.name, area.center[0], area.center[1])}
                      className="w-full py-1 text-[10px] font-bold text-white bg-blue-600 rounded-md shadow-2xs cursor-pointer"
                    >
                      View Deep AQI Telemetry
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 3. ANOMALY DETECTION MAP MARKERS */}
          {anomalies.map((anom) => {
            const markerColor = anom.severity === 'Critical' ? '#ef4444' : anom.severity === 'High' ? '#f97316' : '#eab308';
            return (
              <CircleMarker
                key={`anom-marker-${anom.id}`}
                center={anom.location}
                radius={anom.severity === 'Critical' ? 14 : 10}
                pathOptions={{
                  color: markerColor,
                  fillColor: markerColor,
                  fillOpacity: 0.85,
                  weight: 3
                }}
                eventHandlers={{
                  click: () => {
                    setActiveLayer('anomalies');
                    setSelectedAnomalyId(anom.id);
                    if (onShowToast) {
                      onShowToast({ type: 'info', message: `Selected anomaly: "${anom.title}".` });
                    }
                    if (mapRef.current) {
                      mapRef.current.flyTo(anom.location, 14, { duration: 1.2 });
                    }
                  }
                }}
              >
                <Popup className="rounded-xl">
                  <div className="p-1.5 font-sans space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: markerColor }}></span>
                      <h4 className="font-extrabold text-xs text-slate-900">{anom.title}</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 font-semibold">{anom.locationName}</p>
                    <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {anom.currentValue} ({anom.deviation})
                    </div>
                    <button
                      onClick={() => {
                        setActiveLayer('anomalies');
                        setSelectedAnomalyId(anom.id);
                      }}
                      className="w-full py-1 text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 rounded shadow-2xs cursor-pointer uppercase tracking-wider"
                    >
                      Inspect AI Orchestration
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* DYNAMIC IMPACT ZONE OVERLAYS ON LEAFLET MAP */}
          {(activeLayer === 'anomalies' || activeLayer === 'impact') && (() => {
            const activeAnom = anomalies.find(a => a.id === selectedAnomalyId) || anomalies[0];
            const locName = activeAnom ? activeAnom.locationName : 'Vaishali Nagar';
            const epicenter = activeAnom ? activeAnom.location : [26.9067, 75.7441];
            const severity = activeAnom ? activeAnom.severity : 'Critical';

            const impactData = generateImpactZone(locName, epicenter[0], epicenter[1], severity);
            const activeRadius = impactData.timeSeriesRadii[impactTimeStep] || 300;

            return (
              <React.Fragment key="impact-zone-map-layers">
                {/* 1. HEATMAP / CONCENTRIC ZONES */}
                {/* Outer Zone (Yellow) */}
                <Circle
                  center={epicenter}
                  radius={activeRadius}
                  pathOptions={{
                    color: '#eab308',
                    fillColor: '#eab308',
                    fillOpacity: 0.12,
                    weight: 2,
                    dashArray: '6, 8'
                  }}
                />
                {/* Middle Buffer Zone (Orange) */}
                <Circle
                  center={epicenter}
                  radius={activeRadius * 0.65}
                  pathOptions={{
                    color: '#f97316',
                    fillColor: '#f97316',
                    fillOpacity: 0.22,
                    weight: 2
                  }}
                />
                {/* Core Impact Zone (Red) */}
                <Circle
                  center={epicenter}
                  radius={activeRadius * 0.35}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.38,
                    weight: 2.5
                  }}
                />

                {/* 2. INFRASTRUCTURE & EMERGENCY MARKERS (Controlled by layer toggles) */}
                {impactData.infrastructure.map((facility) => {
                  const shouldShow = (facility.category === 'emergency' && impactLayerToggles.emergency) ||
                                     (facility.category === 'infrastructure' && impactLayerToggles.infra);
                  if (!shouldShow) return null;

                  return (
                    <CircleMarker
                      key={`infra-map-${facility.id}`}
                      center={[facility.lat, facility.lon]}
                      radius={10}
                      pathOptions={{
                        color: facility.color,
                        fillColor: facility.color,
                        fillOpacity: 0.9,
                        weight: 2.5
                      }}
                    >
                      <Popup className="rounded-xl">
                        <div className="p-1.5 font-sans space-y-1">
                          <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                            <span>{facility.symbol}</span>
                            <span>{facility.name}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {facility.status}
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold">{facility.distance} from epicenter</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {/* 3. POPULATION DENSITY OVERLAY */}
                {impactLayerToggles.people && impactData.peopleNodes.map((pop) => (
                  <CircleMarker
                    key={`pop-map-${pop.id}`}
                    center={[pop.lat, pop.lon]}
                    radius={7}
                    pathOptions={{ color: '#8b5cf6', fillColor: '#a78bfa', fillOpacity: 0.75, weight: 1.5 }}
                  >
                    <Tooltip sticky>
                      <span className="text-[10px] font-bold text-purple-900">👥 {pop.name}: {pop.density}</span>
                    </Tooltip>
                  </CircleMarker>
                ))}

                {/* 4. ROAD NETWORK CORRIDORS */}
                {impactLayerToggles.roads && impactData.roadCorridors.map((road) => (
                  <Polyline
                    key={`road-map-${road.id}`}
                    positions={road.points}
                    pathOptions={{
                      color: road.color,
                      weight: 5,
                      opacity: 0.85,
                      lineCap: 'round'
                    }}
                  >
                    <Popup className="rounded-xl">
                      <div className="p-1 font-sans">
                        <h4 className="font-bold text-xs text-slate-800">{road.name}</h4>
                        <p className="text-[10px] font-bold text-rose-600">{road.status}</p>
                      </div>
                    </Popup>
                  </Polyline>
                ))}

                {/* 5. CASCADING FAILURE CHAIN REACTION (WHAT-IF SIMULATION) */}
                {isWhatIfSimulating && (
                  <React.Fragment key="cascading-sim-overlay">
                    <Polyline
                      positions={[
                        epicenter,
                        [epicenter[0] + 0.004, epicenter[1] + 0.005],
                        [epicenter[0] + 0.008, epicenter[1] + 0.006],
                        [epicenter[0] - 0.009, epicenter[1] - 0.004]
                      ]}
                      pathOptions={{
                        color: '#ef4444',
                        dashArray: '6, 10',
                        weight: 4,
                        opacity: 0.9,
                        className: 'animate-marching-ants'
                      }}
                    />

                    {impactData.cascadingEvents.map((evt) => (
                      <CircleMarker
                        key={`cascading-step-${evt.step}`}
                        center={evt.coords}
                        radius={12}
                        pathOptions={{
                          color: '#ef4444',
                          fillColor: '#ef4444',
                          fillOpacity: 0.85,
                          weight: 3
                        }}
                      >
                        <Popup className="rounded-xl">
                          <div className="p-1.5 font-sans space-y-1">
                            <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
                              STEP {evt.step}: {evt.type.toUpperCase()}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900">{evt.title}</h4>
                            <p className="text-[10px] text-slate-600">{evt.description}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })()}

          {/* SELECTED AREA POLYGON HIGHLIGHT ON LEAFLET MAP */}
          {selectedArea && selectedArea.polygon && (
            <Polygon
              positions={selectedArea.polygon}
              pathOptions={{
                color: currentAqiColor,
                fillColor: currentAqiColor,
                fillOpacity: 0.25,
                weight: 3
              }}
            >
              <Tooltip permanent direction="top" sticky className="custom-area-tooltip">
                <div className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 px-1 py-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentAqiColor }}></span>
                  <span>{selectedArea.name}</span>
                  <span className="text-[10px] text-slate-600 font-extrabold">
                    ({currentAqiValue} AQI • {getAQICategory(currentAqiValue)})
                  </span>
                  {selectedArea.isApproximate && (
                    <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-300">
                      Approximate area
                    </span>
                  )}
                </div>
              </Tooltip>
            </Polygon>
          )}

          {/* PREDICTIVE DISRUPTION SPREAD MAP NETWORK */}
          {activeLayer === 'predictive' && (() => {
            const spreadData = getPredictiveDisruptionSpread(cityName, currentLocation, selectedArea);
            if (!spreadData || !spreadData.available) return null;
            const { disruptionCenter, nodes } = spreadData;

            return (
              <React.Fragment key="predictive-network">
                {/* 1. Connecting Polylines with Marching Ants Animation */}
                {nodes.map((node) => (
                  <Polyline
                    key={`spread-line-${node.id}`}
                    positions={[
                      [disruptionCenter.lat, disruptionCenter.lon],
                      [node.lat, node.lon]
                    ]}
                    pathOptions={{
                      color: node.color,
                      dashArray: '5, 10',
                      weight: 3.5,
                      opacity: 0.85,
                      className: 'animate-marching-ants'
                    }}
                  />
                ))}

                {/* 2. Confirmed Disruption Origin Marker */}
                <CircleMarker
                  key={`spread-origin-${disruptionCenter.id}`}
                  center={[disruptionCenter.lat, disruptionCenter.lon]}
                  radius={16}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.9,
                    weight: 3
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedSpreadNodeId(disruptionCenter.id);
                      if (onShowToast) {
                        onShowToast({ type: 'info', message: `Confirmed Disruption Origin: ${disruptionCenter.name}` });
                      }
                    }
                  }}
                >
                  <Popup className="rounded-xl">
                    <div className="p-1.5 font-sans space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-600 font-black text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                        <span>{disruptionCenter.name}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800">{disruptionCenter.currentImpact}</p>
                      <p className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Status: {disruptionCenter.status}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>

                {/* 3. Potential Next Impact Node Markers */}
                {nodes.map((node) => (
                  <CircleMarker
                    key={`spread-node-${node.id}`}
                    center={[node.lat, node.lon]}
                    radius={11}
                    pathOptions={{
                      color: node.color,
                      fillColor: node.color,
                      fillOpacity: 0.85,
                      weight: 2.5
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedSpreadNodeId(node.id);
                        if (onShowToast) {
                          onShowToast({ type: 'info', message: `Potential Impact Node: ${node.name}` });
                        }
                        if (mapRef.current) {
                          mapRef.current.flyTo([node.lat, node.lon], 14, { duration: 1.2 });
                        }
                      }
                    }}
                  >
                    <Popup className="rounded-xl">
                      <div className="p-1.5 font-sans space-y-1 min-w-[180px]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-slate-900">{node.name}</h4>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${node.badgeBg}`}>
                            {node.riskLevel}
                          </span>
                        </div>
                        <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] space-y-0.5">
                          <p className="font-bold text-slate-800">PREDICTED IMPACT</p>
                          <p className="text-slate-600">Potential impact: {node.predictedEffect}</p>
                          <p className="text-[9px] text-slate-500 font-semibold">Basis: {node.basis}</p>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold">
                          Prediction status: Potential impact • {node.distance} away
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </React.Fragment>
            );
          })()}

          {/* Dynamic Map Incidents Scatter */}
          {incidents.map((incident, idx) => (
            <CircleMarker
              key={`incident-${idx}`}
              center={incident.coords}
              radius={8}
              pathOptions={{
                color: incident.severity === 'critical' ? '#e11d48' : incident.severity === 'high' ? '#f59e0b' : '#3b82f6',
                fillColor: incident.severity === 'critical' ? '#f43f5e' : incident.severity === 'high' ? '#fbbf24' : '#60a5fa',
                fillOpacity: 0.8,
                weight: 2
              }}
            >
              <Popup className="rounded-xl">
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-xs text-slate-800">{incident.type}</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">{incident.details}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* MASTER-DETAIL SIDEBAR */}
      <div className={`fixed top-0 h-[100vh] flex flex-col w-[32%] bg-white/70 backdrop-blur-3xl saturate-[1.5] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] transition-all duration-500 ease-premium z-[1000] border-r border-white/60 ring-1 ring-black/[0.03] overflow-hidden sidebar-vignette ${
        isMenuHovered ? 'left-[16rem]' : 'left-[6rem]'
      } ${activeLayer ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-[120%] opacity-0 pointer-events-none'}`}>
        
        {/* Header with Close Button (Sticky Non-Scrolling Top Nav) */}
        <div className="shrink-0 sticky top-0 z-20 bg-white/80 backdrop-blur-3xl saturate-[1.4] px-6 pt-24 pb-5 border-b border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 capitalize tracking-tight">{activeLayer || 'Layer'} Telemetry Detail</h3>
              <p className="text-[10px] text-slate-400 font-semibold tracking-[0.15em] uppercase">{selectedArea ? selectedArea.name : cityName} Urban Hub</p>
            </div>
          </div>
          <button
            onClick={() => setActiveLayer(null)}
            className="w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-700 font-bold transition-all duration-300 ease-premium cursor-pointer hover:shadow-md active:scale-95"
            title="Close Detail Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Detail Body Content (Scrollable Content Body with flex-1, overflow-y-auto, and pb-40) */}
        <div className="flex-1 overflow-y-auto no-scrollbar slim-scrollbar px-6 py-6 space-y-5 pb-40 text-xs pointer-events-auto">
          {activeLayer === 'impact' && (
            <ImpactZonePanel
              cityName={cityName}
              anomalies={anomalies}
              selectedAnomalyId={selectedAnomalyId}
              impactTimeStep={impactTimeStep}
              onImpactTimeStepChange={setImpactTimeStep}
              impactLayerToggles={impactLayerToggles}
              onToggleImpactLayer={(key) => {
                setImpactLayerToggles(prev => ({ ...prev, [key]: !prev[key] }));
              }}
              isWhatIfSimulating={isWhatIfSimulating}
              onToggleWhatIfSimulation={setIsWhatIfSimulating}
              onSelectAnomaly={(anom) => {
                setSelectedAnomalyId(anom.id);
                if (mapRef.current && anom.location) {
                  mapRef.current.flyTo(anom.location, 14, { duration: 1.2 });
                }
              }}
              onShowToast={onShowToast}
            />
          )}

          {activeLayer === 'anomalies' && (
            <AnomalyDetailPanel
              cityName={cityName}
              anomalies={anomalies}
              selectedAnomalyId={selectedAnomalyId}
              impactTimeStep={impactTimeStep}
              onImpactTimeStepChange={setImpactTimeStep}
              impactLayerToggles={impactLayerToggles}
              onToggleImpactLayer={(key) => {
                setImpactLayerToggles(prev => ({ ...prev, [key]: !prev[key] }));
              }}
              isWhatIfSimulating={isWhatIfSimulating}
              onToggleWhatIfSimulation={setIsWhatIfSimulating}
              onSelectAnomaly={(anom) => {
                setSelectedAnomalyId(anom.id);
                if (mapRef.current && anom.location) {
                  mapRef.current.flyTo(anom.location, 14, { duration: 1.2 });
                }
              }}
              onShowToast={onShowToast}
            />
          )}

          {activeLayer === 'predictive' && (
            <PredictiveDetailPanel
              cityName={cityName}
              currentLocation={currentLocation}
              selectedArea={selectedArea}
              selectedNodeId={selectedSpreadNodeId}
              onSelectNode={(node) => {
                setSelectedSpreadNodeId(node.id);
                if (mapRef.current && node.lat && node.lon) {
                  mapRef.current.flyTo([node.lat, node.lon], 14, { duration: 1.2 });
                }
              }}
              onShowToast={onShowToast}
            />
          )}

          {activeLayer === 'weather' && (
            <WeatherDetailPanel cityName={cityName} weatherData={weatherData} onShowToast={onShowToast} onClose={() => setActiveLayer(null)} />
          )}

          {activeLayer === 'traffic' && (
            <TrafficDetailPanel cityName={cityName} onShowToast={onShowToast} />
          )}

          {activeLayer === 'aqi' && (
            <AQIDetailPanel cityName={selectedArea ? selectedArea.name : cityName} aqiData={aqiData} onShowToast={onShowToast} />
          )}

          {activeLayer === 'incidents' && (
            <IncidentsDetailPanel cityName={cityName} weatherData={weatherData} aqiData={aqiData} incidents={incidents} onShowToast={onShowToast} />
          )}
        </div>
      </div>

      {/* Soft Left White Gradient Mask */}
      <div className={`absolute top-0 bottom-0 left-0 w-full lg:w-[46%] bg-gradient-to-r from-white/80 via-white/40 to-transparent pointer-events-none z-10 transition-opacity duration-700 ease-premium ${
        activeLayer ? 'opacity-0' : 'opacity-100'
      }`}></div>

      {/* Synchronized Hover Magnifier Widget */}
      <SynchronizedMiniMap hoverLatLng={hoverLatLng} mapType={mapType} />

      {/* 1. FULL SCREEN WRAPPER */}
      <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col justify-between p-4 overflow-hidden">
        
        {/* 2. TOP NAVIGATION */}
        <div className="w-full flex justify-between items-center bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl px-6 py-3.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 ring-1 ring-black/[0.03] pointer-events-auto">
          {/* Left: CityPulse Logo */}
          <NavLink to="/" className="flex items-center gap-3 outline-none transition-all duration-300 ease-premium hover:-translate-y-1 hover:scale-105 active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight">CityPulse</span>
              <span className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase -mt-0.5">{cityName} Live</span>
            </div>
          </NavLink>

          {/* Center: Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/40 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/30">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 text-[11px] font-semibold rounded-lg transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                    isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Search & Chips */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* FAVORITE LOCATIONS STAR BUTTON & FLOATING GLASSMORPHIC DROPDOWN */}
            <div className="relative pointer-events-auto">
              <button
                onClick={() => setIsFavoritesOpen(prev => !prev)}
                className="w-10 h-10 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-600 border border-amber-200/60 shadow-sm ring-1 ring-amber-200/20 flex items-center justify-center cursor-pointer transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 relative"
                title="Favorite Locations"
              >
                <Star className={`w-4 h-4 fill-amber-400 text-amber-500 ${isFavoritesOpen ? 'scale-110' : ''}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black items-center justify-center text-white border border-white">
                      {favorites.length}
                    </span>
                  </span>
                )}
              </button>

              {/* FLOATING GLASSMORPHIC FAVORITES DROPDOWN MENU */}
              {isFavoritesOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 ring-1 ring-black/[0.03] p-4 z-[2000] animate-slide-up">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>Favorite Locations ({favorites.length})</span>
                    </div>
                    <button
                      onClick={() => setIsFavoritesOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-center space-y-1">
                      <p className="text-xs font-bold text-amber-800">No favorites saved yet</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Right-click anywhere on the map to save a location to your favorites.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                      {favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="p-2.5 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200/70 flex items-center justify-between transition-all group cursor-pointer"
                          onClick={() => {
                            handleAreaSelect(fav.name, fav.lat, fav.lon);
                            setIsFavoritesOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{fav.name}</h4>
                              <p className="text-[9px] font-semibold text-slate-400 font-mono">
                                {fav.lat.toFixed(4)}, {fav.lon.toFixed(4)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(fav.id);
                            }}
                            className="w-6 h-6 rounded-lg bg-slate-200/60 hover:bg-rose-100 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                            title="Remove Favorite"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative pointer-events-auto">
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-slate-50/80 hover:bg-white/90 rounded-xl border border-slate-200/50 text-xs text-slate-500 transition-all duration-300 w-44 md:w-64 focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-300/50 focus-within:bg-white relative z-[1100]">
                <Search className={`w-3.5 h-3.5 flex-shrink-0 ${isSearching ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${cityName} area...`}
                  aria-label="Search city or location"
                  className="w-full bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-xs truncate font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearchFocused(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="hidden md:inline text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm cursor-pointer transition-all duration-300 ease-premium hover:shadow-md active:scale-95"
                >
                  Locate
                </button>
              </form>

              {/* PHOTON FUZZY AUTOCOMPLETE DROPDOWN */}
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute right-0 top-full mt-3 w-72 md:w-80 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] z-[2000] overflow-hidden divide-y divide-slate-100/50 animate-slide-up pointer-events-auto">
                  {isSearching ? (
                    <div className="p-3 text-xs text-slate-500 font-semibold flex items-center gap-2">
                      <Search className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Fuzzy searching locations (Photon)...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((place, idx) => (
                      <div
                        key={`home-sug-${idx}`}
                        onClick={() => handleSelectSearchResult(place)}
                        className="p-3 text-left hover:bg-blue-50/80 flex items-start gap-2.5 cursor-pointer transition-colors group"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">{place.shortName}</span>
                            {place.isTypoCorrected && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 flex-shrink-0">
                                Auto-corrected
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{place.context || place.name}</div>
                          {place.isTypoCorrected && (
                            <div className="text-[9px] text-amber-700 font-bold italic mt-0.5">
                              Did you mean: "{place.shortName}"?
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500 font-medium text-center space-y-1">
                      <p className="font-extrabold text-slate-700">No location found</p>
                      <p className="text-[10px] text-slate-400">No location found. Please try a different search.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative cursor-pointer group transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95">
              <div className="w-10 h-10 rounded-xl ring-2 ring-blue-500/15 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden border border-white/80 shadow-sm">
                <span className="text-xs font-extrabold text-blue-700">AK</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </div>

        {/* 2. THE EXPANDING VERTICAL MENU */}
        <div 
          onMouseEnter={() => setIsMenuHovered(true)} 
          onMouseLeave={() => setIsMenuHovered(false)}
          className={`fixed left-6 top-28 z-[1050] flex flex-col gap-3 p-2.5 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 ring-1 ring-black/[0.03] transition-all duration-500 ease-premium overflow-hidden pointer-events-auto ${isMenuHovered ? 'w-56' : 'w-16'}`}
        >
          <div className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-600 border-b border-slate-100/50 mb-1">
            <Layers className="w-6 h-6 flex-shrink-0" />
            <span className={`whitespace-nowrap font-semibold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ${isMenuHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
              All Layers
            </span>
          </div>

          {layersList.map((layer) => {
            const IconComp = layer.icon;
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => {
                  const nextLayer = isSelected ? null : layer.id;
                  setActiveLayer(nextLayer);
                  if (onShowToast) onShowToast({ type: 'info', message: nextLayer ? `Opened ${layer.name} detail sidebar.` : `Closed layer details.` });
                }}
                tabIndex={0}
                className={`w-full h-12 flex items-center gap-3 px-3 rounded-xl cursor-pointer transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  isSelected ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/20' : 'hover:bg-white/80 text-slate-500 hover:text-slate-900'
                }`}
                title={layer.name}
              >
                <IconComp className={`w-6 h-6 flex-shrink-0 ${isSelected ? 'text-white' : layer.color}`} />
                <span className={`whitespace-nowrap font-semibold text-[11px] transition-all duration-300 ${isMenuHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                  {layer.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. HERO PANEL */}
        <div className="flex-1 w-full flex justify-between items-start mt-6 relative">
          
          <div className={`transition-all duration-500 ease-in-out ${isMenuHovered ? 'ml-48' : 'ml-0'}`}>
            {!activeLayer && (
              <div className="ml-24 flex flex-col space-y-4 max-w-md pointer-events-auto overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar transition-all duration-500 animate-slide-up">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-glow-pulse"></span>
                  <p className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">{cityName} IN REAL TIME</p>
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-200/40">100% Live Telemetry</span>
                </div>

                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tighter leading-[1.1]">
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent">{cityName},</span> <br className="hidden sm:inline" />
                  <span className="text-slate-900">Civic Intelligence Hub.</span>
                </h1>

                {/* Gemini AI Summary */}
                <div className="p-4 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold text-blue-600 tracking-[0.15em] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Civic Summary</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                    {isSummaryLoading ? (
                      <span className="text-slate-400 italic animate-shimmer">Synthesizing Gemini AI summary for {cityName}...</span>
                    ) : (
                      aiSummary
                    )}
                  </p>
                </div>

                {/* Hero Metric Pills */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button 
                    onClick={() => setActiveLayer('anomalies')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/50 ring-1 ring-purple-200/20 shadow-sm text-[11px] font-bold text-purple-700 rounded-xl transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
                  >
                    <span className="text-sm leading-none">🚨</span>
                    <span className="data-value">{anomalies.length} Anomalies</span>
                    <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded-md animate-pulse">
                      AI Active
                    </span>
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 ring-1 ring-black/[0.03] shadow-sm text-[11px] font-semibold text-slate-700 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer">
                    <span className="text-sm leading-none">🌡️</span>
                    <span className="data-value">{weatherData.temp}</span>
                    <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md">Open-Meteo</span>
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 ring-1 ring-black/[0.03] shadow-sm text-[11px] font-semibold text-blue-700 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer">
                    <span className="text-sm leading-none">🌧️</span>
                    <span>{weatherData.weather}</span>
                    <span className="text-[9px] bg-blue-100/80 text-blue-800 px-1.5 py-0.5 rounded-md font-bold">Live</span>
                  </button>

                  <button 
                    onClick={() => setActiveLayer('aqi')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 ring-1 ring-black/[0.03] shadow-sm text-[11px] font-semibold text-slate-700 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
                  >
                    <span className="text-sm leading-none">🍃</span>
                    <span className="data-value">US AQI {currentAqiValue}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      currentAqiValue > 200 ? 'bg-rose-100 text-rose-800' : currentAqiValue > 100 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {getAQICategory(currentAqiValue)}
                    </span>
                  </button>
                </div>

                {/* Civic Graph Card */}
                <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-5 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center text-blue-600">
                        <GitMerge className="w-4 h-4" />
                      </div>
                      <h2 className="text-[10px] font-extrabold text-slate-900 tracking-[0.2em] uppercase">Civic Graph: Live Telemetry</h2>
                    </div>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100/50">
                      <Zap className="w-3 h-3" /> Live Feed ({cityName})
                    </span>
                  </div>

                  <div className="relative space-y-2">
                    <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-rose-400"></div>

                    <div 
                      onClick={() => setActiveLayer('anomalies')}
                      className="relative flex items-center gap-3 p-3 rounded-xl border bg-purple-50/60 border-purple-200/50 ring-1 ring-purple-200/20 shadow-sm cursor-pointer hover:bg-purple-100/60 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative z-10 w-7 h-7 rounded-full border-2 border-white bg-purple-100 text-purple-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Anomaly Engine</h4>
                          <p className="text-[10px] text-slate-500">{anomalies.length} active sensor deviations</p>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Inspect</span>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-3 p-3 rounded-xl border bg-slate-50/60 border-blue-200/50 ring-1 ring-blue-200/20 shadow-sm">
                      <div className="relative z-10 w-7 h-7 rounded-full border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                        <CloudRain className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Precipitation</h4>
                          <p className="text-[10px] text-slate-500">{weatherData.weather}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600">Active</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setActiveLayer('aqi')}
                      className="relative flex items-center gap-3 p-3 rounded-xl border bg-cyan-50/40 border-cyan-200/50 ring-1 ring-cyan-200/20 shadow-sm cursor-pointer hover:bg-cyan-100/40 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative z-10 w-7 h-7 rounded-full border-2 border-white bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                        <Droplet className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Air Transducer ({selectedArea.name})</h4>
                          <p className="text-[10px] text-slate-500">US AQI: {currentAqiValue} ({getAQICategory(currentAqiValue)})</p>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">Open Panel</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100/50 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-mono data-value">Coords: {currentLocation.lat.toFixed(3)}, {currentLocation.lon.toFixed(3)}</span>
                    <button
                      onClick={() => {
                        if (onShowToast) onShowToast({ type: 'success', message: `Camera recentered on ${cityName}!` });
                        handleRecenter();
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all duration-300 ease-premium hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      <span>Recenter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT-SIDE CONTROLS */}
          <div className="flex flex-col items-end gap-4 pointer-events-auto h-full">
            <div className="flex items-center p-1.5 bg-white/70 backdrop-blur-3xl saturate-[1.5] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-xl border border-white/60 ring-1 ring-black/[0.03] gap-1">
              <button
                onClick={() => setMapType('map')}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  mapType === 'map' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  mapType === 'satellite' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Satellite</span>
              </button>
            </div>

            <div className="flex-1"></div>

            <div className="flex flex-col gap-3 items-end">
              <div className="px-4 py-2.5 bg-white/70 backdrop-blur-3xl saturate-[1.5] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-xl border border-white/60 ring-1 ring-black/[0.03] flex items-center gap-2.5 text-[11px] font-semibold text-slate-600 cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Global Feed: {cityName}</span>
              </div>

              <button
                onClick={handleZoomIn}
                className="w-12 h-12 bg-white/70 backdrop-blur-3xl saturate-[1.5] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-xl border border-white/60 ring-1 ring-black/[0.03] flex items-center justify-center font-extrabold text-sm text-slate-600 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
                title="Toggle 3D View"
              >
                3D
              </button>

              <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-xl border border-white/60 ring-1 ring-black/[0.03] flex flex-col divide-y divide-slate-100/50 overflow-hidden">
                <button
                  onClick={handleZoomIn}
                  className="w-12 h-12 hover:bg-white/80 flex items-center justify-center text-slate-500 hover:text-blue-600 font-bold transition-all duration-300 ease-premium active:scale-95 cursor-pointer"
                  title="Zoom In"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-12 h-12 hover:bg-white/80 flex items-center justify-center text-slate-500 hover:text-blue-600 font-bold transition-all duration-300 ease-premium active:scale-95 cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CENTER LEGEND */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl px-6 py-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex items-center justify-center gap-4 border border-white/60 ring-1 ring-black/[0.03]">
          <span className="text-[11px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-blue-600" />
            Civic Activity ({cityName}):
          </span>
          <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm"></span>
              <span>Elevated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm animate-glow-pulse"></span>
              <span className="text-rose-600 font-bold">Alert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
