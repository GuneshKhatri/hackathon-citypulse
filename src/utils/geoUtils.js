/**
 * Generates 2-3 plausible incident markers within a ~2km radius of currentLocation
 * based strictly on live weather description and AQI values.
 */
export function generateDynamicIncidents(lat, lon, weatherDesc, aqiVal) {
  const incidents = [];
  const parsedAqi = parseInt(aqiVal) || 50;

  // ~1km - 2km coordinate offsets (0.01 deg ≈ 1.1 km)
  const offsetLat1 = 0.008;
  const offsetLon1 = 0.009;
  const offsetLat2 = -0.007;
  const offsetLon2 = 0.012;
  const offsetLat3 = 0.011;
  const offsetLon3 = -0.008;

  // 1. AQI-based marker
  if (parsedAqi > 100) {
    incidents.push({
      type: 'Air Quality Warning',
      coords: [lat + offsetLat1, lon + offsetLon1],
      severity: 'critical',
      details: `Elevated PM2.5 levels (US AQI ${parsedAqi}) detected.`
    });
  } else {
    incidents.push({
      type: 'Environmental Telemetry',
      coords: [lat + offsetLat1, lon + offsetLon1],
      severity: 'normal',
      details: `Good Air Quality Index (US AQI ${parsedAqi}) recorded.`
    });
  }

  // 2. Weather-based marker
  const wLower = (weatherDesc || '').toLowerCase();
  if (wLower.includes('rain') || wLower.includes('drizzle') || wLower.includes('storm')) {
    incidents.push({
      type: 'Rainfall Accumulation Alert',
      coords: [lat + offsetLat2, lon + offsetLon2],
      severity: 'high',
      details: 'Active precipitation. IoT drainage sensors monitoring underpass.'
    });
  } else {
    incidents.push({
      type: 'Municipal Weather Sensor',
      coords: [lat + offsetLat2, lon + offsetLon2],
      severity: 'normal',
      details: 'Optimal solar radiation and telemetry readings.'
    });
  }

  // 3. Traffic / Transit telemetry marker
  incidents.push({
    type: 'Traffic Corridor Telemetry',
    coords: [lat + offsetLat3, lon + offsetLon3],
    severity: wLower.includes('rain') ? 'high' : 'normal',
    details: wLower.includes('rain') ? 'Traffic speed reduced due to wet road conditions.' : 'Normal arterial traffic speeds recorded.'
  });

  return incidents;
}

/**
 * Unified Geocoding Utility using Photon API (Komoot - built on Elasticsearch)
 * Automatically handles typos, spelling mistakes, and fuzzy matching.
 */
export async function geocodeAddress(query) {
  if (!query || !query.trim()) return [];
  const cleanQuery = query.trim();

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=5`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!res.ok) {
      console.warn(`Photon API returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data && data.features && data.features.length > 0) {
      return data.features.map((feature) => {
        const coords = feature.geometry?.coordinates || [0, 0];
        const props = feature.properties || {};

        // Extract primary name & location properties
        const primaryName = props.name || props.street || props.city || props.district || cleanQuery;

        // Combine city, state, country into professional context string
        const contextParts = [];
        if (props.city && props.city.toLowerCase() !== primaryName.toLowerCase()) {
          contextParts.push(props.city);
        }
        if (props.state && props.state.toLowerCase() !== primaryName.toLowerCase() && (!props.city || props.state.toLowerCase() !== props.city.toLowerCase())) {
          contextParts.push(props.state);
        }
        if (props.country && props.country.toLowerCase() !== primaryName.toLowerCase()) {
          contextParts.push(props.country);
        }

        const contextString = contextParts.join(', ');
        const fullName = contextString ? `${primaryName}, ${contextString}` : primaryName;

        // Detect if fuzzy typo auto-correction was applied by Photon
        const normQuery = cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normName = primaryName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isTypoCorrected = normQuery.length >= 3 && !normName.includes(normQuery) && !normQuery.includes(normName);

        return {
          name: fullName,
          shortName: primaryName,
          context: contextString,
          lat: parseFloat(coords[1]),
          lon: parseFloat(coords[0]),
          boundingbox: props.extent ? [props.extent[1], props.extent[3], props.extent[0], props.extent[2]] : null,
          isTypoCorrected: isTypoCorrected,
          originalQuery: cleanQuery
        };
      });
    }
    return [];
  } catch (err) {
    console.error('Photon geocoding search failed:', err);
    return [];
  }
}

