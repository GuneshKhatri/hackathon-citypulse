import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { geocodeAddress } from '../utils/geoUtils';
import {
  Search,
  Navigation,
  MapPin,
  Car,
  Bike,
  Footprints,
  ArrowUpDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Compass,
  Plus,
  Minus,
  Map as MapIcon,
  Globe,
  Layers,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Home as HomeIcon,
  Briefcase,
  Star,
  Fuel,
  Utensils,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowUp,
  Activity,
  Crosshair,
  TrafficCone
} from 'lucide-react';

// Custom Leaflet Icons
const createUserMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <div class="relative w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createStartIcon = (label = 'Start Origin') => {
  return L.divIcon({
    className: 'custom-start-marker',
    html: `
      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-full shadow-xl border-2 border-white text-xs font-extrabold whitespace-nowrap -translate-x-1/2 -translate-y-full">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createDestinationIcon = (label = 'Destination') => {
  return L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-full shadow-xl border-2 border-white text-xs font-extrabold whitespace-nowrap -translate-x-1/2 -translate-y-full">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createPoiIcon = (symbol, label) => {
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div class="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-md border border-slate-700 text-[10px] font-bold whitespace-nowrap -translate-x-1/2 -translate-y-1/2">
        <span>${symbol}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Map Controller Component for smooth flying & centering
function MapController({ mapRef, centerCoords, zoomLevel }) {
  const map = useMap();

  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  useEffect(() => {
    if (centerCoords && centerCoords[0] && centerCoords[1]) {
      map.flyTo(centerCoords, zoomLevel || 14, { duration: 1.2 });
    }
  }, [centerCoords, zoomLevel, map]);

  return null;
}

// Map Bounds Fitter Component to automatically frame the calculated road route or endpoints
function RouteBoundsFitter({ routePoints, origin, destination, isNavigationActive }) {
  const map = useMap();

  useEffect(() => {
    if (routePoints && routePoints.length > 1 && !isNavigationActive) {
      try {
        const bounds = L.latLngBounds(routePoints);
        map.fitBounds(bounds, { padding: [80, 80], animate: true });
      } catch (e) {
        console.warn('fitBounds error:', e);
      }
    } else if (origin && origin.lat && destination && destination.lat && !isNavigationActive) {
      try {
        const bounds = L.latLngBounds([
          [origin.lat, origin.lon],
          [destination.lat, destination.lon]
        ]);
        map.fitBounds(bounds, { padding: [80, 80], animate: true });
      } catch (e) {
        console.warn('fitBounds fallback error:', e);
      }
    }
  }, [routePoints, origin, destination, isNavigationActive, map]);

  return null;
}

// Helper: Extract turn-by-turn maneuver instruction from OSRM steps
function getTurnManeuverInfo(steps, stepRatio) {
  if (!steps || steps.length === 0) {
    return {
      Icon: ArrowUpRight,
      actionText: 'Proceed onto main road corridor',
      streetName: 'Main Arterial Road',
      distanceText: '250 m'
    };
  }

  const stepIdx = Math.min(steps.length - 1, Math.floor(stepRatio * steps.length));
  const currentStep = steps[stepIdx] || steps[0];
  const nextStep = steps[Math.min(steps.length - 1, stepIdx + 1)];

  const stepToDisplay = nextStep || currentStep;

  const modifier = (stepToDisplay.maneuver?.modifier || '').toLowerCase();
  const type = (stepToDisplay.maneuver?.type || '').toLowerCase();
  const streetName = stepToDisplay.name || 'unnamed road';
  const distM = Math.round(stepToDisplay.distance || 250);
  const distanceText = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`;

  let actionText = `Continue onto ${streetName}`;
  let Icon = ArrowUp;

  if (type === 'depart') {
    actionText = `Head towards ${streetName}`;
    Icon = ArrowUp;
  } else if (type === 'arrive') {
    actionText = `Arrive at destination (${streetName})`;
    Icon = CheckCircle2;
  } else if (modifier.includes('left')) {
    actionText = `Turn ${modifier} onto ${streetName}`;
    Icon = ArrowUpLeft;
  } else if (modifier.includes('right')) {
    actionText = `Turn ${modifier} onto ${streetName}`;
    Icon = ArrowUpRight;
  } else if (modifier === 'uturn') {
    actionText = `Make U-Turn onto ${streetName}`;
    Icon = RotateCcw;
  } else if (type === 'roundabout' || type === 'rotary') {
    actionText = `Take roundabout exit onto ${streetName}`;
    Icon = ArrowUpRight;
  }

  return { Icon, actionText, streetName, distanceText };
}

// Fallback curve points generator if OSRM is offline
function generateFallbackCurvePoints(originCoords, destCoords, curvature = 0) {
  const points = [];
  const steps = 35;
  const lat1 = originCoords[0];
  const lon1 = originCoords[1];
  const lat2 = destCoords[0];
  const lon2 = destCoords[1];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curveOffsetLat = Math.sin(t * Math.PI) * curvature * 0.015;
    const curveOffsetLon = Math.sin(t * Math.PI) * curvature * -0.012;

    const lat = lat1 + (lat2 - lat1) * t + curveOffsetLat;
    const lon = lon1 + (lon2 - lon1) * t + curveOffsetLon;
    points.push([lat, lon]);
  }
  return points;
}

