import React, { useState } from 'react';
import {
  Target,
  Users,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { generateImpactZone } from '../utils/geoUtils';

export default function ImpactZonePanel({
  cityName = 'Jaipur',
  currentLocation,
  impactTimeStep = 0,
  onImpactTimeStepChange,
  impactLayerToggles = { people: true, roads: true, infra: true, emergency: true },
  onToggleImpactLayer,
  isWhatIfSimulating = false,
  onToggleWhatIfSimulation,
  onShowToast
}) {
  const [localTimeStep, setLocalTimeStep] = useState(impactTimeStep);
  const [localToggles, setLocalToggles] = useState(impactLayerToggles);
  const [localSimulating, setLocalSimulating] = useState(isWhatIfSimulating);
  const [showExplainBlock, setShowExplainBlock] = useState(true);

  // Default demo epicenter coords (Vaishali Nagar, Jaipur)
  const centerLat = (currentLocation && currentLocation.lat) || 26.9067;
  const centerLon = (currentLocation && currentLocation.lon) || 75.7441;
  const impactData = generateImpactZone('Vaishali Nagar Main Junction', centerLat, centerLon, 'Critical');

  const activeRadius = impactData.timeSeriesRadii[localTimeStep] || 300;

  const handleTimeStepChange = (val) => {
    setLocalTimeStep(val);
    if (onImpactTimeStepChange) onImpactTimeStepChange(val);
    if (onShowToast) {
      const steps = ['Now (0m)', '15m', '30m', '1h', '2h'];
      onShowToast({ type: 'info', message: `Simulating Impact Radius for ${steps[val]} (${impactData.timeSeriesRadii[val]}m)...` });
    }
  };

  const handleToggleLayer = (key) => {
    const next = { ...localToggles, [key]: !localToggles[key] };
    setLocalToggles(next);
    if (onToggleImpactLayer) onToggleImpactLayer(key);
    if (onShowToast) {
      onShowToast({ type: 'info', message: `${next[key] ? 'Enabled' : 'Disabled'} ${key.toUpperCase()} map overlay.` });
    }
  };

  const handleToggleSimulation = () => {
    const next = !localSimulating;
    setLocalSimulating(next);
    if (onToggleWhatIfSimulation) onToggleWhatIfSimulation(next);
    if (onShowToast) {
      onShowToast({
        type: next ? 'warning' : 'info',
        message: next ? '🔮 What-If Simulation active: Cascading chain reaction rendered on map!' : 'Simulation stopped.'
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 text-slate-800 animate-in fade-in duration-300">
      
      {/* HEADER TITLE */}
      <div className="shrink-0 flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">CIVIC INTELLIGENCE ENGINE</span>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-600" />
            <span>Impact Zone Analysis</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 rounded-full font-black text-[10px] border border-rose-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          <span>ZONE ACTIVE</span>
        </div>
      </div>

      {/* EPICENTER HERO CARD */}
      <div className="shrink-0 p-5 bg-gradient-to-br from-white/95 via-rose-50/40 to-slate-50/90 backdrop-blur-xl border border-rose-200/90 shadow-md rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-xs text-rose-700 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span>EPICENTER INCIDENT</span>
          </div>
          <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded-full shadow-2xs">
            CRITICAL SEVERITY
          </span>
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-900">{impactData.locationName} ({cityName})</h3>
          <p className="text-xs font-bold text-rose-600 mt-0.5">Major Arterial Gridlock & Waterlogging</p>
        </div>

        {/* CIRCULAR IMPACT GAUGE & METRICS ROW */}
        <div className="p-3 bg-white/90 rounded-xl border border-rose-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">POTENTIAL POPULATION IMPACT</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
              <Users className="w-4 h-4 text-purple-600" />
              ~{impactData.affectedPeople.toLocaleString()} Residents & Commuters
            </span>
          </div>

          {/* CIRCULAR SVG SCORE RING */}
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-rose-600"
                strokeDasharray={`${impactData.impactScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-slate-900 leading-none">{impactData.impactScore}</span>
              <span className="text-[7px] font-black text-rose-700 uppercase">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER TOGGLE PILLS ROW */}
      <div className="shrink-0 space-y-1.5">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
          Map Layer Overlay Filters:
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { key: 'people', label: '👥 People' },
            { key: 'roads', label: '🚗 Roads' },
            { key: 'infra', label: '⚡ Infra' },
            { key: 'emergency', label: '🚑 Medical' }
          ].map((pill) => {
            const isActive = localToggles[pill.key];
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => handleToggleLayer(pill.key)}
                className={`py-2 px-2 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border flex items-center justify-center ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TIME PREDICTION EXPANSION SLIDER */}
      <div className="shrink-0 p-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-md space-y-2.5">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <Clock className="w-4 h-4 text-rose-600" />
            Predictive Impact Expansion
          </span>
          <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-rose-300">
            {impactData.timeSteps[localTimeStep]} • {activeRadius}m Radius
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="4"
          step="1"
          value={localTimeStep}
          onChange={(e) => handleTimeStepChange(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
        />

        <div className="flex justify-between text-[9px] font-extrabold text-slate-400 pt-0.5">
          {impactData.timeSteps.map((stepLabel, idx) => (
            <span
              key={idx}
              className={localTimeStep === idx ? 'text-rose-700 font-black scale-105' : ''}
            >
              {stepLabel}
            </span>
          ))}
        </div>
      </div>

      {/* PROMINENT ACTION BUTTONS */}
      <div className="shrink-0 grid grid-cols-2 gap-2.5">
        {/* BUTTON 1: EXPLAIN IMPACT */}
        <button
          type="button"
          onClick={() => setShowExplainBlock(!showExplainBlock)}
          className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
            showExplainBlock
              ? 'bg-purple-700 text-white border-purple-700 ring-2 ring-purple-400/30'
              : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>✨ Explain Impact</span>
        </button>

        {/* BUTTON 2: WHAT-IF SIMULATION */}
        <button
          type="button"
          onClick={handleToggleSimulation}
          className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
            localSimulating
              ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/40 animate-pulse'
              : 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white border-transparent hover:brightness-110'
          }`}
        >
          <span>🔮 What-If Simulation</span>
        </button>
      </div>

      {/* AI EXPLANATION COMPONENT */}
      {showExplainBlock && (
        <div className="shrink-0 p-4 bg-white rounded-2xl border border-purple-200 shadow-md space-y-3 text-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-purple-900 font-black text-[11px] border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Impact Insights: Root Cause Analysis
            </span>
            <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-300">
              Gemini AI
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 text-xs">Why is this area affected?</h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              High population density (~{impactData.affectedPeople.toLocaleString()} residents/commuters) combined with low hydro-drainage outflow capacity along Kings Road underpass corridor.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs">Recommended Actions:</h4>
            <div className="space-y-1.5 text-[11px] font-bold text-slate-800">
              <div className="p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 flex items-center gap-2">
                <span>🚦 Reroute arterial transit via Sector 4 Bypass</span>
              </div>
              <div className="p-2 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 flex items-center gap-2">
                <span>🚑 Open emergency green corridor to SMS Hospital</span>
              </div>
              <div className="p-2 bg-purple-50 text-purple-900 rounded-xl border border-purple-200 flex items-center gap-2">
                <span>📢 Broadcast mobile mesh alert to commuters within 2km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASCADING IMPACT SIMULATION TIMELINE */}
      {localSimulating && (
        <div className="shrink-0 p-4 bg-rose-50/90 rounded-2xl border border-rose-300 shadow-md space-y-2.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-rose-900 font-black text-xs border-b border-rose-200/80 pb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              Cascading Failure Chain Reaction
            </span>
            <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">ACTIVE MAP SIM</span>
          </div>

          <div className="space-y-2">
            {impactData.cascadingEvents.map((evt) => (
              <div key={evt.step} className="p-3 bg-white rounded-xl border border-rose-200/90 space-y-1 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">STEP {evt.step}: {evt.title}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${evt.badgeBg}`}>
                    {evt.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-semibold">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
