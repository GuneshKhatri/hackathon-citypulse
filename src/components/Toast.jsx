import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed top-20 right-6 z-[99999] pointer-events-auto animate-slide-up">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] text-slate-800 text-[11px] font-semibold max-w-sm">
        {getIcon()}
        <span className="flex-1 leading-snug">{toast.message}</span>
        <button
          onClick={onClose}
          tabIndex={0}
          aria-label="Close Notification"
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
