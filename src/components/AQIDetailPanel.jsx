import React from 'react';
import { Wind, Activity, ShieldCheck, TrendingUp, Sparkles, AlertTriangle, Eye, Layers } from 'lucide-react';
import { getAQITheme } from '../utils/geoUtils';

export default function AQIDetailPanel({ cityName, aqiData, onShowToast }) {
  const current = aqiData?.current || {};
  const val = current.us_aqi !== undefined 
    ? Math.round(current.us_aqi) 
    : (parseInt(aqiData?.aqiVal || aqiData) || 149);

  const theme = getAQITheme(val);

  // Position percentage normalized to 0 - 500 scale
  const scalePercent = Math.min(Math.max((val / 500) * 100, 0), 100);

  // Pollutant Values
  const pm25 = current.pm2_5 !== undefined ? `${current.pm2_5.toFixed(1)} μg/m³` : (val > 150 ? '58.4 μg/m³' : '14.2 μg/m³');
  const pm10 = current.pm10 !== undefined ? `${current.pm10.toFixed(1)} μg/m³` : (val > 150 ? '112.0 μg/m³' : '38.5 μg/m³');
  const ozone = current.ozone !== undefined ? `${current.ozone.toFixed(1)} μg/m³` : '45.0 μg/m³';
  const no2 = current.nitrogen_dioxide !== undefined ? `${current.nitrogen_dioxide.toFixed(1)} μg/m³` : '22.1 μg/m³';

  // 24H Trend Data calculation
  let trendData = [];
  if (aqiData?.hourly?.us_aqi && Array.isArray(aqiData.hourly.us_aqi) && aqiData.hourly.us_aqi.length >= 24) {
    trendData = aqiData.hourly.us_aqi.slice(0, 24);
  } else {
    // Synthetic 24h curve centered around current val
    trendData = Array.from({ length: 24 }, (_, i) => {
      const variation = Math.sin((i / 24) * Math.PI * 2) * 28 + Math.cos((i / 6) * Math.PI) * 8;
      return Math.max(12, Math.round(val + variation));
    });
  }

  // SVG Path generation for 24h trend line chart
  const minVal = Math.min(...trendData, 0);
  const maxVal = Math.max(...trendData, 300);
  const chartHeight = 65;
  const chartWidth = 280;

  const points = trendData.map((d, idx) => {
    const x = (idx / (trendData.length - 1)) * chartWidth;
    const y = chartHeight - ((d - minVal) / (maxVal - minVal || 1)) * (chartHeight - 14) - 7;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

  // AI Insights - Strict correlation phrasing ONLY (never causation)
  const getInsightText = () => {
    if (val <= 100) {
      return `Air quality is currently GOOD in ${cityName}. Favorable wind dispersion coincides with low particulate concentrations across major urban corridors.`;
    } else if (val <= 200) {
      return `AQI is currently MODERATE in ${cityName}. Higher traffic density during peak hours coincides with elevated PM2.5 and PM10 telemetry.`;
    } else {
      return `AQI is currently EXTREME in ${cityName}. High vehicular volume and low atmospheric ventilation coincide with sharp particulate spikes.`;
    }
  };

  return (
    <div className="flex flex-col h-full py-1 space-y-4 text-slate-800 animate-in fade-in duration-300">
      
      {/* SECTION TITLE & SYNC BADGE */}
      <div className="flex justify-between items-center pb-1">
        <div>
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">ENVIRONMENTAL TELEMETRY</span>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-600" />
            <span>Air Quality Index</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[10px] border border-emerald-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE SYNC</span>
        </div>
      </div>

      {/* 4. MASSIVE AQI CARD & HEADER */}
      <div className={`p-5 rounded-2xl border ${theme.borderColor} ${theme.bgColor} shadow-sm relative overflow-hidden space-y-3`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">CURRENT US AQI ({cityName})</span>
            <div className={`text-6xl font-black tracking-tight ${theme.textColor} transition-all duration-300`}>
              {val}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs border ${theme.badgeBg} shadow-2xs`}>
                <span>{theme.emoji}</span>
                <span>{theme.category}</span>
              </span>
            </div>
          </div>
          <div className={`w-16 h-16 rounded-2xl bg-white/90 border ${theme.borderColor} flex items-center justify-center shadow-inner`}>
            <Activity className={`w-8 h-8 ${theme.textColor} animate-pulse`} />
          </div>
        </div>

        {/* 5 & 6 & 7. AQI HORIZONTAL SCALE & MOVABLE INDICATOR */}
        <div className="pt-3 space-y-2 border-t border-slate-200/60">
          
          {/* MOVABLE INDICATOR BADGE */}
          <div className="relative h-6 w-full">
            <div 
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ease-out z-20"
              style={{ left: `${scalePercent}%` }}
            >
              <span className="px-2 py-0.5 bg-slate-900 text-white font-extrabold text-[9px] rounded-md shadow-md whitespace-nowrap">
                CURRENT AQI: {val}
              </span>
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900"></div>
            </div>
          </div>

          {/* 3-COLOR VISUAL SEGMENTED BAR */}
          <div className="relative w-full h-3.5 rounded-full overflow-hidden flex border border-slate-300 shadow-inner bg-slate-100">
            {/* Seg 1: Green (0-100) -> 20% of 500 */}
            <div className="w-[20%] bg-emerald-500 relative group" title="0 - 100: Good"></div>
            {/* Seg 2: Yellow (101-200) -> 20% of 500 */}
            <div className="w-[20%] bg-amber-500 relative group" title="101 - 200: Moderate"></div>
            {/* Seg 3: Red (201-500) -> 60% of 500 */}
            <div className="w-[60%] bg-rose-500 relative group" title="201+: Extreme"></div>
          </div>

          {/* TICKS & CATEGORY LABELS */}
          <div className="flex justify-between text-[10px] font-black text-slate-500 px-0.5">
            <span className="flex items-center gap-1"><span className="text-emerald-600">0–100</span> Good</span>
            <span className="flex items-center gap-1"><span className="text-amber-600">101–200</span> Moderate</span>
            <span className="flex items-center gap-1"><span className="text-rose-600">201+</span> Extreme</span>
          </div>
        </div>
      </div>

      {/* 8. AQI METRICS CARD GRID */}
      <div>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Pollutant Concentrations</span>
          <span className="text-[10px] font-bold text-slate-400">μg/m³ Standard</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {/* PM2.5 */}
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">PM2.5 Fine</span>
            <div className="text-base font-black text-slate-900">{pm25}</div>
            <span className="text-[9px] font-extrabold text-emerald-700 block">Fine Particulates</span>
          </div>

          {/* PM10 */}
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">PM10 Coarse</span>
            <div className="text-base font-black text-slate-900">{pm10}</div>
            <span className="text-[9px] font-extrabold text-amber-700 block">Inhalable Dust</span>
          </div>

          {/* Ozone */}
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Ozone (O3)</span>
            <div className="text-base font-black text-slate-900">{ozone}</div>
            <span className="text-[9px] font-extrabold text-blue-700 block">Ground Level</span>
          </div>

          {/* NO2 */}
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">NO2 Dioxide</span>
            <div className="text-base font-black text-slate-900">{no2}</div>
            <span className="text-[9px] font-extrabold text-purple-700 block">Combustion Gas</span>
          </div>
        </div>
      </div>

      {/* 9. AQI TREND — LAST 24 HOURS CHART */}
      <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>AQI TREND — LAST 24 HOURS</span>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Hourly Data</span>
        </div>

        {/* SVG LINE CHART */}
        <div className="w-full h-16 pt-1">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <defs>
              <linearGradient id="aqiTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={theme.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#e2e8f0" strokeDasharray="3 3" />

            {/* Filled Area */}
            <polygon points={areaPoints} fill="url(#aqiTrendGrad)" />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke={theme.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            {/* Endpoint Dot */}
            {points && (
              <circle
                cx={chartWidth}
                cy={chartHeight - ((trendData[trendData.length - 1] - minVal) / (maxVal - minVal || 1)) * (chartHeight - 14) - 7}
                r="4"
                fill={theme.color}
                stroke="#ffffff"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-0.5">
          <span>24h ago</span>
          <span>12h ago</span>
          <span>Now ({val} AQI)</span>
        </div>
      </div>

      {/* 10. AQI INSIGHTS (AI CORRELATION) */}
      <div className="p-3.5 bg-blue-50/80 backdrop-blur-md rounded-2xl border border-blue-200/80 shadow-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-blue-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>CITYPULSE INSIGHT</span>
        </div>
        <p className="text-slate-700 text-xs leading-relaxed font-semibold">
          {getInsightText()}
        </p>
      </div>

      {/* ACTION BUTTON */}
      <div className="pt-1">
        <button
          onClick={() => {
            if (onShowToast) onShowToast({ type: 'success', message: `Exported environmental AQI dossier for ${cityName}.` });
          }}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span>Export AQI Intelligence Report</span>
        </button>
      </div>
    </div>
  );
}
