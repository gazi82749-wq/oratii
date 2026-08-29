'use client';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Time-series confidence/metrics chart (Module 3, 8)
export default function ConfidenceGraph({
  data = [],
  events = [],
  type = 'line', // 'line' | 'area'
  dataKey = 'confidence',
  label = 'Confidence',
  color = '#6c5ce7',
  height = 200,
  showEvents = true
}) {
  const CustomTooltip = ({ active, payload, label: tooltipLabel }: any) => {
    if (active && payload && payload.length) {
      const matchingEvent = events.find((e: any) => e.timestamp === tooltipLabel);
      return (
        <div className="custom-tooltip">
          <p className="font-bold text-slate-800">{formatTime(tooltipLabel)}</p>
          <p style={{ color }}>{label}: <strong>{payload[0].value}%</strong></p>
          {matchingEvent && (
            <p className="text-xs text-slate-500 mt-1 border-t border-indigo-100 pt-1">
              ðŸ“Œ {matchingEvent.message || matchingEvent.type}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
          <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />

          {/* Event markers as reference lines */}
          {showEvents && events.map((event, idx) => (
            <ReferenceLine
              key={idx}
              x={event.timestamp}
              stroke={getEventColor(event.type)}
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
          ))}

          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`${color}20`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
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