export default function NavigatePage({ currentLocation, cityName, onShowToast, onSearchLocation }) {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('map');
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);

  // Dual Route Endpoint States
  const [origin, setOrigin] = useState({
    name: cityName || 'My Location',
    lat: currentLocation.lat,
    lon: currentLocation.lon
  });

  const [destination, setDestination] = useState({
    name: 'Pink City Palace',
    lat: currentLocation.lat + 0.025,
    lon: currentLocation.lon + 0.028
  });

  // Editable Queries & Autocomplete Active State
  const [originQuery, setOriginQuery] = useState(cityName || 'My Location');
  const [destQuery, setDestQuery] = useState('Pink City Palace');
  const [activeInput, setActiveInput] = useState(null); // 'origin' | 'dest' | null

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [transportMode, setTransportMode] = useState('driving'); // driving, biking, walking, cycling

  // Route Options & Active Selection
  const [routesList, setRoutesList] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [simulatedStepIndex, setSimulatedStepIndex] = useState(0);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);

  // POI Filters & Community Reports
  const [activePoiFilter, setActivePoiFilter] = useState(null);
  const [poiMarkers, setPoiMarkers] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Saved Places Quick Access
  const [savedPlaces, setSavedPlaces] = useState([
    { id: 'home', name: 'Home', coords: [currentLocation.lat + 0.012, currentLocation.lon - 0.015], icon: HomeIcon },
    { id: 'work', name: 'Work', coords: [currentLocation.lat - 0.018, currentLocation.lon + 0.022], icon: Briefcase },
    { id: 'fav1', name: 'Jaipur Airport', coords: [currentLocation.lat - 0.045, currentLocation.lon + 0.012], icon: Star }
  ]);

  // Sync origin & queries when currentLocation prop changes
  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      setOrigin({
        name: cityName || 'My Location',
        lat: currentLocation.lat,
        lon: currentLocation.lon
      });
      setOriginQuery(cityName || 'My Location');
    }
  }, [currentLocation, cityName]);

  // Handle Autocomplete Query Input Change (Updates query string & active field without immediate API call)
  const handleQueryChange = (val, fieldType) => {
    if (fieldType === 'origin') {
      setOriginQuery(val);
    } else {
      setDestQuery(val);
    }
    setActiveInput(fieldType);
  };

  // Debounced Geocoding Autocomplete Search Effect (600ms pause threshold)
  useEffect(() => {
    if (!activeInput) {
      return;
    }

    const currentQuery = activeInput === 'origin' ? originQuery : destQuery;

    if (!currentQuery || !currentQuery.trim() || currentQuery.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await geocodeAddress(currentQuery);
        setSearchResults(results || []);
      } catch (err) {
        console.error('Debounced geocoding search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [originQuery, destQuery, activeInput]);

  // Select Autocomplete Search Result
  const handleSelectResult = (place, fieldType) => {
    const selectedLoc = {
      name: place.shortName || place.name.split(',')[0],
      lat: place.lat,
      lon: place.lon
    };

    if (fieldType === 'origin') {
      setOrigin(selectedLoc);
      setOriginQuery(selectedLoc.name);
    } else {
      setDestination(selectedLoc);
      setDestQuery(selectedLoc.name);
    }

    setActiveInput(null);
    setSearchResults([]);
    setSelectedRouteIndex(0);

    if (onShowToast) {
      onShowToast({ type: 'success', message: `${fieldType === 'origin' ? 'Start origin' : 'Destination'} set to ${selectedLoc.name}` });
    }
  };

  // Quick Action: Use Current Location
  const handleUseCurrentLocation = () => {
    const currentLoc = {
      name: cityName || 'My Location',
      lat: currentLocation.lat,
      lon: currentLocation.lon
    };
    setOrigin(currentLoc);
    setOriginQuery(currentLoc.name);
    setActiveInput(null);
    setSearchResults([]);
    if (onShowToast) onShowToast({ type: 'info', message: 'Start set to current location.' });
  };

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    if (!destination) return;
    const tempOrigin = origin;
    const tempDest = destination;

    setOrigin(tempDest);
    setOriginQuery(tempDest.name);

    setDestination(tempOrigin);
    setDestQuery(tempOrigin.name);

    setActiveInput(null);
    setSearchResults([]);
    setSelectedRouteIndex(0);

    if (onShowToast) onShowToast({ type: 'info', message: 'Swapped origin and destination.' });
  };

  // Clear Single Field
  const handleClearField = (fieldType) => {
    if (fieldType === 'origin') {
      setOriginQuery('');
      setActiveInput('origin');
    } else {
      setDestQuery('');
      setDestination(null);
      setActiveInput('dest');
    }
    setSearchResults([]);
  };

  // Compute Multi-Routes via OSRM API (Real Road Network Geometry)
  useEffect(() => {
    if (!origin || !origin.lat || !origin.lon || !destination || !destination.lat || !destination.lon) {
      setRoutesList([]);
      return;
    }

    let isCancelled = false;

    const calculateOSRMDirectoryRoutes = async () => {
      try {
        const startStr = `${origin.lon},${origin.lat}`;
        const destStr = `${destination.lon},${destination.lat}`;

        const url = `https://router.project-osrm.org/route/v1/driving/${startStr};${destStr}?overview=full&geometries=geojson&steps=true&alternatives=true`;

        const res = await fetch(url);
        const data = await res.json();

        if (isCancelled) return;

        if (data && data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const osrmRoutes = data.routes;
          const speedMultiplier = transportMode === 'walking' ? 0.15 : transportMode === 'cycling' ? 0.35 : transportMode === 'biking' ? 0.75 : 1.0;

          const processedRoutes = osrmRoutes.map((r, idx) => {
            const points = r.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
            
            const rawDurationMin = Math.round(r.duration / 60);
            const durationVal = Math.max(1, Math.round(rawDurationMin / speedMultiplier));
            const distanceKm = (r.distance / 1000).toFixed(1);

            const steps = r.legs && r.legs[0] && r.legs[0].steps ? r.legs[0].steps : [];
            const summaryRoad = r.legs && r.legs[0] && r.legs[0].summary ? r.legs[0].summary : 'Main Transit Road';

            let title = idx === 0 ? 'Fastest Route' : idx === 1 ? 'Cleaner Air Route' : 'Balanced Route';
            let tag = idx === 0 ? 'Fastest • OSRM Snapped' : idx === 1 ? '26% Less AQI' : 'Smooth Traffic';
            let tagBg = idx === 0 ? 'bg-blue-600 text-white' : idx === 1 ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white';
            let aqiVal = idx === 0 ? 82 : idx === 1 ? 61 : 69;
            let aqiStatus = idx === 0 ? 'Moderate' : 'Good';
            let aqiColor = idx === 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
            let color = idx === 0 ? '#0284c7' : idx === 1 ? '#059669' : '#7c3aed';

            return {
              id: `osrm-route-${idx}`,
              title,
              tag,
              tagBg,
              duration: `${durationVal} min`,
              durationVal,
              distance: `${distanceKm} km`,
              distanceVal: parseFloat(distanceKm),
              aqi: aqiVal,
              aqiStatus,
              aqiColor,
              summary: `Via ${summaryRoad} • Snapped to road network`,
              points,
              steps,
              color
            };
          });

          if (processedRoutes.length === 1) {
            const baseRoute = processedRoutes[0];
            processedRoutes.push({
              id: 'osrm-route-cleaner',
              title: 'Cleaner Air Route',
              tag: '26% Less AQI',
              tagBg: 'bg-emerald-600 text-white',
              duration: `${baseRoute.durationVal + 3} min`,
              durationVal: baseRoute.durationVal + 3,
              distance: `${(baseRoute.distanceVal + 0.4).toFixed(1)} km`,
              distanceVal: baseRoute.distanceVal + 0.4,
              aqi: 61,
              aqiStatus: 'Good',
              aqiColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              summary: `${baseRoute.summary} (via Park Bypass)`,
              points: baseRoute.points,
              steps: baseRoute.steps,
              color: '#059669'
            });

            processedRoutes.push({
              id: 'osrm-route-balanced',
              title: 'Balanced Route',
              tag: 'Smooth Traffic',
              tagBg: 'bg-purple-600 text-white',
              duration: `${baseRoute.durationVal + 1} min`,
              durationVal: baseRoute.durationVal + 1,
              distance: `${(baseRoute.distanceVal + 0.2).toFixed(1)} km`,
              distanceVal: baseRoute.distanceVal + 0.2,
              aqi: 69,
              aqiStatus: 'Good',
              aqiColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              summary: `${baseRoute.summary} (via Ring Road)`,
              points: baseRoute.points,
              steps: baseRoute.steps,
              color: '#7c3aed'
            });
          }

          setRoutesList(processedRoutes);
          if (onShowToast) onShowToast({ type: 'success', message: 'Snapped route geometry along road network (OSRM).' });
        } else {
          useFallbackRoutes();
        }
      } catch (err) {
        console.warn('OSRM routing fetch failed:', err);
        if (!isCancelled) useFallbackRoutes();
      }
    };

    const useFallbackRoutes = () => {
      const oCoords = [origin.lat, origin.lon];
      const dCoords = [destination.lat, destination.lon];
      const r1Points = generateFallbackCurvePoints(oCoords, dCoords, 0);
      const r2Points = generateFallbackCurvePoints(oCoords, dCoords, 1.2);
      const r3Points = generateFallbackCurvePoints(oCoords, dCoords, -1.1);

      const distKm = (Math.hypot(destination.lat - origin.lat, destination.lon - origin.lon) * 111).toFixed(1);
      const speedKmH = transportMode === 'walking' ? 5 : transportMode === 'cycling' ? 15 : transportMode === 'biking' ? 35 : 45;
      const baseDurationMin = Math.round((distKm / speedKmH) * 60) || 12;

      const fallback = [
        {
          id: 'fastest',
          title: 'Fastest Route',
          tag: 'Recommended',
          tagBg: 'bg-blue-600 text-white',
          duration: `${baseDurationMin} min`,
          durationVal: baseDurationMin,
          distance: `${distKm} km`,
          distanceVal: parseFloat(distKm),
          aqi: 82,
          aqiStatus: 'Moderate',
          aqiColor: 'text-amber-600 bg-amber-50 border-amber-200',
          summary: 'Via Main Arterial Corridor',
          points: r1Points,
          steps: [],
          color: '#0284c7'
        },
        {
          id: 'cleaner',
          title: 'Cleaner Air Route',
          tag: '26% Less AQI',
          tagBg: 'bg-emerald-600 text-white',
          duration: `${baseDurationMin + 3} min`,
          durationVal: baseDurationMin + 3,
          distance: `${(parseFloat(distKm) + 0.6).toFixed(1)} km`,
          distanceVal: parseFloat(distKm) + 0.6,
          aqi: 61,
          aqiStatus: 'Good',
          aqiColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          summary: 'Via Parks & Eco-Bypass',
          points: r2Points,
          steps: [],
          color: '#059669'
        },
        {
          id: 'balanced',
          title: 'Balanced Route',
          tag: 'Smooth Traffic',
          tagBg: 'bg-purple-600 text-white',
          duration: `${baseDurationMin + 1} min`,
          durationVal: baseDurationMin + 1,
          distance: `${(parseFloat(distKm) + 0.2).toFixed(1)} km`,
          distanceVal: parseFloat(distKm) + 0.2,
          aqi: 69,
          aqiStatus: 'Good',
          aqiColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          summary: 'Via Sector 4 Bypass',
          points: r3Points,
          steps: [],
          color: '#7c3aed'
        }
      ];
      setRoutesList(fallback);
    };

    calculateOSRMDirectoryRoutes();

    return () => {
      isCancelled = true;
    };
  }, [origin, destination, transportMode]);

  // POI Search along Route
  const handleTogglePoiFilter = (type) => {
    if (activePoiFilter === type) {
      setActivePoiFilter(null);
      setPoiMarkers([]);
      return;
    }

    setActivePoiFilter(type);
    const activeRoute = routesList[selectedRouteIndex] || routesList[0];
    if (!activeRoute || !activeRoute.points) return;

    const p1 = activeRoute.points[Math.floor(activeRoute.points.length * 0.25)] || activeRoute.points[0];
    const p2 = activeRoute.points[Math.floor(activeRoute.points.length * 0.55)] || activeRoute.points[0];
    const p3 = activeRoute.points[Math.floor(activeRoute.points.length * 0.8)] || activeRoute.points[0];

    let items = [];
    if (type === 'petrol') {
      items = [
        { name: 'HP Fuel Station', symbol: '⛽', coords: p1 },
        { name: 'Indian Oil Energy', symbol: '⛽', coords: p2 },
        { name: 'Shell Express', symbol: '⛽', coords: p3 }
      ];
    } else if (type === 'ev') {
      items = [
        { name: 'Tata Power EV Fast Charger', symbol: '⚡', coords: p1 },
        { name: 'Ather Grid Charging', symbol: '⚡', coords: p2 },
        { name: 'Jio-bp EV Hub', symbol: '⚡', coords: p3 }
      ];
    } else if (type === 'food') {
      items = [
        { name: 'Highway Diner & Cafe', symbol: '🍽️', coords: p1 },
        { name: 'Express Bites', symbol: '🍽️', coords: p2 },
        { name: 'Green Leaf Bistro', symbol: '🍽️', coords: p3 }
      ];
    } else if (type === 'parking') {
      items = [
        { name: 'Municipal Multi-Level Parking', symbol: '🅿️', coords: p1 },
        { name: 'Central Transit Plaza Parking', symbol: '🅿️', coords: p2 }
      ];
    }

    setPoiMarkers(items);
    if (onShowToast) onShowToast({ type: 'success', message: `Found ${items.length} ${type.toUpperCase()} locations along route!` });
  };

  // Simulated Movement Animation Effect
  useEffect(() => {
    let interval = null;
    if (isSimulatingMovement && isNavigationActive) {
      interval = setInterval(() => {
        setSimulatedStepIndex((prev) => {
          const activeRoute = routesList[selectedRouteIndex] || routesList[0];
          if (!activeRoute || !activeRoute.points) return prev;

          if (prev < activeRoute.points.length - 1) {
            return prev + 1;
          } else {
            setIsSimulatingMovement(false);
            if (onShowToast) onShowToast({ type: 'success', message: `Arrived at ${destination?.name || 'Destination'}!` });
            return prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingMovement, isNavigationActive, routesList, selectedRouteIndex, destination, onShowToast]);

  // Current Animated User Coordinates during navigation
  const activeRoute = routesList[selectedRouteIndex] || routesList[0];
  const currentUserCoords = (isNavigationActive && activeRoute && activeRoute.points && activeRoute.points[simulatedStepIndex])
    ? activeRoute.points[simulatedStepIndex]
    : [origin.lat, origin.lon];

  // Turn-by-Turn Instruction Computation
  const currentStepRatio = activeRoute?.points ? (simulatedStepIndex / activeRoute.points.length) : 0;
  const remainingKm = activeRoute ? (parseFloat(activeRoute.distance) * (1 - currentStepRatio)).toFixed(1) : '4.2';
  const remainingMin = activeRoute ? Math.ceil(activeRoute.durationVal * (1 - currentStepRatio)) : 12;

  // Submit Community Report
  const handleAddCommunityReport = (reportType) => {
    const newReport = {
      type: reportType,
      coords: [currentUserCoords[0] + 0.002, currentUserCoords[1] + 0.003],
      time: 'Just now',
      reporter: 'You (Live)'
    };
    setUserReports((prev) => [newReport, ...prev]);
    setIsReportModalOpen(false);
    if (onShowToast) onShowToast({ type: 'success', message: `Reported ${reportType} on route! Marked for all drivers.` });
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Navigate', path: '/navigate' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Community', path: '/community' },
    { label: 'About', path: '/about' }
  ];

  const tileUrl = mapType === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      
      {/* ========================================================================= */}
      {/* 0. BASE LEAFLET MAP BACKGROUND LAYER */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <MapContainer
          center={[origin.lat, origin.lon]}
          zoom={14}
          zoomControl={false}
          style={{ height: '100vh', width: '100%' }}
          className="w-full h-full absolute inset-0 z-0"
        >
          <MapController mapRef={mapRef} centerCoords={currentUserCoords} zoomLevel={isNavigationActive ? 16 : 14} />
          
          {/* Map Bounds Auto-Fitter */}
          <RouteBoundsFitter routePoints={activeRoute?.points} origin={origin} destination={destination} isNavigationActive={isNavigationActive} />

          <TileLayer url={tileUrl} maxZoom={19} />

          {/* TomTom Global Traffic Layer (Toggleable) */}
          {showTrafficLayer && (
            <TileLayer
              url="https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=YOUR_TOMTOM_API_KEY"
              attribution="&copy; TomTom Traffic"
              maxZoom={22}
              opacity={0.8}
              zIndex={10}
            />
          )}

          {/* User / Start Origin Marker (Green Pin) */}
          {origin && (
            <Marker position={[origin.lat, origin.lon]} icon={createStartIcon(origin.name)}>
              <Popup className="rounded-xl">
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-xs text-emerald-700">Start Origin</h4>
                  <p className="text-[10px] text-slate-600">{origin.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker Pin (Red Pin) */}
          {destination && (
            <Marker position={[destination.lat, destination.lon]} icon={createDestinationIcon(destination.name)}>
              <Popup className="rounded-xl">
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-xs text-rose-700">{destination.name}</h4>
                  <p className="text-[10px] text-slate-600">Destination Hub</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Polylines: Casing + Primary Blue for selected, dashed gray for unselected alternatives */}
          {routesList.map((route, idx) => {
            const isSelected = idx === selectedRouteIndex;

            if (isSelected) {
              return (
                <React.Fragment key={`route-group-${route.id}`}>
                  {/* Google Maps Style Casing Polyline (Underlay) */}
                  <Polyline
                    positions={route.points}
                    pathOptions={{
                      color: '#1e40af',
                      weight: 9,
                      opacity: 0.45,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                  {/* Google Maps Style Primary Blue Polyline */}
                  <Polyline
                    positions={route.points}
                    pathOptions={{
                      color: '#0284c7',
                      weight: 5,
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                </React.Fragment>
              );
            }

            return (
              <Polyline
                key={`route-line-${route.id}`}
                positions={route.points}
                eventHandlers={{
                  click: () => {
                    setSelectedRouteIndex(idx);
                    if (onShowToast) onShowToast({ type: 'info', message: `Selected ${route.title}` });
                  }
                }}
                pathOptions={{
                  color: '#94a3b8',
                  weight: 4,
                  opacity: 0.75,
                  dashArray: '4, 8',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            );
          })}

          {/* Simulated Traffic Flow Colors Overlay on Active Route */}
          {activeRoute && activeRoute.points && activeRoute.points.length > 5 && (
            <>
              {/* Segment 1: Free Flow Green */}
              <Polyline
                positions={activeRoute.points.slice(0, Math.floor(activeRoute.points.length * 0.4))}
                pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9, lineCap: 'round' }}
              />
              {/* Segment 2: Moderate Traffic Yellow */}
              <Polyline
                positions={activeRoute.points.slice(Math.floor(activeRoute.points.length * 0.38), Math.floor(activeRoute.points.length * 0.75))}
                pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.9, lineCap: 'round' }}
              />
              {/* Segment 3: Heavy Traffic Orange */}
              <Polyline
                positions={activeRoute.points.slice(Math.floor(activeRoute.points.length * 0.73))}
                pathOptions={{ color: '#f97316', weight: 4, opacity: 0.9, lineCap: 'round' }}
              />
            </>
          )}

          {/* POI Markers along route */}
          {poiMarkers.map((poi, idx) => (
            <Marker key={`poi-${idx}`} position={poi.coords} icon={createPoiIcon(poi.symbol, poi.name)}>
              <Popup className="rounded-xl">
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-xs text-slate-800">{poi.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">Open • Service along route</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Community User Reports Markers */}
          {userReports.map((rep, idx) => (
            <CircleMarker
              key={`user-report-${idx}`}
              center={rep.coords}
              radius={9}
              pathOptions={{ color: '#e11d48', fillColor: '#f43f5e', fillOpacity: 0.9, weight: 2 }}
            >
              <Popup className="rounded-xl">
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-xs text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {rep.type}
                  </h4>
                  <p className="text-[10px] text-slate-600">Reported by {rep.reporter} • {rep.time}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING UI OVERLAY WRAPPER */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col justify-between p-4 overflow-hidden">
        
        {/* 1. TOP HEADER & NAVIGATION BAR */}
        <div className="w-full flex justify-between items-center bg-white/90 backdrop-blur rounded-full px-6 py-3 shadow-sm pointer-events-auto">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 outline-none">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30 text-white">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">CityPulse</span>
              <span className="text-[9px] font-semibold text-blue-600 tracking-wider uppercase -mt-0.5">{cityName} Navigation</span>
            </div>
          </NavLink>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/40">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 active:scale-95 ${
                    isActive ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right User Avatar & Status Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>OSRM Engine Live</span>
            </div>

            <div className="relative cursor-pointer group">
              <div className="w-9 h-9 rounded-full ring-2 ring-blue-500/20 bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                <span className="text-xs font-bold text-blue-700">AK</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 5: LIVE TURN-BY-TURN NAVIGATION INSTRUCTION HEADER */}
        {/* ========================================================================= */}
        {isNavigationActive && (() => {
          const activeRouteObj = routesList[selectedRouteIndex] || routesList[0];
          const maneuverInfo = getTurnManeuverInfo(activeRouteObj?.steps, currentStepRatio);
          const ManeuverIcon = maneuverInfo.Icon;

          return (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-11/12 max-w-xl z-[1020] pointer-events-auto bg-slate-900/95 backdrop-blur-2xl text-white rounded-3xl p-5 shadow-2xl border border-slate-700 animate-in slide-in-from-top duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <ManeuverIcon className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Next Instruction • In {maneuverInfo.distanceText}</div>
                    <h2 className="text-lg font-extrabold text-white leading-snug">{maneuverInfo.actionText}</h2>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">Destination: {destination?.name || 'Target'}</p>
                  </div>
                </div>
                
                <div className="text-right pl-4 border-l border-slate-800 flex-shrink-0">
                  <div className="text-2xl font-black text-emerald-400">{remainingMin} min</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{remainingKm} km left</div>
                </div>
              </div>

              {/* Simulated Movement Control Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
                  className={`px-4 py-1.5 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSimulatingMovement ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span>{isSimulatingMovement ? 'Pause Simulation' : 'Simulate Movement'}</span>
                  <span className="px-1.5 py-0.2 bg-black/20 rounded text-[9px] font-mono">SIMULATED</span>
                </button>

                <button
                  onClick={() => {
                    setSimulatedStepIndex(0);
                    if (onShowToast) onShowToast({ type: 'info', message: 'Simulated Wrong Turn! Recalculating route along road network...' });
                  }}
                  className="text-slate-300 hover:text-white font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Simulate Wrong Turn</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* PHASE 2 & 3: FLOATING DUAL-INPUT SEARCH & DIRECTIONS PANEL */}
        {/* ========================================================================= */}
        {!isNavigationActive && (
          <div className="flex-1 w-full flex justify-between items-start mt-4 relative">
            
            {/* Left Sliding Directions & Search Panel */}
            <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-2xl pointer-events-auto flex flex-col space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar animate-in slide-in-from-left duration-300 relative z-[1100]">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Plan Route & Directions</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">{cityName} Transit Network</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  AQI Aware
                </span>
              </div>

              {/* SAVED PLACES QUICK ACCESS */}
              <div className="flex items-center gap-2">
                {savedPlaces.map((sp) => {
                  const IconC = sp.icon;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => {
                        const newDest = { name: sp.name, lat: sp.coords[0], lon: sp.coords[1] };
                        setDestination(newDest);
                        setDestQuery(sp.name);
                        setActiveInput(null);
                        setSearchResults([]);
                        if (onShowToast) onShowToast({ type: 'info', message: `Set destination to ${sp.name}` });
                      }}
                      className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-blue-50 rounded-xl border border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      <IconC className="w-3.5 h-3.5 text-blue-600" />
                      <span>{sp.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* DUAL DIRECTIONS INPUT CARD (FROM / TO WITH EDITABLE INPUTS, GEOCODING, SWAP, CLEAR & CURRENT LOCATION) */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3 relative z-[1200] pointer-events-auto">
                
                {/* FROM (Origin) Input */}
                <div className="relative">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From (Start Origin)</span>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/90 focus-within:ring-2 focus-within:ring-emerald-500 shadow-2xs">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0"></span>
                    <input
                      type="text"
                      value={originQuery}
                      onFocus={() => setActiveInput('origin')}
                      onChange={(e) => handleQueryChange(e.target.value, 'origin')}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Enter starting location..."
                      className="w-full bg-transparent focus:outline-none text-xs font-extrabold text-slate-900 placeholder-slate-400 truncate"
                    />
                    
                    {/* Current Location Quick Button */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors flex-shrink-0"
                      title="Use Current Location"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>

                    {/* Clear Button */}
                    {originQuery && (
                      <button
                        type="button"
                        onClick={() => handleClearField('origin')}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0"
                        title="Clear Origin"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* SWAP BUTTON DIVIDER */}
                <div className="relative flex items-center justify-center my-1">
                  <div className="border-t border-slate-200/70 w-full"></div>
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    disabled={!destination}
                    className="absolute w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-50 z-10"
                    title="Swap Origin & Destination"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* TO (Destination) Input */}
                <div className="relative">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To (Destination)</span>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/90 focus-within:ring-2 focus-within:ring-rose-500 shadow-2xs">
                    <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100 flex-shrink-0"></span>
                    <input
                      type="text"
                      value={destQuery}
                      onFocus={() => setActiveInput('dest')}
                      onChange={(e) => handleQueryChange(e.target.value, 'dest')}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Choose destination..."
                      className="w-full bg-transparent focus:outline-none text-xs font-extrabold text-slate-900 placeholder-slate-400 truncate"
                    />

                    {/* Clear Button */}
                    {destQuery && (
                      <button
                        type="button"
                        onClick={() => handleClearField('dest')}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0"
                        title="Clear Destination"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* INDEPENDENT TYPO-TOLERANT AUTOCOMPLETE SUGGESTIONS DROPDOWN (PHOTON API) */}
                {activeInput !== null && (searchResults.length > 0 || isSearching || ((activeInput === 'origin' ? originQuery : destQuery).trim().length >= 3)) && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-2xl z-[1300] overflow-hidden divide-y divide-slate-100 pointer-events-auto">
                    {isSearching ? (
                      <div className="p-3.5 text-xs text-slate-500 font-semibold flex items-center gap-2">
                        <Search className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Searching fuzzy location index (Photon)...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((place, idx) => (
                        <button
                          key={`sug-${idx}`}
                          type="button"
                          onClick={() => handleSelectResult(place, activeInput)}
                          className="w-full p-3 text-left hover:bg-blue-50/80 flex items-start gap-3 transition-colors cursor-pointer group"
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
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-slate-500 font-medium text-center space-y-1">
                        <p className="font-extrabold text-slate-700">No location found</p>
                        <p className="text-[11px] text-slate-400">No location found. Please try a different search.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* TRANSPORT MODE PILL TOGGLE */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
                {[
                  { id: 'driving', label: 'Car', icon: Car },
                  { id: 'biking', label: 'Bike', icon: Bike },
                  { id: 'walking', label: 'Walk', icon: Footprints },
                  { id: 'cycling', label: 'Cycle', icon: Bike }
                ].map((modeItem) => {
                  const ModeIcon = modeItem.icon;
                  const isSelected = transportMode === modeItem.id;
                  return (
                    <button
                      key={modeItem.id}
                      onClick={() => setTransportMode(modeItem.id)}
                      className={`py-2 px-2 rounded-xl flex flex-col items-center justify-center gap-1 font-extrabold text-[10px] cursor-pointer transition-all ${
                        isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60'
                      }`}
                    >
                      <ModeIcon className="w-4 h-4" />
                      <span>{modeItem.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ROUTE SELECTION CARDS */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 uppercase tracking-wider px-1">
                  <span>Available Route Options</span>
                  <span className="text-[9px] font-bold text-slate-400">Select one below</span>
                </div>

                {routesList.map((route, idx) => {
                  const isSelected = selectedRouteIndex === idx;
                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRouteIndex(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${route.tagBg}`}>
                            {route.tag}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900">{route.title}</h4>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${route.aqiColor}`}>
                          AQI {route.aqi} ({route.aqiStatus})
                        </span>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-slate-900">{route.duration}</span>
                        <span className="text-xs font-extrabold text-slate-500">{route.distance}</span>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-600 leading-snug">{route.summary}</p>
                    </div>
                  );
                })}
              </div>

              {/* SIMULATED TRAFFIC FLOW & AI PREDICTION CARD */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    CityPulse AI Route Recommendation
                  </span>
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono text-[9px] font-bold">AI ESTIMATE</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Cleaner Air Route is 3 minutes longer but reduces particulate exposure by 26% and avoids heavy traffic bottleneck on central arterial.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Free</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Heavy</span>
                  <span className="px-1 bg-slate-200 rounded font-mono text-[9px]">SIMULATED TRAFFIC FLOW</span>
                </div>
              </div>

              {/* START NAVIGATION BUTTON */}
              <div className="pt-2">
                <button
                  disabled={!destination}
                  onClick={() => {
                    if (!destination) return;
                    setIsNavigationActive(true);
                    setSimulatedStepIndex(0);
                    if (onShowToast) onShowToast({ type: 'success', message: `Started Turn-by-Turn navigation to ${destination.name}!` });
                  }}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Start Navigation</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 5: EXIT NAVIGATION FLOATING BUTTON */}
        {/* ========================================================================= */}
        {isNavigationActive && (
          <div className="absolute bottom-6 right-6 z-[1030] pointer-events-auto">
            <button
              onClick={() => {
                setIsNavigationActive(false);
                setIsSimulatingMovement(false);
                if (onShowToast) onShowToast({ type: 'info', message: 'Exited Turn-by-Turn Navigation mode.' });
              }}
              className="py-3.5 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-full shadow-2xl border-2 border-white flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              <X className="w-4 h-4" />
              <span>Exit Navigation</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 6: SEARCH ALONG ROUTE POI PILLS & MAP CONTROLS */}
        {/* ========================================================================= */}
        {!isNavigationActive && (
          <div className="w-full flex items-end justify-between pointer-events-auto mt-4">
            
            {/* Left POI Search Pills */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-lg">
              {[
                { type: 'petrol', label: 'Fuel', symbol: '⛽' },
                { type: 'ev', label: 'EV Fast', symbol: '⚡' },
                { type: 'food', label: 'Food', symbol: '🍽️' },
                { type: 'parking', label: 'Parking', symbol: '🅿️' }
              ].map((poiItem) => {
                const isActive = activePoiFilter === poiItem.type;
                return (
                  <button
                    key={poiItem.type}
                    onClick={() => handleTogglePoiFilter(poiItem.type)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{poiItem.symbol}</span>
                    <span>{poiItem.label}</span>
                  </button>
                );
              })}

              {/* Community Incident Report Button */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer ml-1"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Report Incident</span>
              </button>
            </div>

            {/* Right Map Controls Cluster */}
            <div className="flex flex-col items-end gap-3">
              
              {/* Map / Satellite / Traffic Toggles */}
              <div className="flex items-center p-1 bg-white/90 backdrop-blur-md shadow-md rounded-xl border border-slate-200/80 gap-1">
                <button
                  onClick={() => setMapType('map')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                    mapType === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                    mapType === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Satellite</span>
                </button>
                <button
                  onClick={() => {
                    const nextState = !showTrafficLayer;
                    setShowTrafficLayer(nextState);
                    if (onShowToast) {
                      onShowToast({
                        type: nextState ? 'success' : 'info',
                        message: nextState ? 'Global Traffic Flow Layer Enabled (TomTom)' : 'Global Traffic Layer Disabled'
                      });
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    showTrafficLayer ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Toggle Global Traffic Flow Layer"
                >
                  <TrafficCone className="w-3.5 h-3.5" />
                  <span>Traffic</span>
                  <span className={`w-2 h-2 rounded-full ${showTrafficLayer ? 'bg-emerald-950 animate-pulse' : 'bg-slate-300'}`}></span>
                </button>
              </div>

              {/* Zoom & Recenter Controls */}
              <div className="bg-white/90 backdrop-blur-md shadow-md rounded-xl border border-slate-200/80 flex flex-col divide-y divide-slate-100">
                <button
                  onClick={() => mapRef.current?.zoomIn()}
                  className="w-10 h-10 hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-blue-600 font-bold transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => mapRef.current?.zoomOut()}
                  className="w-10 h-10 hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-blue-600 font-bold transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (mapRef.current && currentUserCoords) {
                      mapRef.current.flyTo(currentUserCoords, 15, { duration: 1.2 });
                      if (onShowToast) onShowToast({ type: 'success', message: 'Recentered map on current location!' });
                    }
                  }}
                  className="w-10 h-10 hover:bg-slate-100 flex items-center justify-center text-blue-600 font-bold transition-all cursor-pointer"
                  title="Recenter Location"
                >
                  <Compass className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* COMMUNITY INCIDENT REPORTING MODAL */}
      {/* ========================================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Report Incident on Route</span>
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">Select an incident type to broadcast to all CityPulse drivers on this corridor:</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'Accident', icon: '💥', desc: 'Vehicle collision' },
                { type: 'Pothole', icon: '🕳️', desc: 'Road damage' },
                { type: 'Road Closure', icon: '🚧', desc: 'Barricade active' },
                { type: 'Waterlogging', icon: '🌊', desc: 'Precipitation flood' }
              ].map((repItem) => (
                <button
                  key={repItem.type}
                  onClick={() => handleAddCommunityReport(repItem.type)}
                  className="p-3 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <span className="text-xl block mb-1">{repItem.icon}</span>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600">{repItem.type}</div>
                  <div className="text-[10px] text-slate-500">{repItem.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-400 text-center uppercase">
              Location: {currentUserCoords[0].toFixed(4)}, {currentUserCoords[1].toFixed(4)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
