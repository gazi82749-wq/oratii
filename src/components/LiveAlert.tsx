'use client';
import { useState, useEffect } from 'react';

// Non-intrusive floating notification for real-time coaching (Module 6)
export default function LiveAlert({ message, severity = 'warning', icon, onDismiss, duration = 4000 }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const severityStyles = {
    warning: 'bg-[#FFF9D2] border-slate-900 text-slate-900',
    danger: 'bg-[#FFE4E6] border-slate-900 text-slate-900',
    info: 'bg-[#E0F2FE] border-slate-900 text-slate-900',
    success: 'bg-[#DCFCE7] border-slate-900 text-slate-900'
  };

  const severityIcons = {
    warning: 'âš ï¸',
    danger: 'ðŸ”´',
    info: 'â„¹ï¸',
    success: 'âœ…'
  };

  return (
    <div className={`live-alert ${exiting ? 'exiting' : ''} ${severityStyles[severity]} border-4 px-5 py-4 shadow-[4px_4px_0px_#151930] flex items-center gap-4 max-w-xs rotate-1 relative`}>
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/50 border border-indigo-300 -rotate-2"></div>
      <span className="text-xl flex-shrink-0">{icon || severityIcons[severity]}</span>
      <p className="text-sm font-black leading-snug">{message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss?.(), 300); }}
        className="text-lg opacity-50 hover:opacity-100 flex-shrink-0 font-black ml-auto border-2 border-transparent hover:border-slate-900 rounded-full w-6 h-6 flex items-center justify-center transition-all"
      >
        âœ•
      </button>
    </div>
  );
}

// Alert stack container
export function LiveAlertStack({ alerts, onDismiss }) {
  return (
    <div className="live-alert-stack">
      {alerts.map((alert) => (
        <LiveAlert
          key={alert.id}
          message={alert.message}
          severity={alert.severity}
          icon={alert.icon}
          duration={alert.duration}
          onDismiss={() => onDismiss(alert.id)}
        />
      ))}
    </div>
  );
}
