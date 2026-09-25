import React, { useState } from 'react';
import { FileText, AlertTriangle, Send, CheckCircle2, MapPin } from 'lucide-react';

export default function Reports({ onShowToast }) {
  const [form, setForm] = useState({ category: 'Waterlogging', location: 'MI Road Sector 2', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onShowToast) {
      onShowToast({ type: 'success', message: 'Report submitted! Municipal dispatch notified.' });
    }
  };

  const activeReports = [
    { id: 'REP-4091', category: 'Waterlogging', location: 'MI Road Sector 2', time: '10 mins ago', status: 'Dispatched' },
    { id: 'REP-4088', category: 'Drainage Blockage', location: 'C-Scheme Ashok Nagar', time: '25 mins ago', status: 'In Review' },
    { id: 'REP-4075', category: 'Traffic Signal Power', location: 'Ajmer Road Flyover', time: '1 hour ago', status: 'Resolved' },
  ];

  return (
    <div className="relative z-20 min-h-screen px-4 sm:px-8 py-8 pt-24 max-w-7xl mx-auto space-y-8 text-slate-800 pointer-events-auto">
      {/* Page Title */}
      <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 sm:p-8 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 animate-slide-up">
        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-extrabold tracking-[0.2em] uppercase">
          <FileText className="w-4 h-4" />
          <span>Citizen Telemetry & Reporting</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]">
          Submit Civic Issue Report
        </h1>
        <p className="text-slate-500 text-[11px] max-w-2xl leading-relaxed font-medium">
          Report urban disruptions directly into the Jaipur AI prediction pipeline to accelerate municipal dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-6 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 sm:p-8 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-5 stagger-1">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            File New Incident Report
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/50 ring-1 ring-emerald-200/20 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight">Report Submitted Successfully!</h3>
              <p className="text-[11px] text-emerald-700 font-medium">Ticket #REP-4095 created. Telemetry routed to Jaipur Ward Command.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[11px] font-bold transition-all duration-300 ease-premium cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-[11px] font-medium">
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 text-[10px] tracking-[0.15em] uppercase">Incident Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/50 ring-1 ring-black/[0.03] text-slate-800 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                >
                  <option>Waterlogging</option>
                  <option>Drainage Blockage</option>
                  <option>Traffic Disruption</option>
                  <option>Power Outage</option>
                  <option>Pothole / Road Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1.5 text-[10px] tracking-[0.15em] uppercase">Location / Ward</label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. MI Road Sector 2"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/50 ring-1 ring-black/[0.03] text-slate-800 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1.5 text-[10px] tracking-[0.15em] uppercase">Incident Details</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe severity, water height, or road blockage..."
                  className="w-full p-4 bg-slate-50/80 rounded-xl border border-slate-200/50 ring-1 ring-black/[0.03] text-slate-800 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300 ease-premium cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Send className="w-4 h-4" />
                <span>Submit Telemetry Report</span>
              </button>
            </form>
          )}
        </div>

        {/* Active Ticket Tracker */}
        <div className="lg:col-span-6 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 sm:p-8 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-4 stagger-2">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Incident Log</h2>
          <div className="space-y-3">
            {activeReports.map((rep) => (
              <div key={rep.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/40 ring-1 ring-black/[0.03] flex items-center justify-between premium-hover">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[11px] text-slate-900 data-value">{rep.id}</span>
                    <span className="text-[9px] bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded-md font-bold">{rep.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{rep.location}</p>
                  <span className="text-[9px] text-slate-400 font-semibold">{rep.time}</span>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${
                  rep.status === 'Dispatched' ? 'bg-rose-100/80 text-rose-700' : rep.status === 'Resolved' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-amber-100/80 text-amber-700'
                }`}>
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
