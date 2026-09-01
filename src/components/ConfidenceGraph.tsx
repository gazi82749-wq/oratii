'use client';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Time-series confidence/metrics chart (Module 3, 8)
// Circular Gauge Score Ring (Module 3, 8)
export function ScoreRing({ 
  value = 85, 
  max = 100, 
  size = 72, 
  strokeWidth = 7, 
  color = '#6c5ce7', 
  label = 'Score',
  unit = ''
}: { 
  value?: number; 
  max?: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string; 
  label?: string; 
  unit?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const strokeDashoffset = circumference - (normalizedValue / max) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-sm font-black text-slate-900 leading-none">{value}</span>
          {unit && <span className="text-[8px] font-bold text-slate-400">{unit}</span>}
        </div>
      </div>
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

// Time-series confidence/metrics chart (Module 3, 8)
export default function ConfidenceGraph({
  data = [],
  events = [],
  type = 'area', // 'line' | 'area'
  dataKey = 'confidence',
  label = 'Pace',
  color = '#6c5ce7',
  height = 220,
  showEvents = true,
  onSeekAudio
}: {
  data?: any[];
  events?: any[];
  type?: 'line' | 'area';
  dataKey?: string;
  label?: string;
  color?: string;
  height?: number;
  showEvents?: boolean;
  onSeekAudio?: (timestamp: number) => void;
}) {
  const CustomTooltip = ({ active, payload, label: tooltipLabel }: any) => {
    if (active && payload && payload.length) {
      const matchingEvent = events.find((e: any) => e.timestamp === tooltipLabel);
      return (
        <div 
          className={`bg-slate-950/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs flex flex-col gap-1 ${onSeekAudio ? 'cursor-pointer' : ''}`}
          onClick={() => onSeekAudio && typeof tooltipLabel === 'number' && onSeekAudio(tooltipLabel)}
        >
          <div className="flex items-center justify-between gap-3 text-slate-400 text-[10px] font-mono border-b border-slate-800 pb-1">
            <span>⏱ {formatTime(tooltipLabel)}</span>
            {onSeekAudio && <span className="text-amber-400 font-bold">▶ Jump Audio</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
            <span className="font-extrabold text-white">{label}: {payload[0].value} {label.includes('Pace') ? 'WPM' : '%'}</span>
          </div>
          {matchingEvent && (
            <p className="text-[11px] font-semibold text-amber-300 mt-1 pt-1 border-t border-slate-800/80">
              📌 {matchingEvent.message || matchingEvent.type}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const gradientId = `areaGradient_${color.replace('#', '')}`;

  return (
    <div className="w-full flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent 
          data={data} 
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          onClick={(state: any) => {
            if (onSeekAudio && state && state.activeLabel !== undefined) {
              const ts = typeof state.activeLabel === 'number' ? state.activeLabel : parseFloat(state.activeLabel);
              if (!isNaN(ts)) onSeekAudio(ts);
            }
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />

          {/* Event markers as reference lines */}
          {showEvents && events.map((event, idx) => (
            <ReferenceLine
              key={idx}
              x={event.timestamp}
              stroke={getEventColor(event.type)}
              strokeDasharray="4 4"
              strokeWidth={2}
              onClick={() => onSeekAudio && onSeekAudio(event.timestamp)}
              className={onSeekAudio ? 'cursor-pointer hover:stroke-width-3' : ''}
            />
          ))}

          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>

      {/* Clickable Event Pills Bar */}
      {showEvents && events.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/80">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Events:</span>
          {events.map((e, idx) => (
            <button
              key={idx}
              onClick={() => onSeekAudio && onSeekAudio(e.timestamp)}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getEventColor(e.type) }}></span>
              <span>{formatTime(e.timestamp)}</span>
              <span className="text-slate-500 font-normal">({e.message || e.type})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Multi-metric chart for dashboard â”€â”€â”€
export function MultiMetricChart({ data = [], metrics = [], height = 250 }) {
  const defaultMetrics = [
    { key: 'confidence', label: 'Confidence', color: '#6c5ce7' },
    { key: 'eyeContact', label: 'Eye Contact', color: '#00cec9' },
    { key: 'pace', label: 'Pace', color: '#fd79a8' }
  ];

  const activeMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '11px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            labelFormatter={formatTime}
          />
          {activeMetrics.map(metric => (
            <Line
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              stroke={metric.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: metric.color }}
              name={metric.label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// â”€â”€â”€ Helpers â”€â”€â”€
function formatTime(seconds) {
  if (typeof seconds !== 'number') return seconds;
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getEventColor(type) {
  const colors = {
    eye_contact_lost: '#ff7675',
    speaking_fast: '#fdcb6e',
    confidence_drop: '#ff7675',
    excellent_moment: '#00b894',
    filler_word: '#fdcb6e',
    long_pause: '#fdcb6e',
    slide_change: '#74b9ff'
  };
  return colors[type] || '#94a3b8';
}
