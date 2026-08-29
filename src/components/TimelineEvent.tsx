'use client';
import { EVENT_LABELS, EVENT_SEVERITY } from '../lib/sessionRecorder';

// Timeline event marker for Presentation Replay (Module 3)
export default function TimelineEvent({ event, isActive, onClick }) {
  const severity = EVENT_SEVERITY[event.type] || 'info';
  const label = EVENT_LABELS[event.type] || event.type;

  const severityStyles = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' }
  };

  const styles = severityStyles[severity];

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
        isActive ? `${styles.bg} ${styles.border} shadow-sm` : 'bg-white border-indigo-100 hover:border-indigo-200'
      }`}
    >
      {/* Time Badge */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
        <span className="text-xs font-mono font-bold text-slate-500">{event.time}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${isActive ? styles.text : 'text-slate-700'}`}>{label}</p>
        {event.message && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{event.message}</p>
        )}
        {event.wpm && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 rounded text-[9px] font-bold text-slate-500">
            {event.wpm} WPM
          </span>
        )}
        {event.value !== undefined && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 rounded text-[9px] font-bold text-slate-500">
            {event.value}%
          </span>
        )}
      </div>
    </div>
  );
}

// Timeline event list container
export function TimelineEventList({ events, activeTimestamp, onEventClick }) {
  return (
    <div className="space-y-2">
      {events.map((event, idx) => (
        <TimelineEvent
          key={idx}
          event={event}
          isActive={activeTimestamp === event.timestamp}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
}
