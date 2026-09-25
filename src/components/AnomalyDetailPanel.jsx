import React, { useState } from 'react';
import AlertProximityPanel from './AlertProximityPanel';
import { generateImpactZone } from '../utils/geoUtils';
import {
  AlertTriangle,
  Activity,
  Zap,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Car,
  Wind,
  Droplet,
  Shield,
  Volume2,
  Clock,
  ArrowUpRight,
  CheckCircle,
  BrainCircuit,
  Filter,
  Users,
  Layers,
  HelpCircle,
  Target
} from 'lucide-react';

export default function AnomalyDetailPanel({
  cityName,
  anomalies = [],
  onSelectAnomaly,
  selectedAnomalyId,
  impactTimeStep = 0,
  onImpactTimeStepChange,
  impactLayerToggles = { people: true, roads: true, infra: true, emergency: true },
  onToggleImpactLayer,
  isWhatIfSimulating = false,
  onToggleWhatIfSimulation,
  onShowToast
}) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(selectedAnomalyId || 'anom-1');
  const [aiLoadingId, setAiLoadingId] = useState(null);

  // Local state fallbacks if parent props omitted
  const [localTimeStep, setLocalTimeStep] = useState(impactTimeStep);
  const [localToggles, setLocalToggles] = useState(impactLayerToggles);
  const [localSimulating, setLocalSimulating] = useState(isWhatIfSimulating);
  const [showExplainBlock, setShowExplainBlock] = useState(false);

  // Synchronize internal expandedId if parent passes selectedAnomalyId
  React.useEffect(() => {
    if (selectedAnomalyId) {
      setExpandedId(selectedAnomalyId);
    }
  }, [selectedAnomalyId]);

  // Synchronize impact state if props change
  React.useEffect(() => {
    if (typeof impactTimeStep === 'number') setLocalTimeStep(impactTimeStep);
  }, [impactTimeStep]);

  React.useEffect(() => {
    if (impactLayerToggles) setLocalToggles(impactLayerToggles);
  }, [impactLayerToggles]);

  React.useEffect(() => {
    if (typeof isWhatIfSimulating === 'boolean') setLocalSimulating(isWhatIfSimulating);
  }, [isWhatIfSimulating]);

  const handleTimeStepChange = (val) => {
    setLocalTimeStep(val);
    if (onImpactTimeStepChange) onImpactTimeStepChange(val);
    if (onShowToast) {
      const steps = ['Now (0m)', '15m', '30m', '1h', '2h'];
      onShowToast({ type: 'info', message: `Simulating Impact Expansion for ${steps[val]}...` });
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
        message: next ? '🔮 What-If Simulation active: Cascading chain reaction overlay rendered on map!' : 'Simulation stopped.'
      });
    }
  };

  // Compute City Health Score & Sub-scores dynamically
  const totalAnomalies = anomalies.length;
  const criticalCount = anomalies.filter(a => a.severity === 'Critical').length;
  const highCount = anomalies.filter(a => a.severity === 'High').length;
  const healthScore = Math.max(45, 100 - (criticalCount * 12 + highCount * 6 + (totalAnomalies - criticalCount - highCount) * 3));

  // Active Anomaly Object for Impact Zone Engine
  const activeAnom = anomalies.find(a => a.id === expandedId) || anomalies[0];

  const filteredAnomalies = anomalies.filter(item => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Critical') return item.severity === 'Critical' || item.severity === 'High';
    if (filterCategory === 'Traffic') return item.category === 'Traffic';
    if (filterCategory === 'Air Quality') return item.category === 'Air Quality';
    if (filterCategory === 'Safety') return item.category === 'Public Safety' || item.category === 'Noise';
    return true;
  });

  const multiSignalEvents = anomalies.filter(a => a.isMultiSignal);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Traffic': return <Car className="w-4 h-4 text-amber-600" />;
      case 'Air Quality': return <Wind className="w-4 h-4 text-emerald-600" />;
      case 'Water': return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Public Safety': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'Noise': return <Volume2 className="w-4 h-4 text-rose-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            CRITICAL
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
            WARNING
          </span>
        );
    }
  };

  const handleExplainAI = (anom) => {
    setAiLoadingId(anom.id);
    setShowExplainBlock(true);
    if (onShowToast) {
      onShowToast({ type: 'info', message: `Gemini AI synthesizing orchestration response for ${anom.title}...` });
    }
    setTimeout(() => {
      setAiLoadingId(null);
      if (onShowToast) {
        onShowToast({ type: 'success', message: `AI Orchestration plan generated for ${anom.locationName}.` });
      }
    }, 1000);
  };

  const handleExecuteAction = (actionText, anom) => {
    if (onShowToast) {
      onShowToast({
        type: 'success',
        message: `Action Dispatched: "${actionText}" deployed at ${anom.locationName}.`
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 animate-in fade-in duration-300">
      
      {/* HEADER TITLE */}
      <div className="shrink-0 flex justify-between items-center pb-1">
        <div>
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">AI ORCHESTRATION ENGINE</span>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            <span>Anomaly & Impact Zone</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-black text-[10px] border border-purple-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
          <span>NEURAL SCAN ACTIVE</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC IMPACT ZONE ENGINE UI CARD */}
      {/* ========================================================================= */}
      {activeAnom && (() => {
        const impactData = generateImpactZone(activeAnom.locationName, activeAnom.location[0], activeAnom.location[1], activeAnom.severity);
        const activeRadius = impactData.timeSeriesRadii[localTimeStep] || 300;

        return (
          <div className="shrink-0 p-5 bg-gradient-to-br from-white/95 via-slate-50/90 to-purple-50/40 backdrop-blur-xl border border-purple-200/90 shadow-lg rounded-2xl space-y-4 text-slate-800">
            {/* 1. HEADER WITH CIRCULAR PROGRESS SCORE */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  DYNAMIC IMPACT ZONE ENGINE
                </span>
                <h3 className="text-sm font-black text-slate-900 tracking-tight mt-0.5">{impactData.locationName}</h3>
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>~{impactData.affectedPeople.toLocaleString()} People Affected Radius</span>
                </p>
              </div>

              {/* CIRCULAR PROGRESS SCORE (IMPACT SCORE 0-100) */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={impactData.impactScore >= 80 ? 'text-rose-600' : 'text-amber-500'}
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
                  <span className="text-[7px] font-black text-rose-700 uppercase">IMPACT</span>
                </div>
              </div>
            </div>

            {/* 2. LAYER TOGGLE PILLS ROW */}
            <div className="space-y-1.5 pt-1">
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
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border flex items-center justify-center ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. TIME PREDICTION EXPANSION SLIDER */}
            <div className="p-3 bg-white/90 rounded-xl border border-purple-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-purple-900 uppercase tracking-wider flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Predictive Impact Expansion
                </span>
                <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-[10px]">
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
                className="w-full accent-purple-600 cursor-pointer"
              />

              <div className="flex justify-between text-[9px] font-extrabold text-slate-400">
                {impactData.timeSteps.map((stepLabel, idx) => (
                  <span
                    key={idx}
                    className={localTimeStep === idx ? 'text-purple-700 font-black scale-105' : ''}
                  >
                    {stepLabel}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. PROMINENT ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* BUTTON 1: EXPLAIN IMPACT */}
              <button
                type="button"
                onClick={() => setShowExplainBlock(!showExplainBlock)}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
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
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                  localSimulating
                    ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/40 animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:brightness-110'
                }`}
              >
                <span>🔮 What-If Simulation</span>
              </button>
            </div>

            {/* AI EXPLANATION COMPONENT (SHOW EXPLAIN BLOCK) */}
            {showExplainBlock && (
              <div className="p-3.5 bg-white rounded-xl border border-purple-200/90 shadow-sm space-y-2.5 animate-in fade-in duration-300 text-xs">
                <div className="flex items-center justify-between text-purple-900 font-black text-[11px] border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Impact Insights: Root Cause Analysis
                  </span>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Gemini AI</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 text-xs">Why is this area affected?</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Concentrated population density (~{impactData.affectedPeople.toLocaleString()} residents and commuters) combined with low hydro-drainage outflow and key arterial bottlenecking.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-xs">Recommended Actions:</h4>
                  <ul className="space-y-1 text-[11px] font-bold text-slate-700">
                    <li className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <span>🚦 Reroute public transit via Sector 4 Bypass Link</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      <span>🚑 Open emergency priority corridor to SMS Hospital</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      <span>📢 Broadcast mobile mesh alert to commuters within 2km</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* CASCADING IMPACT SIMULATION STEP-BY-STEP CARDS */}
            {localSimulating && (
              <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-rose-900 font-black text-xs border-b border-rose-200/60 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    Cascading Impact Chain Reaction
                  </span>
                  <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">ACTIVE MAP SIM</span>
                </div>

                <div className="space-y-2">
                  {impactData.cascadingEvents.map((evt) => (
                    <div key={evt.step} className="p-2.5 bg-white rounded-lg border border-rose-200/80 space-y-0.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">STEP {evt.step}: {evt.title}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${evt.badgeBg}`}>
                          {evt.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. CITY HEALTH SCORE (Circular SVG Progress Ring & Sub-metrics Grid) */}
      <div className="shrink-0 p-5 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-md rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">COMPOSITE CIVIC INDEX</span>
            <h3 className="text-sm font-black text-slate-900">{cityName} Health Score</h3>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5 leading-relaxed">Real-time multi-sensor telemetry score</p>
          </div>

          {/* CIRCULAR SVG SCORE RING */}
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={healthScore >= 80 ? 'text-emerald-500' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500'}
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-slate-900 leading-none">{healthScore}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">/100</span>
            </div>
          </div>
        </div>

        {/* SUB-CATEGORY PROGRESS BARS */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black text-slate-600">
              <span>Traffic Flow</span>
              <span>72%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black text-slate-600">
              <span>Air Transducers</span>
              <span>64%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black text-slate-600">
              <span>Public Safety</span>
              <span>91%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '91%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black text-slate-600">
              <span>Hydro Drainage</span>
              <span>85%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* CIVIC EMERGENCY ALERT PROXIMITY PANEL */}
      {(() => {
        const activeAnom = anomalies.find(a => a.id === expandedId) || anomalies[0];
        if (!activeAnom) return null;
        return (
          <div className="shrink-0">
            <AlertProximityPanel
              distance="4.1 km"
              locationName={activeAnom.locationName || "Vaishali Nagar"}
              incidentTitle={activeAnom.title ? `⚠ ${activeAnom.title.toUpperCase()}` : "⚠ WATERLOGGING DETECTED"}
              incidentDescription={activeAnom.explanation?.whatChanged || "Severe water accumulation has been reported around arterial low points and underpasses."}
              updatedTime={`UPDATED ${activeAnom.startTime ? activeAnom.startTime.toUpperCase() : "12 MIN AGO"}`}
              precautionTitle="⚠ AVOID LOW-LYING CORRIDORS"
              precautionDescription={activeAnom.explanation?.possibleCause || "Kings Road underpasses and nearby low-lying connecting roads may be affected."}
              onViewAlertZone={() => {
                if (activeAnom && onSelectAnomaly) {
                  onSelectAnomaly(activeAnom);
                }
                if (onShowToast) {
                  onShowToast({ type: 'info', message: `Focusing alert zone for ${activeAnom.locationName || 'selected area'} on map...` });
                }
              }}
            />
          </div>
        );
      })()}

      {/* 5. MULTI-SIGNAL EVENT DETECTOR (The Differentiator Highlight Card) */}
      {multiSignalEvents.length > 0 && (
        <div className="shrink-0 p-5 rounded-2xl border-2 border-rose-400/80 bg-gradient-to-br from-rose-50/90 via-white/90 to-amber-50/90 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>🚨 MULTI-SIGNAL EVENT DETECTED</span>
            </div>
            <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded-full shadow-2xs">
              CONFIDENCE {multiSignalEvents[0].confidence}%
            </span>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 leading-snug break-words whitespace-normal">{multiSignalEvents[0].title}</h4>
            <p className="text-[10px] font-extrabold text-slate-500 mt-0.5">{multiSignalEvents[0].locationName}</p>
          </div>

          {/* CORRELATED SENSOR TRIGGERS */}
          <div className="p-3 bg-white/90 rounded-xl border border-rose-200/80 space-y-1.5">
            <span className="text-[9px] font-black text-rose-800 uppercase tracking-wider block">Correlated Telemetry Triggers:</span>
            <div className="space-y-1">
              {multiSignalEvents[0].multiSignalTriggers.map((trig, idx) => (
                <div key={idx} className="text-[11px] font-bold text-slate-800 flex items-center gap-1 break-words whitespace-normal leading-relaxed">
                  <span className="text-rose-500 font-extrabold">↳</span>
                  <span>{trig}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setExpandedId(multiSignalEvents[0].id);
              if (onSelectAnomaly) onSelectAnomaly(multiSignalEvents[0]);
            }}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
          >
            <span>Focus Multi-Signal Incident</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 8. FILTER PILL ROW */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Critical', 'Traffic', 'Air Quality', 'Safety'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 6 & 7. ANOMALY CARDS LIST (EXPANDABLE DETAIL WITH gap-6) */}
      <div className="shrink-0 space-y-6">
        {filteredAnomalies.map((anom) => {
          const isExpanded = expandedId === anom.id;

          // Mini Sparkline SVG generation
          const sparkMax = Math.max(...anom.sparklineData, 100);
          const sparkMin = Math.min(...anom.sparklineData, 0);
          const points = anom.sparklineData
            .map((val, idx) => {
              const x = (idx / (anom.sparklineData.length - 1)) * 90;
              const y = 24 - ((val - sparkMin) / (sparkMax - sparkMin || 1)) * 20;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <div
              key={anom.id}
              className={`shrink-0 p-5 bg-white/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 shadow-sm ${
                isExpanded ? 'border-purple-400 ring-2 ring-purple-400/20 bg-white shadow-md' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* CARD TOP BAR */}
              <div
                onClick={() => {
                  const next = isExpanded ? null : anom.id;
                  setExpandedId(next);
                  if (onSelectAnomaly) onSelectAnomaly(anom);
                }}
                className="cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      {getCategoryIcon(anom.category)}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{anom.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getSeverityBadge(anom.severity)}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 tracking-tight leading-relaxed break-words whitespace-normal">{anom.title}</h4>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                    <span>📍 {anom.locationName}</span>
                    <span>•</span>
                    <span className="text-purple-600 font-extrabold">{anom.startTime}</span>
                  </p>
                </div>

                {/* METRICS & SPARKLINE TIMELINE */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Deviated Value</span>
                    <span className="text-xs font-black text-rose-600">{anom.currentValue}</span>
                    <span className="text-[9px] font-bold text-slate-400 ml-1">({anom.deviation})</span>
                  </div>

                  {/* SPARKLINE SVG */}
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-extrabold text-slate-400 mb-0.5">Timeline Spike</span>
                    <svg className="w-24 h-6 overflow-visible" viewBox="0 0 90 24">
                      <polyline
                        fill="none"
                        stroke={anom.severity === 'Critical' ? '#ef4444' : '#f59e0b'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        points={points}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 7. EXPANDED AI EXPLANATION & RECOMMENDED ACTIONS */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
                  
                  {/* AI DEEP EXPLANATION (Clean typography with subtle dividers) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        AI Telemetry Analysis
                      </span>
                      <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Risk Level {anom.predictionRisk}%
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-800">
                      <div>
                        <strong className="text-slate-900 font-extrabold block text-[11px] mb-0.5">What Changed:</strong>
                        <p className="text-slate-600 font-medium text-[11px] leading-relaxed break-words whitespace-normal">{anom.explanation.whatChanged}</p>
                      </div>

                      <hr className="border-slate-100/60 my-2" />

                      <div>
                        <strong className="text-slate-900 font-extrabold block text-[11px] mb-0.5">Baseline vs Current:</strong>
                        <p className="text-slate-600 font-medium text-[11px] leading-relaxed break-words whitespace-normal">{anom.explanation.normalVsCurrent}</p>
                      </div>

                      <hr className="border-slate-100/60 my-2" />

                      <div>
                        <strong className="text-slate-900 font-extrabold block text-[11px] mb-0.5">Possible Cause (Correlation):</strong>
                        <p className="text-slate-600 font-medium text-[11px] leading-relaxed break-words whitespace-normal">{anom.explanation.possibleCause}</p>
                      </div>
                    </div>

                    {/* ✨ EXPLAIN WITH AI SHINY BUTTON */}
                    <button
                      onClick={() => handleExplainAI(anom)}
                      disabled={aiLoadingId === anom.id}
                      className="w-full mt-3 py-2.5 px-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-[10px] rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all active:scale-95"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${aiLoadingId === anom.id ? 'animate-spin' : ''}`} />
                      <span>{aiLoadingId === anom.id ? 'Synthesizing Gemini AI...' : '✨ Explain this anomaly with AI'}</span>
                    </button>
                  </div>

                  <hr className="border-slate-100/80 my-3" />

                  {/* RECOMMENDED ACTIONS PILLS */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Recommended Actions:</span>
                    <div className="flex flex-wrap gap-2">
                      {anom.recommendedActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExecuteAction(act, anom)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-lg border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
