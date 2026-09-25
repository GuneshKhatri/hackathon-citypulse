import React from 'react';
import { Activity, ShieldCheck, Cpu, Zap, Radio, Database } from 'lucide-react';

export default function About() {
  return (
    <div className="relative z-20 min-h-screen px-4 sm:px-8 py-8 pt-24 max-w-7xl mx-auto space-y-8 text-slate-800 pointer-events-auto">
      {/* Title Banner */}
      <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 sm:p-8 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 animate-slide-up">
        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-extrabold tracking-[0.2em] uppercase">
          <Activity className="w-4 h-4" />
          <span>About CityPulse Jaipur</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]">
          Live Predictive Civic Intelligence Platform
        </h1>
        <p className="text-slate-500 text-[11px] max-w-2xl leading-relaxed font-medium">
          Built for the Hackathon to empower Jaipur Municipal Corporation with predictive disaster telemetry, real-time IoT catchment sensing, and AI-driven automated rerouting.
        </p>
      </div>

      {/* System Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 stagger-1 premium-hover">
          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-blue-700 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">1. Satellite Telemetry & IoT Sensing</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Synthesizes live Open-Meteo precipitation forecasts, drainage pressure transducers, and road speed sensors to maintain a 99.8% synchronized digital twin of Jaipur.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 stagger-2 premium-hover">
          <div className="w-10 h-10 rounded-xl bg-indigo-50/80 text-indigo-700 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">2. AI Civic Graph Prediction</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Machine learning models predict arterial road disruptions up to 30 minutes in advance, generating automated rerouting paths for emergency responders.
          </p>
        </div>
      </div>
    </div>
  );
}
