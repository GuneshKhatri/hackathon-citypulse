export const scenarioData = [
  {
    time: "10:00 AM",
    metrics: { temp: "30°C", weather: "Cloudy", aqi: "110" },
    summary: "Conditions normal across Jaipur. Monitoring light cloud cover moving towards C-Scheme.",
    incidents: [],
    impactZone: null,
    graphActiveStage: 0 // 0 = normal
  },
  {
    time: "11:30 AM",
    metrics: { temp: "28°C", weather: "Heavy Rain", aqi: "85" },
    summary: "Heavy localized rain detected. Water accumulation starting near MI Road and C-Scheme.",
    incidents: [
      { type: "Rainfall Spike", coords: [26.915, 75.800], severity: "high" }
    ],
    impactZone: { center: [26.915, 75.800], radius: 800, color: "yellow" },
    graphActiveStage: 1 // Rain icon active
  },
  {
    time: "1:00 PM",
    metrics: { temp: "26°C", weather: "Heavy Rain", aqi: "70" },
    summary: "Waterlogging reported. Traffic speeds dropping by 35% in affected commercial zones.",
    incidents: [
      { type: "Rainfall Spike", coords: [26.915, 75.800], severity: "high" },
      { type: "Drainage Issue", coords: [26.912, 75.795], severity: "critical" },
      { type: "Traffic Halt", coords: [26.918, 75.798], severity: "high" }
    ],
    impactZone: { center: [26.915, 75.798], radius: 1500, color: "orange" },
    graphActiveStage: 3 // Up to traffic drop active
  },
  {
    time: "2:30 PM",
    metrics: { temp: "25°C", weather: "Thunderstorm", aqi: "65" },
    summary: "Prediction: High risk of arterial road disruption on MI Road within 30 mins. Critical diversion needed.",
    incidents: [
      { type: "Rainfall Spike", coords: [26.915, 75.800], severity: "high" },
      { type: "Drainage Issue", coords: [26.912, 75.795], severity: "critical" },
      { type: "Traffic Halt", coords: [26.918, 75.798], severity: "high" },
      { type: "Power Outage", coords: [26.910, 75.805], severity: "critical" }
    ],
    impactZone: { center: [26.914, 75.800], radius: 2500, color: "red" },
    graphActiveStage: 4 // Alert/Prediction active
  }
];
