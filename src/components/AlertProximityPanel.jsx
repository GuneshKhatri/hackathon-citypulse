import React from 'react';

export default function AlertProximityPanel({
  distance = '4.1 km',
  locationName = 'Vaishali Nagar',
  incidentTitle = '⚠ WATERLOGGING DETECTED',
  incidentDescription = 'Severe water accumulation has been reported around arterial low points and underpasses.',
  updatedTime = 'UPDATED 12 MIN AGO',
  precautionTitle = '⚠ AVOID LOW-LYING CORRIDORS',
  precautionDescription = 'Kings Road underpasses and nearby low-lying connecting roads may be affected.',
  onViewAlertZone
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-auto min-h-fit flex flex-col p-6 shrink-0 animate-in fade-in duration-300">
      
      {/* 2. DISTANCE HERO SECTION */}
      <div className="flex flex-col">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-1 block">
          YOUR DISTANCE FROM ALERT
        </span>
        <div className="text-6xl font-semibold text-slate-900 tracking-tight leading-none py-1 my-1">
          {distance}
        </div>
        <p className="text-slate-500 text-sm font-medium mt-1">
          from {locationName}
        </p>
      </div>

      {/* 3. GEOGRAPHIC CONNECTION VISUALIZATION */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
          {/* Left: You Are Here */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
            <span>YOU ARE HERE</span>
          </div>

          {/* Middle: Horizontal Line with Centered Distance Label */}
          <div className="flex-grow h-px bg-slate-300 relative flex items-center justify-center mx-1">
            <span className="bg-white px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              {distance}
            </span>
          </div>

          {/* Right: Alert Area */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
            <span>ALERT AREA</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200/60 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>OUTSIDE IMMEDIATE ALERT AREA</span>
        </div>
      </div>

      {/* 4. SEPARATOR */}
      <hr className="border-slate-100 my-6" />

      {/* 5. INCIDENT SUMMARY (Editorial Style) */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wider text-slate-500 font-bold uppercase">
            INCIDENT SUMMARY
          </span>
          <span className="text-xs text-red-500 font-medium tracking-wide flex items-center gap-1">
            <span>●</span> {updatedTime}
          </span>
        </div>
        
        <div className="border-l-2 border-red-500 pl-4 mt-3">
          <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
            {incidentTitle}
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-normal break-words whitespace-normal">
            {incidentDescription}
          </p>
        </div>
      </div>

      {/* 6. SEPARATOR */}
      <hr className="border-slate-100 my-6" />

      {/* 7. AI INTELLIGENCE ("WHAT THIS MEANS FOR YOU") */}
      <div>
        <h4 className="text-xs tracking-wider text-slate-500 font-bold mb-3 uppercase">
          WHAT THIS MEANS FOR YOU
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed font-normal break-words whitespace-normal">
          You are {distance} from the selected alert zone. Check affected corridors before travelling through the area.
        </p>
      </div>

      {/* 8. SEPARATOR */}
      <hr className="border-slate-100 my-6" />

      {/* 9. TRAVEL PRECAUTION */}
      <div>
        <h4 className="text-xs tracking-wider text-slate-500 font-bold mb-3 uppercase">
          TRAVEL PRECAUTION
        </h4>
        <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-100/50">
          <h5 className="text-sm font-bold text-amber-700 mb-1 leading-snug">
            {precautionTitle}
          </h5>
          <p className="text-sm text-slate-700 leading-relaxed font-normal break-words whitespace-normal">
            {precautionDescription}
          </p>
        </div>
      </div>

      {/* 10. PRIMARY ACTION BUTTON */}
      <button
        onClick={onViewAlertZone}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 flex flex-col items-center justify-center transition-colors shadow-md mt-6 cursor-pointer group shrink-0"
      >
        <span className="text-sm font-bold tracking-wide flex items-center gap-1.5">
          <span>◉</span> VIEW ALERT ZONE ON MAP
        </span>
        <span className="text-xs text-slate-400 mt-1 font-normal group-hover:text-slate-300">
          See affected area and your distance
        </span>
      </button>
    </div>
  );
}
