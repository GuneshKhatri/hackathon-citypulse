import React from 'react';
import { AlertOctagon, ShieldAlert, Clock, MapPin, CheckCircle } from 'lucide-react';
import AlertProximityPanel from './AlertProximityPanel';

export default function IncidentsDetailPanel({ cityName, weatherData, aqiData, incidents, onShowToast }) {
  const rawAqi = aqiData?.current?.us_aqi ?? (parseInt(aqiData?.aqiVal || aqiData) || 52);
  const rawTemp = weatherData?.current?.temperature_2m ?? (parseInt(weatherData?.temp) || 26);

  const dynamicIncidents = [
    {
      id: 1,
      title: rawAqi > 100 ? `Air Quality Advisory in ${cityName}` : `Routine Municipal Service in ${cityName}`,
      severity: rawAqi > 100 ? 'high' : 'info',
      time: 'Updated 8m ago',
      details: rawAqi > 100
        ? `Air Quality Index is elevated (${rawAqi} US AQI). Sensitive groups should reduce outdoor physical exertion.`
        : `Scheduled municipal sanitation and street sweeping active across central ${cityName} wards.`,
      badgeColor: rawAqi > 100 ? 'border-l-4 border-rose-500 bg-rose-50/70' : 'border-l-4 border-blue-500 bg-blue-50/70'
    },
    {
      id: 2,
      title: rawTemp > 35 ? `Extreme Heat Protocol in ${cityName}` : `Traffic Signal Calibration`,
      severity: rawTemp > 35 ? 'warning' : 'info',
      time: 'Updated 15m ago',
      details: rawTemp > 35
        ? `High temperature threshold reached (${rawTemp}°C). Hydration stations and civic cooling shelters deployed.`
        : `Smart traffic signal optimization active at high-volume intersections across ${cityName}.`,
      badgeColor: rawTemp > 35 ? 'border-l-4 border-amber-500 bg-amber-50/70' : 'border-l-4 border-indigo-500 bg-indigo-50/70'
    },
    {
      id: 3,
      title: `Community Hazard Response`,
      severity: 'info',
      time: 'Updated 22m ago',
      details: `Citizen report #4821: Road surface repair and pothole patch team dispatched to main corridor in ${cityName}.`,
      badgeColor: 'border-l-4 border-slate-400 bg-white/80'
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-800 animate-in fade-in duration-300">
      {/* HEADER & ALERT STATUS */}
      <div className="shrink-0 flex justify-between items-center pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-600" />
            <span>Active Civic Incidents</span>
          </h2>
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Live 311 Dispatch for {cityName}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-extrabold text-[11px] border border-rose-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          <span>ALERT</span>
        </div>
      </div>

      {/* PRIORITY ALERT PROXIMITY PANEL */}
      <div className="shrink-0">
        <AlertProximityPanel
          distance="4.1 km"
          locationName={cityName ? `${cityName} Sector 4` : 'Vaishali Nagar'}
          incidentTitle="⚠ WATERLOGGING DETECTED"
          incidentDescription="Severe water accumulation has been reported around arterial low points and underpasses."
          updatedTime="UPDATED 12 MIN AGO"
          precautionTitle="⚠ AVOID LOW-LYING CORRIDORS"
          precautionDescription="Kings Road underpasses and nearby low-lying connecting roads may be affected."
          onViewAlertZone={() => {
            if (onShowToast) {
              onShowToast({ type: 'info', message: 'Focusing waterlogging alert zone on map...' });
            }
          }}
        />
      </div>

      {/* DYNAMIC INCIDENT CARDS LIST (space-y-6) */}
      <div className="shrink-0 space-y-6">
        {dynamicIncidents.map((item) => (
          <div
            key={item.id}
            className={`shrink-0 p-5 rounded-2xl shadow-sm border border-slate-200/80 backdrop-blur-md transition-all hover:shadow-md ${item.badgeColor}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-extrabold text-xs text-slate-900 leading-snug break-words whitespace-normal">{item.title}</h4>
              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                {item.time}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium break-words whitespace-normal">{item.details}</p>
            
            <hr className="border-slate-200/40 my-3" />

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3 h-3 text-rose-500" />
                {cityName} Sector Hub
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle className="w-3 h-3" />
                Dispatched
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BUTTON */}
      <div className="shrink-0 pt-2">
        <button
          onClick={() => {
            if (onShowToast) onShowToast({ type: 'info', message: `Refreshed 311 incident log for ${cityName}.` });
          }}
          className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span>Refresh Incident Log</span>
        </button>
      </div>
    </div>
  );
}
