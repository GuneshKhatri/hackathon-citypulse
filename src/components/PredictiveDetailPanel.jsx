import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Info,
  Clock,
  MapPin,
  CheckCircle2,
  HelpCircle,
  ArrowDown
} from 'lucide-react';
import { getPredictiveDisruptionSpread } from '../utils/geoUtils';

export default function PredictiveDetailPanel({
  cityName = 'Jaipur',
  currentLocation,
  selectedArea,
  selectedNodeId,
  onSelectNode,
  onShowToast
}) {
  const spreadData = getPredictiveDisruptionSpread(cityName, currentLocation, selectedArea);
  const [activeNodeId, setActiveNodeId] = useState(selectedNodeId || 'origin-epicenter');

  // Handle node selection
  const handleNodeClick = (node) => {
    setActiveNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
    if (onShowToast) {
      onShowToast({
        type: 'info',
        message: `Inspecting potential spread node: ${node.name}`
      });
    }
  };

  // Graceful degradation state if no valid location data is available
  if (!spreadData || !spreadData.available) {
    return (
      <div className="flex flex-col gap-6 text-slate-800 animate-in fade-in duration-300">
        {/* HEADER */}
        <div className="shrink-0 flex justify-between items-center pb-1 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">CIVIC INTELLIGENCE</span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🔮 PREDICTIVE DISRUPTION SPREAD</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-black text-[10px] border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            <span>MODEL STANDBY</span>
          </div>
        </div>

        {/* FALLBACK CARD */}
        <div className="shrink-0 p-6 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-md rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Predictive spread unavailable</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              Predictive spread unavailable: Insufficient live civic data for reliable prediction.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-left text-[11px] font-medium text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              Select or search any location to generate dynamic rule-based disruption spread analysis.
            </span>
          </div>
        </div>
      </div>
    );
  }

  const { disruptionCenter, whyThisPattern, nodes } = spreadData;
  const activeNode = nodes.find(n => n.id === activeNodeId) || disruptionCenter;

  return (
    <div className="flex flex-col gap-5 text-slate-800 animate-in fade-in duration-300">
      
      {/* HEADER TITLE */}
      <div className="shrink-0 flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">CIVIC INTELLIGENCE MESH</span>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>🔮 PREDICTIVE DISRUPTION SPREAD</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-[10px] border border-amber-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
          <span>PREDICTIVE LAYER</span>
        </div>
      </div>

      {/* EPISTEMIC HONESTY DISCLAIMER CARD */}
      <div className="shrink-0 p-3.5 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700">
          <Info className="w-4 h-4 text-slate-500" />
          <span className="uppercase tracking-wider">⚠ PREDICTION — NOT A CONFIRMED INCIDENT</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Forecasted impact nodes represent calculated potential spread channels, not verified incidents.
        </p>
      </div>

      {/* CURRENT IMPACT EPICENTER CARD */}
      <div className="shrink-0 p-4 bg-white/90 backdrop-blur-xl border border-rose-200/80 shadow-md rounded-2xl space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            CURRENT DISRUPTION EPICENTER
          </span>
          <span className="text-[9px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
            {disruptionCenter.status}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-900">{disruptionCenter.name}</h3>
          <p className="text-xs font-extrabold text-rose-600 mt-0.5">{disruptionCenter.currentImpact}</p>
        </div>
      </div>

      {/* DOWNWARD VISUAL FLOW INDICATOR */}
      <div className="shrink-0 flex items-center justify-center my-0.5">
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/80 text-[10px] font-extrabold text-amber-700 shadow-2xs">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-amber-600" />
          <span>POTENTIAL SPREAD VECTOR</span>
        </div>
      </div>

      {/* WHY THIS PATTERN? SUB-SECTION */}
      <div className="shrink-0 p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>WHY THIS PATTERN?</span>
        </div>
        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
          {whyThisPattern}
        </p>
      </div>

      {/* POTENTIAL SPREAD NODES LIST */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            POTENTIAL NEXT IMPACTS ({nodes.length})
          </span>
          <span className="text-[10px] font-bold text-slate-400">Click node on map or list</span>
        </div>

        <div className="space-y-3">
          {nodes.map((node) => {
            const isSelected = activeNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-white border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: node.color }}
                    ></span>
                    <h4 className="text-xs font-black text-slate-900">{node.name}</h4>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${node.badgeBg}`}>
                    {node.riskLevel}
                  </span>
                </div>

                <div className="mt-2 text-xs font-medium text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900 leading-snug">
                    Potential impact: {node.predictedEffect}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {node.detailedEffect}
                  </p>
                  <p className="text-[11px] text-slate-500">Basis: {node.basis}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    {node.distance} from epicenter
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-extrabold">
                    <Clock className="w-3 h-3" />
                    {node.estimatedTimeframe}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED NODE PREDICTED IMPACT INSPECTOR */}
      {activeNode && (
        <div className="shrink-0 p-4 bg-white rounded-2xl border border-amber-300 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              INSPECTED NODE
            </span>
            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              Potential Impact
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 space-y-1 text-xs">
            <div className="font-black text-slate-900 border-b border-amber-200/50 pb-1">
              PREDICTED IMPACT
            </div>
            <div className="text-[11px] font-semibold text-slate-800 space-y-1 pt-1">
              <p><strong>Area:</strong> {activeNode.name}</p>
              <p><strong>Potential impact:</strong> {activeNode.predictedEffect || activeNode.currentImpact}</p>
              <p><strong>Spread level:</strong> {activeNode.spreadLevel || 'MEDIUM'}</p>
              <p><strong>Basis:</strong> {activeNode.basis || 'Road connectivity + current congestion'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