/**
 * Real-time OSRM & Photon Routing Helper for Chatbot Function Calling
 */
export const getRealRouteTime = async (destinationName, currentLocation) => {
  if (!destinationName || !destinationName.trim()) return "Please specify a destination name.";
  try {
    const cleanDest = destinationName.trim();
    // 1. Geocode destination via Photon API
    const geoData = await geocodeAddress(cleanDest);
    if (!geoData || !geoData.length) return `Location "${cleanDest}" not found.`;
    const dest = geoData[0];
    const destNameShort = dest.shortName || cleanDest;

    // 2. Fallback to default origin if currentLocation is missing (e.g., Jaipur center)
    const origin = currentLocation && currentLocation.lat && currentLocation.lon 
      ? currentLocation 
      : { lat: 26.9124, lon: 75.7873 };

    // 3. Get OSRM Route
    const routeRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false`
    );
    const routeData = await routeRes.json();
    
    if (!routeData || routeData.code !== 'Ok' || !routeData.routes || !routeData.routes.length) {
      return `Routing to ${destNameShort} failed.`;
    }
    
    const durationMins = Math.round(routeData.routes[0].duration / 60);
    const distanceKm = (routeData.routes[0].distance / 1000).toFixed(1);
    
    return `Success: ${destNameShort} is ${distanceKm} km away. It will take approximately ${durationMins} minutes by car.`;
  } catch (error) {
    console.error('getRealRouteTime error:', error);
    return "Error calculating route duration.";
  }
};


/**
 * Strict 3-Level AQI Color System:
 * 🟢 GREEN (0–100) - Good
 * 🟡 YELLOW (101–200) - Moderate
 * 🔴 RED (201+) - Extreme
 */
export function getAQIColor(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 100) return '#10b981'; // GREEN (emerald-500)
  if (val <= 200) return '#f59e0b'; // YELLOW (amber-500)
  return '#ef4444'; // RED (red-500)
}

export function getAQICategory(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 100) return 'GOOD';
  if (val <= 200) return 'MODERATE';
  return 'EXTREME';
}

export function getAQITheme(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 100) {
    return {
      aqi: val,
      color: '#10b981',
      category: 'GOOD',
      emoji: '🟢',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/90',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      indicatorColor: 'bg-emerald-600',
      fillColor: '#10b981'
    };
  }
  if (val <= 200) {
    return {
      aqi: val,
      color: '#f59e0b',
      category: 'MODERATE',
      emoji: '🟡',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/90',
      borderColor: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      indicatorColor: 'bg-amber-600',
      fillColor: '#f59e0b'
    };
  }
  return {
    aqi: val,
    color: '#ef4444',
    category: 'EXTREME',
    emoji: '🔴',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50/90',
    borderColor: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    indicatorColor: 'bg-rose-600',
    fillColor: '#ef4444'
  };
}

export const PRESET_JAIPUR_AREAS = {
  'vaishali nagar': {
    name: 'Vaishali Nagar',
    center: [26.9067, 75.7441],
    defaultAqi: 149, // Moderate
    polygon: [
      [26.9180, 75.7330],
      [26.9200, 75.7520],
      [26.8970, 75.7580],
      [26.8940, 75.7380]
    ]
  },
  'malviya nagar': {
    name: 'Malviya Nagar',
    center: [26.8526, 75.8152],
    defaultAqi: 75, // Good
    polygon: [
      [26.8640, 75.8020],
      [26.8660, 75.8280],
      [26.8410, 75.8300],
      [26.8390, 75.8050]
    ]
  },
  'c-scheme': {
    name: 'C-Scheme',
    center: [26.9083, 75.8031],
    defaultAqi: 230, // Extreme
    polygon: [
      [26.9160, 75.7940],
      [26.9170, 75.8110],
      [26.9000, 75.8130],
      [26.8990, 75.7960]
    ]
  },
  'mansarovar': {
    name: 'Mansarovar',
    center: [26.8510, 75.7600],
    defaultAqi: 92, // Good
    polygon: [
      [26.8650, 75.7450],
      [26.8670, 75.7750],
      [26.8370, 75.7780],
      [26.8350, 75.7480]
    ]
  }
};

export function getAreaBoundary(name, lat, lon, boundingbox) {
  const cleanName = (name || '').toLowerCase();
  for (const key in PRESET_JAIPUR_AREAS) {
    if (cleanName.includes(key)) {
      return {
        polygon: PRESET_JAIPUR_AREAS[key].polygon,
        center: PRESET_JAIPUR_AREAS[key].center,
        isApproximate: false,
        presetName: PRESET_JAIPUR_AREAS[key].name,
        presetAqi: PRESET_JAIPUR_AREAS[key].defaultAqi
      };
    }
  }

  // Fallback 1: Bounding Box from Nominatim [south, north, west, east]
  if (boundingbox && boundingbox.length === 4) {
    const s = parseFloat(boundingbox[0]);
    const n = parseFloat(boundingbox[1]);
    const w = parseFloat(boundingbox[2]);
    const e = parseFloat(boundingbox[3]);
    return {
      polygon: [
        [n, w],
        [n, e],
        [s, e],
        [s, w]
      ],
      center: [lat, lon],
      isApproximate: true
    };
  }

  // Fallback 2: Computed Hexagon around Lat / Lon
  const rLat = 0.012;
  const rLon = 0.014;
  return {
    polygon: [
      [lat + rLat, lon],
      [lat + rLat * 0.5, lon + rLon],
      [lat - rLat * 0.5, lon + rLon],
      [lat - rLat, lon],
      [lat - rLat * 0.5, lon - rLon],
      [lat + rLat * 0.5, lon - rLon]
    ],
    center: [lat, lon],
    isApproximate: true
  };
}

/**
 * CityPulse Anomaly Detection Engine Simulator
 */
export function generateCityAnomalies(cityName = 'Jaipur', centerLat = 26.9124, centerLon = 75.7873) {
  const lat = centerLat || 26.9124;
  const lon = centerLon || 75.7873;

  return [
    {
      id: 'anom-1',
      title: 'Major Arterial Gridlock & Acoustic Spike',
      locationName: `Vaishali Nagar Main Junction (${cityName})`,
      location: [lat + 0.005, lon - 0.008],
      category: 'Traffic',
      severity: 'Critical',
      impactScore: 92,
      currentValue: '12 km/h avg speed',
      baselineValue: '44 km/h avg speed',
      deviation: '-72% speed reduction',
      isMultiSignal: true,
      multiSignalTriggers: [
        'Traffic Congestion ↑ 82%',
        'Acoustic Telemetry ↑ 43%',
        'Arterial Speed ↓ 72%'
      ],
      confidence: 94,
      predictionRisk: 88,
      startTime: '12 mins ago',
      sparklineData: [22, 24, 25, 23, 26, 78, 89, 94],
      explanation: {
        whatChanged: 'Sudden bottleneck detected across 4 lanes with elevated acoustic pressure.',
        normalVsCurrent: 'Baseline flow is 44 km/h (55 dB); current flow is 12 km/h (88 dB acoustic levels).',
        possibleCause: 'Stalled heavy transport vehicle coinciding with signal timing desynchronization.'
      },
      recommendedActions: [
        '🚦 Adjust traffic signal timing',
        '👮 Deploy traffic personnel',
        '📢 Notify commuters via broadcast'
      ]
    },
    {
      id: 'anom-2',
      title: 'Localized Particulate & Ozone Anomaly',
      locationName: `C-Scheme Industrial Corridor (${cityName})`,
      location: [lat - 0.004, lon + 0.006],
      category: 'Air Quality',
      severity: 'High',
      impactScore: 78,
      currentValue: '238 US AQI',
      baselineValue: '62 US AQI',
      deviation: '+283% particulate spike',
      isMultiSignal: true,
      multiSignalTriggers: [
        'PM2.5 Sensor ↑ 165%',
        'Ozone (O3) Sensor ↑ 45%',
        'Wind Speed ↓ 60%'
      ],
      confidence: 89,
      predictionRisk: 74,
      startTime: '24 mins ago',
      sparklineData: [55, 58, 60, 62, 110, 180, 220, 238],
      explanation: {
        whatChanged: 'Rapid PM2.5 & PM10 accumulation detected by 3 independent transducer nodes.',
        normalVsCurrent: 'Standard AQI is 62 (Good); current readings hit 238 (Extreme).',
        possibleCause: 'Thermal inversion layer combined with localized commercial diesel exhaust.'
      },
      recommendedActions: [
        '💨 Activate misting cannons',
        '🚚 Restrict heavy vehicle entry',
        '😷 Issue public health advisory'
      ]
    },
    {
      id: 'anom-3',
      title: 'Underpass Hydro-Pressure Anomaly',
      locationName: `Malviya Nagar Sector 4 Underpass (${cityName})`,
      location: [lat - 0.012, lon + 0.015],
      category: 'Water',
      severity: 'Warning',
      impactScore: 64,
      currentValue: '42 cm water accumulation',
      baselineValue: '0 cm dry baseline',
      deviation: '+42 cm accumulation',
      isMultiSignal: false,
      confidence: 85,
      predictionRisk: 58,
      startTime: '35 mins ago',
      sparklineData: [0, 0, 2, 5, 12, 24, 35, 42],
      explanation: {
        whatChanged: 'Water level sensor activated at sub-surface underpass drain node.',
        normalVsCurrent: 'Normal state is dry (0 cm); current sensor detects 42 cm accumulated water.',
        possibleCause: 'Localized storm drain blockage coinciding with recent precipitation outflow.'
      },
      recommendedActions: [
        '🌊 Trigger automated sump pumps',
        '🚧 Close underpass lane',
        '🛠️ Dispatch municipal drainage crew'
      ]
    },
    {
      id: 'anom-4',
      title: 'Crowd Density & Acoustic Pattern Shift',
      locationName: `Central Bus Terminal & Market Corridor (${cityName})`,
      location: [lat + 0.008, lon + 0.002],
      category: 'Public Safety',
      severity: 'Warning',
      impactScore: 56,
      currentValue: '88 People / 100m²',
      baselineValue: '32 People / 100m²',
      deviation: '+175% density shift',
      isMultiSignal: true,
      multiSignalTriggers: [
        'Optical Pedestrian Count ↑ 175%',
        'Ambient Audio Sensor ↑ 38%'
      ],
      confidence: 82,
      predictionRisk: 46,
      startTime: '48 mins ago',
      sparklineData: [30, 32, 35, 34, 52, 68, 80, 88],
      explanation: {
        whatChanged: 'High pedestrian density surge detected across public plaza.',
        normalVsCurrent: 'Average density is 32 people/100m²; current density reaches 88 people/100m².',
        possibleCause: 'Transit vehicle delay resulting in temporary platform overcrowding.'
      },
      recommendedActions: [
        '🚌 Dispatch backup transit buses',
        '📢 Sound crowd management alerts',
        '🛡️ Monitor live camera feed'
      ]
    },
    {
      id: 'anom-5',
      title: 'Acoustic Decibel Threshold Exceeded',
      locationName: `Raja Park Arterial Commercial Zone (${cityName})`,
      location: [lat - 0.002, lon + 0.010],
      category: 'Noise',
      severity: 'Warning',
      impactScore: 48,
      currentValue: '91.4 dB decibel peak',
      baselineValue: '58.0 dB baseline',
      deviation: '+57% decibel elevation',
      isMultiSignal: false,
      confidence: 91,
      predictionRisk: 35,
      startTime: '1 hr ago',
      sparklineData: [55, 56, 58, 57, 72, 85, 90, 91],
      explanation: {
        whatChanged: 'Continuous high decibel audio telemetry logged over 15-minute window.',
        normalVsCurrent: 'Daytime commercial threshold is 58 dB; telemetry reads 91.4 dB.',
        possibleCause: 'Commercial generator activity coinciding with heavy horn usage.'
      },
      recommendedActions: [
        '🔊 Issue decibel compliance notice',
        '👮 Dispatch noise enforcement team'
      ]
    }
  ];
}

/**
 * Dynamic Rule-Based Predictive Disruption Spread Engine (Works for ANY searched location)
 */
export function getPredictiveDisruptionSpread(cityName = 'Jaipur', currentLocation = null, selectedArea = null) {
  let epicenterLat = null;
  let epicenterLon = null;
  let epicenterName = cityName || 'Selected Location';

  if (selectedArea && typeof selectedArea.lat === 'number' && typeof selectedArea.lon === 'number') {
    epicenterLat = selectedArea.lat;
    epicenterLon = selectedArea.lon;
    epicenterName = selectedArea.name || cityName || 'Selected Location';
  } else if (currentLocation && typeof currentLocation.lat === 'number' && typeof currentLocation.lon === 'number') {
    epicenterLat = currentLocation.lat;
    epicenterLon = currentLocation.lon;
    epicenterName = cityName || 'Selected Location';
  }

  // Graceful degradation fallback if no valid coordinates exist
  if (epicenterLat === null || epicenterLon === null || isNaN(epicenterLat) || isNaN(epicenterLon)) {
    return {
      available: false,
      message: 'Predictive spread unavailable: Insufficient live civic data for reliable prediction.'
    };
  }

  const cleanName = epicenterName.toLowerCase();
  const isJaipurDemo = cleanName.includes('jaipur') || cleanName.includes('vaishali');

  const node1Name = isJaipurDemo ? 'Sodala Arterial Junction' : `${epicenterName} East Corridor`;
  const node2Name = isJaipurDemo ? 'Shyam Nagar Grid' : `${epicenterName} South Sector`;
  const node3Name = isJaipurDemo ? 'Civil Lines Transit Corridor' : `${epicenterName} West Bypass`;

  return {
    available: true,
    disruptionCenter: {
      id: 'origin-epicenter',
      name: epicenterName,
      lat: epicenterLat,
      lon: epicenterLon,
      severity: 'Critical Disruption',
      currentImpact: 'Waterlogging + Heavy Traffic',
      deviation: '+280% delay elevation',
      status: 'CONFIRMED INCIDENT',
      color: '#ef4444'
    },
    whyThisPattern: 'Rainfall + current traffic + geographic connectivity',
    nodes: [
      {
        id: 'node-high',
        name: node1Name,
        lat: epicenterLat + 0.015,
        lon: epicenterLon + 0.010,
        distance: '2.1 km',
        spreadLevel: 'HIGH',
        riskLevel: 'High Potential Impact',
        predictedEffect: 'Traffic buildup',
        detailedEffect: 'May experience severe traffic buildup and signal queue overflow',
        basis: 'Road connectivity + current congestion',
        color: '#f97316',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        confidence: 88,
        estimatedTimeframe: 'In 15–25 mins'
      },
      {
        id: 'node-medium',
        name: node2Name,
        lat: epicenterLat - 0.012,
        lon: epicenterLon - 0.008,
        distance: '1.8 km',
        spreadLevel: 'MEDIUM',
        riskLevel: 'Medium Potential Impact',
        predictedEffect: 'Moderate congestion',
        detailedEffect: 'May experience moderate congestion and localized street delays',
        basis: 'Road connectivity + current congestion',
        color: '#eab308',
        badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
        confidence: 74,
        estimatedTimeframe: 'In 30–45 mins'
      },
      {
        id: 'node-low',
        name: node3Name,
        lat: epicenterLat + 0.005,
        lon: epicenterLon - 0.015,
        distance: '2.4 km',
        spreadLevel: 'LOW',
        riskLevel: 'Low Potential Impact',
        predictedEffect: 'Possible transit delay',
        detailedEffect: 'May experience possible transit route delays',
        basis: 'Road connectivity + current congestion',
        color: '#eab308',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
        confidence: 58,
        estimatedTimeframe: 'In 45–60 mins'
      }
    ]
  };
}

/**
 * Dynamic Impact Zone Data Simulator
 * Generates concentric impact zone metrics, time-series expansion radii,
 * affected infrastructure locations, and cascading failure events.
 */
export function generateImpactZone(locationName = 'Vaishali Nagar', centerLat = 26.9067, centerLon = 75.7441, severity = 'Critical') {
  const lat = parseFloat(centerLat) || 26.9067;
  const lon = parseFloat(centerLon) || 75.7441;
  const isCrit = severity === 'Critical';

  const impactScore = isCrit ? 88 : severity === 'High' ? 74 : 58;
  const affectedPeople = isCrit ? 14200 : severity === 'High' ? 8400 : 4100;

  return {
    locationName: locationName || 'Impact Zone Center',
    center: [lat, lon],
    impactScore: impactScore,
    severity: severity,
    affectedPeople: affectedPeople,
    timeSteps: ['Now (0m)', '15m', '30m', '1h', '2h'],
    timeSeriesRadii: [300, 650, 1100, 1800, 2600], // Radii in meters
    
    // Affected Infrastructure Nodes around epicenter
    infrastructure: [
      {
        id: 'infra-hospital',
        name: 'SMS Sector Medical Center',
        type: 'hospital',
        category: 'emergency',
        icon: '🚑',
        symbol: '🏥',
        lat: lat + 0.008,
        lon: lon + 0.006,
        distance: '0.8 km',
        status: 'Emergency Corridor Delay Risk',
        color: '#ef4444'
      },
      {
        id: 'infra-fire',
        name: 'District Central Fire Station',
        type: 'fire_station',
        category: 'emergency',
        icon: '🚒',
        symbol: '🚒',
        lat: lat - 0.005,
        lon: lon + 0.009,
        distance: '0.7 km',
        status: 'Response Route Standby',
        color: '#f97316'
      },
      {
        id: 'infra-subway',
        name: 'Vaishali Metro Transit Depot',
        type: 'subway',
        category: 'infrastructure',
        icon: '🚇',
        symbol: '🚇',
        lat: lat + 0.006,
        lon: lon - 0.007,
        distance: '0.9 km',
        status: 'Feeder Bus Reroute Active',
        color: '#3b82f6'
      },
      {
        id: 'infra-power',
        name: 'Substation 132kV Relay Hub',
        type: 'power_relay',
        category: 'infrastructure',
        icon: '⚡',
        symbol: '⚡',
        lat: lat - 0.009,
        lon: lon - 0.004,
        distance: '1.1 km',
        status: 'Sub-surface Hydro Isolation',
        color: '#eab308'
      }
    ],

    // Population Density Overlay Points
    peopleNodes: [
      { id: 'pop-1', name: 'Commercial High-Density Zone', lat: lat + 0.003, lon: lon + 0.004, density: '120 ppl/100m²' },
      { id: 'pop-2', name: 'Arterial Transit Plaza', lat: lat - 0.004, lon: lon - 0.003, density: '95 ppl/100m²' },
      { id: 'pop-3', name: 'Residential Sector Grid', lat: lat + 0.007, lon: lon - 0.005, density: '60 ppl/100m²' }
    ],

    // Road Network Bottleneck Corridors
    roadCorridors: [
      {
        id: 'road-1',
        name: 'Kings Road Main Arterial',
        category: 'roads',
        points: [[lat, lon], [lat + 0.004, lon + 0.005], [lat + 0.008, lon + 0.006]],
        status: 'Heavy Gridlock',
        color: '#ef4444'
      },
      {
        id: 'road-2',
        name: 'Sector 4 Bypass Link',
        category: 'roads',
        points: [[lat, lon], [lat - 0.003, lon - 0.004], [lat - 0.005, lon + 0.009]],
        status: 'Moderate Congestion',
        color: '#f59e0b'
      }
    ],

    // Cascading Failure Events Chain Reaction for What-If Simulation
    cascadingEvents: [
      {
        step: 1,
        title: 'Epicenter Bottleneck',
        description: 'Water accumulation & sudden arterial speed reduction (-72%).',
        coords: [lat, lon],
        type: 'epicenter',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300'
      },
      {
        step: 2,
        title: 'Arterial Spillover',
        description: 'Traffic overflow spills into Kings Road bypass link.',
        coords: [lat + 0.004, lon + 0.005],
        type: 'road',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      {
        step: 3,
        title: 'Emergency Delay Risk',
        description: 'Potential 8-min response delay to SMS Medical Hub.',
        coords: [lat + 0.008, lon + 0.006],
        type: 'hospital',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300'
      },
      {
        step: 4,
        title: 'Substation Mitigation',
        description: 'Automated sump pumps activated at 132kV Substation.',
        coords: [lat - 0.009, lon - 0.004],
        type: 'power_relay',
        badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300'
      }
    ]
  };
}






