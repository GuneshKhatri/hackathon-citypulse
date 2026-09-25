import React from 'react';
import { BarChart3, TrendingUp, Droplets, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export default function Insights() {
  const wardMetrics = [
    { name: 'C-Scheme (Ward 42)', status: 'Elevated Alert', waterLevel: '18 cm', trafficSpeed: '12 km/h', risk: 'High' },
    { name: 'Malviya Nagar (Ward 65)', status: 'Normal', waterLevel: '2 cm', trafficSpeed: '38 km/h', risk: 'Low' },
    { name: 'Amer Valley (Ward 12)', status: 'Normal', waterLevel: '4 cm', trafficSpeed: '42 km/h', risk: 'Low' },
    { name: 'Mansarovar (Ward 88)', status: 'Monitoring', waterLevel: '9 cm', trafficSpeed: '24 km/h', risk: 'Moderate' },
  ];

  return (
    <div className="relative z-20 min-h-screen px-4 sm:px-8 py-8 pt-24 max-w-7xl mx-auto space-y-8 text-slate-800 pointer-events-auto">
      {/* Header Banner */}
      <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 sm:p-8 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 animate-slide-up">
        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-extrabold tracking-[0.2em] uppercase">
          <BarChart3 className="w-4 h-4" />
          <span>CityPulse Urban Analytics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]">
          Jaipur Civic Insights & Ward Telemetry
        </h1>
        <p className="text-slate-500 text-[11px] max-w-2xl leading-relaxed font-medium">
          Aggregated real-time metrics synthesized from satellite imagery, IoT catchment sensors, and municipal incident logs across Jaipur.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-2.5 stagger-1 premium-hover">
          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.2em] uppercase">Avg Traffic Speed</span>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tighter data-value">22.4 km/h</h3>
          <p className="text-[10px] text-amber-600 font-bold">-28% reduction during storm event</p>
        </div>

        <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-2.5 stagger-2 premium-hover">
          <div className="w-10 h-10 rounded-xl bg-cyan-50/80 text-cyan-600 flex items-center justify-center font-bold">
            <Droplets className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.2em] uppercase">Catchment Saturation</span>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tighter data-value">74.2% Capacity</h3>
          <p className="text-[10px] text-blue-600 font-bold">Ajmer Road & MI Road drainage active</p>
        </div>

        <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-2.5 stagger-3 premium-hover">
          <div className="w-10 h-10 rounded-xl bg-rose-50/80 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.2em] uppercase">AI Forecast Risk</span>
          <h3 className="text-2xl font-extrabold text-rose-700 tracking-tighter data-value">Critical Stage 4</h3>
          <p className="text-[10px] text-rose-600 font-bold">MI Road Sector 2 disruption in ~30m</p>
        </div>
      </div>

      {/* Ward Telemetry Table */}
      <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-4 stagger-4">
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
          <Cpu className="w-5 h-5 text-blue-600" />
          Ward-by-Ward Telemetry Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100/50 text-slate-400 font-extrabold tracking-[0.15em] uppercase text-[9px]">
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Water Level</th>
                <th className="py-3 px-4">Avg Speed</th>
                <th className="py-3 px-4">AI Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
              {wardMetrics.map((ward, idx) => (
                <tr key={idx} className="hover:bg-white/50 transition-all duration-300">
                  <td className="py-3.5 px-4 text-slate-900 font-bold">{ward.name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ${
                      ward.risk === 'High' ? 'bg-rose-100/80 text-rose-700' : ward.risk === 'Moderate' ? 'bg-amber-100/80 text-amber-700' : 'bg-emerald-100/80 text-emerald-700'
                    }`}>
                      {ward.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 data-value">{ward.waterLevel}</td>
                  <td className="py-3.5 px-4 data-value">{ward.trafficSpeed}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{ward.risk} Risk</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
