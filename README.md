# 🏙️⚡ CityPulse — Live Civic Intelligence for a Smarter Jaipur

**[🚀 VIEW THE LIVE DEMO HERE](https://citypulse-black.vercel.app/)**

![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
![React](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-8E75B2?logo=google&logoColor=white)

> **CityPulse doesn't just monitor the city. It secures it.**  
> A premium, highly interactive smart-city dashboard that moves beyond simple data display into active civic intelligence, AI-driven prediction, and autonomous mitigation.

---

## 🚨 The Problem: Cities Drowning in Data
Modern cities face a critical bottleneck[span_0](start_span)[span_0](end_span):
* **Data Overload:** Cities generate millions of data points every second with no unified way to make sense of them[span_1](start_span)[span_1](end_span).
* **No Actionable Intelligence:** City officials and citizens alike lack a single platform that turns raw data into decisions[span_2](start_span)[span_2](end_span).
* **Only the Present, Never the Future:** Current systems only show what is happening now — not what is coming next[span_3](start_span)[span_3](end_span).
* **Cascading Crises Go Uncoordinated:** When one system fails, there is no mechanism to anticipate or contain the ripple effects across the city[span_4](start_span)[span_4](end_span).

## ✨ The Solution: CityPulse
**CityPulse** bridges this gap. Built specifically for the complexity and scale of Jaipur, CityPulse is a premium, highly interactive smart-city platform that moves far beyond simple data display into active civic intelligence[span_5](start_span)[span_5](end_span). By combining real-time spatial telemetry with AI, it shifts urban management from reactive to proactive—ensuring citizens, operators, and officials are all served by a single living command center[span_6](start_span)[span_6](end_span).

---

## 🚀 Show-Stopping Features

### 🔮 Predictive Disruption Spread
Instead of just showing current problems, CityPulse predicts the future[span_7](start_span)[span_7](end_span). Using a transparent, geospatial scoring engine, the system analyzes an active incident (e.g., severe waterlogging) and dynamically projects cascading impacts (traffic buildup, transit delays) to nearby corridors and identifies at-risk zones before they become crises[span_8](start_span)[span_8](end_span).

### ⚡ Autonomous Mitigation Engine (Project Sentinel)
A fully animated "God Mode" command sequence that acts without waiting for human intervention[span_9](start_span)[span_9](end_span). When a critical anomaly is detected, AI takes over:
* Slides in a dark-mode command terminal logging autonomous actions.
* Dispatches simulated emergency units and drones across the map to the epicenter[span_10](start_span)[span_10](end_span).
* Resolves the anomaly, turning red impact zones back to a stable green baseline[span_11](start_span)[span_11](end_span).

### 🧠 Context-Aware AI (Google Gemini 1.5 Flash)
An embedded chatbot that doesn't just give generic answers—it reads the live dashboard. It knows the user's searched coordinates, current AQI, active anomalies, and UI layout, guiding citizens through the interface and explaining complex civic data on the fly.

### 🎯 Dynamic Impact Zones
A time-based spatial engine lets operators and citizens visualize how an incident's severity grows over time before it happens[span_12](start_span)[span_12](end_span). Users can interact with a time slider (Now → 15m → 1h) to watch concentric impact radii expand across the map, identifying vulnerable infrastructure like hospitals and schools caught in the zone[span_13](start_span)[span_13](end_span).

### 💎 Ultra-Premium Glassmorphic UI
Built for absolute visual dominance. Features refractive blur panels, cinematic typography, 1px ambient borders, dynamic layout shifting, and a map vignette that seamlessly blends the UI into the geospatial data.

---

## 🏗️ System Architecture 

Based on our implementation model, CityPulse operates on a robust modern stack:

* **Frontend Client:** Built with React and Vite for blazing-fast UI, styled with Tailwind CSS[span_14](start_span)[span_14](end_span).
* **Map Rendering:** Powered by MapLibre GL JS / Leaflet, utilizing OpenStreetMap base map tiles and custom GeoJSON vector layers[span_15](start_span)[span_15](end_span).
* **Backend API (Production):** A Python-based FastAPI architecture providing a high-performance, asynchronous API layer for all civic data processing[span_16](start_span)[span_16](end_span).
* **External Data Ingestion:**
  * **Open-Meteo API:** Real-time weather, rainfall, and Air Quality (AQI, PM2.5, PM10) telemetry[span_17](start_span)[span_17](end_span).
  * **Nominatim / OpenStreetMap:** Live, open civic data for geocoding, place search, and road network boundaries[span_18](start_span)[span_18](end_span).
  * **Browser Geolocation:** Permission-based user tracking for proximity alerts.
* **Synthetic Demo Data (Jaipur):** Utilizes structured JSON/GeoJSON for simulating traffic, incident waterlogging, and transit delays for hackathon demonstrations.

---

## 💻 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | React.js, Vite |
| **Styling & UI** | Tailwind CSS (Glassmorphism), Lucide Icons |
| **Geospatial & Maps** | Leaflet, React-Leaflet, MapLibre GL JS |
| **AI / LLM** | Google Gemini 1.5 Flash API |
| **Backend & APIs** | FastAPI, Python 3.11 |
| **Geocoding** | Photon (Komoot) / Nominatim |
| **Deployment** | Vercel (Frontend Global CDN) |

---

## 👥 Meet the Team

| Team Member | Contribution |
| :--- | :--- |
| **Somya** | Idea generation, feature planning, and full-stack implementation — the engineering core driving CityPulse from concept to live demo[span_19](start_span)[span_19](end_span). |
| **Gunesh** | Idea generation, feature planning, and full-stack implementation — the engineering core driving CityPulse from concept to live demo[span_20](start_span)[span_20](end_span). |
| **Chirag** | Idea generation, feature planning, and full-stack implementation — the engineering core driving CityPulse from concept to live demo[span_21](start_span)[span_21](end_span). |
| **Anjali** | UI/UX and visual design — crafting the premium, intuitive interface that makes complex civic data feel effortless to navigate[span_22](start_span)[span_22](end_span). |

---

## 🛠️ Run it Locally

1. **Clone the repository**
   ```bash
   git clone [https://github.com/GuneshKhatri/hackathon-citypulse.git](https://github.com/GuneshKhatri/hackathon-citypulse.git)
   cd hackathon-citypulse
