import React from 'react';
import { ArrowDownRight, Radio, AlertTriangle } from 'lucide-react';

export default function TrafficDetailPanel({ cityName, onShowToast }) {
  return (
    <div className="flex flex-col h-full py-2 space-y-4 text-slate-800 animate-in fade-in duration-300">
      {/* 1. HEADER & LIVE STATUS */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Traffic & Transit Hub</h2>
          <p className="text-[11px] font-semibold text-slate-500">{cityName} Metropolitan Region</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-extrabold text-[11px] border border-emerald-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE</span>
        </div>
      </div>

      {/* 2. PRIMARY METRICS GRID */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Card 1: Citywide Congestion */}
        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Citywide Congestion</span>
          <div className="text-2xl font-extrabold text-slate-900">68%</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-orange-500 rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Card 2: Average Speed */}
        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Average Speed</span>
          <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-1">
            <span>22 km/h</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600 stroke-[3]" />
          </div>
          <p className="text-[10px] font-bold text-rose-600">
            ↓ 15% from baseline
          </p>
        </div>

        {/* Card 3: Active Incidents */}
        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Active Incidents</span>
          <div className="text-2xl font-extrabold text-rose-600">4</div>
          <p className="text-[10px] text-slate-500 font-semibold">Priority response active</p>
        </div>

        {/* Card 4: Transit Status */}
        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Transit Status</span>
          <div className="text-2xl font-extrabold text-amber-600">Delayed</div>
          <p className="text-[10px] text-slate-500 font-semibold">Fleets +12m delay</p>
        </div>
      </div>

      {/* 3. LIVE LOCALIZED INCIDENTS FEED */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Live Incidents Feed
          </span>
          <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">3 Alerts</span>
        </h3>
        <div className="space-y-2">
          <div className="border-l-4 border-red-500 bg-white/80 backdrop-blur-sm p-3 rounded-r-xl shadow-2xs text-xs font-semibold text-slate-700">
            Major bottleneck detected on arterial routes in central {cityName}.
          </div>
          <div className="border-l-4 border-amber-500 bg-white/80 backdrop-blur-sm p-3 rounded-r-xl shadow-2xs text-xs font-semibold text-slate-700">
            Waterlogging reported causing 15-minute delays near sector junction.
          </div>
          <div className="border-l-4 border-red-500 bg-white/80 backdrop-blur-sm p-3 rounded-r-xl shadow-2xs text-xs font-semibold text-slate-700">
            Traffic signal failure at major intersection causing manual divert.
          </div>
        </div>
      </div>

      {/* 4. ACTION BUTTON */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (onShowToast) onShowToast({ type: 'success', message: `Broadcast Reroute Protocol initiated for ${cityName} traffic control!` });
          }}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Broadcast Reroute Protocol</span>
        </button>
      </div>
    </div>
  );
}
