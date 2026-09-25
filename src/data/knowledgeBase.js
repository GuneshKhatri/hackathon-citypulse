/**
 * CityPulse Jaipur - Central Site Knowledge Base
 * 
 * TO UPDATE/REFRESH KNOWLEDGE:
 * Simply edit the text contents or add new key-value sections in this file whenever 
 * new pages, features, services, contact details, or policies are added to the site.
 */

export const SITE_KNOWLEDGE_BASE = {
  siteName: "CityPulse Jaipur",
  version: "1.0.0",
  tagline: "Live Predictive Civic Intelligence Platform for Jaipur Smart City",

  overview: `
CityPulse Jaipur is a live predictive civic intelligence platform built for Jaipur Municipal Corporation.
It synthesizes real-time IoT sensors, drainage transducers, weather forecasts (Open-Meteo), air quality (US AQI telemetry), 
and road speed sensors into a digital twin of Jaipur. It predicts arterial road disruptions up to 30 minutes in advance, 
enables dynamic Impact Zone Analysis, OSRM turn-by-turn navigation, citizen incident reporting, and civic analytics.
`,

  pages: [
    {
      name: "Home (Civic Intelligence Hub)",
      path: "/",
      description: "Interactive Leaflet map showing real-time civic telemetry, preset Jaipur areas, AQI polygons, sensor anomalies, Impact Zone analysis, and Predictive Disruption Spread."
    },
    {
      name: "Navigate",
      path: "/navigate",
      description: "Turn-by-Turn OSRM navigation system with real-time incident avoidance, speed trap warnings, emergency rerouting, and live GPS speed tracking."
    },
    {
      name: "Insights",
      path: "/insights",
      description: "City analytics dashboard displaying 24-hour AQI & traffic congestion trends, IoT sensor health (99.8% uptime), and municipal telemetry."
    },
    {
      name: "Reports",
      path: "/reports",
      description: "Citizen telemetry portal for filing civic issue reports (waterlogging, drainage blockage, traffic disruptions, power outages, potholes) directly to Jaipur Ward Command."
    },
    {
      name: "Community",
      path: "/community",
      description: "Civic forum for citizen upvoting, community initiatives, local news updates, and volunteering."
    },
    {
      name: "About",
      path: "/about",
      description: "Overview of CityPulse Jaipur architecture, IoT transducer networks, AI graph predictions, and Municipal Corporation mission."
    }
  ],

  keyFeatures: {
    impactZone: "Directly accessible via the Target/Radar icon on the left icon dock. Calculates 0-100 Impact Score, shows 3 concentric heatmaps (Red core, Orange middle, Yellow outer), interactive time slider (Now, 15m, 30m, 1h, 2h), infrastructure markers (hospitals, fire stations), and What-If simulation.",
    predictiveSpread: "Rule-based disruption spread model predicting cascading urban impacts from Vaishali Nagar to Sodala, Shyam Nagar, and Civil Lines up to 30 minutes in advance.",
    favoriteLocations: "Right-click anywhere on the Leaflet map to open context menu and save coordinates. Access saved places anytime by clicking the ⭐ Star icon next to the top-right search bar.",
    locationSearch: "Fuzzy matching location search powered by Elasticsearch / Photon API (handles typos and spelling mistakes automatically).",
    navigation: "OSRM routing with live incident avoidance, turn-by-turn directions, step list, and exit navigation options."
  },

  reportingCategories: [
    "Waterlogging",
    "Drainage Blockage",
    "Traffic Disruption",
    "Power Outage",
    "Pothole / Road Hazard"
  ],

  contactAndSupport: {
    organization: "Jaipur Municipal Corporation & CityPulse Ward Command",
    dispatchNotice: "Reports filed via the Reports page are immediately dispatched to Ward Command.",
    emailSupport: "support@citypulse-jaipur.gov.in",
    helpline: "+91 (141) 274-0000 (Jaipur Municipal Helpline)",
    address: "Jaipur Municipal Corporation Headquarters, Pandit Deendayal Upadhyay Bhawan, Lal Kothi, Jaipur, Rajasthan 302015"
  },

  policies: {
    privacy: "Telemetry data is anonymized. Location data is used strictly for localized civic intelligence and routing.",
    terms: "CityPulse Jaipur provides real-time civic predictive insights for public safety and urban mobility."
  }
};

/**
 * Returns formatted plaintext string of knowledge base for system prompt injection
 */
export function getKnowledgeBaseText() {
  return `
SITE NAME: ${SITE_KNOWLEDGE_BASE.siteName}
TAGLINE: ${SITE_KNOWLEDGE_BASE.tagline}

OVERVIEW:
${SITE_KNOWLEDGE_BASE.overview.trim()}

PAGES & NAVIGATION:
${SITE_KNOWLEDGE_BASE.pages.map(p => `- ${p.name} (${p.path}): ${p.description}`).join('\n')}

KEY FEATURES:
- Impact Zone Analysis: ${SITE_KNOWLEDGE_BASE.keyFeatures.impactZone}
- Predictive Disruption Spread: ${SITE_KNOWLEDGE_BASE.keyFeatures.predictiveSpread}
- Favorite Locations: ${SITE_KNOWLEDGE_BASE.keyFeatures.favoriteLocations}
- Location Search: ${SITE_KNOWLEDGE_BASE.keyFeatures.locationSearch}
- Navigation Engine: ${SITE_KNOWLEDGE_BASE.keyFeatures.navigation}

REPORTING CATEGORIES:
${SITE_KNOWLEDGE_BASE.reportingCategories.map(c => `- ${c}`).join('\n')}

CONTACT & MUNICIPAL SUPPORT:
- Organization: ${SITE_KNOWLEDGE_BASE.contactAndSupport.organization}
- Address: ${SITE_KNOWLEDGE_BASE.contactAndSupport.address}
- Helpline: ${SITE_KNOWLEDGE_BASE.contactAndSupport.helpline}
- Email: ${SITE_KNOWLEDGE_BASE.contactAndSupport.emailSupport}
- Dispatch: ${SITE_KNOWLEDGE_BASE.contactAndSupport.dispatchNotice}
`;
}
