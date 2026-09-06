'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, FileText, Video, GraduationCap, Zap, Brain, TrendingUp, BarChart3, Sparkles, Briefcase, Flame, Check } from 'lucide-react';

// ─── Module Definitions (3 Core AI Showcase Modules) ───
const modules = [
  { id: 'speech', label: 'Speech Coach', icon: Mic, color: '#FF6B35', accent: '#FFA62B', bg: '#FFF5ED', gradient: 'from-orange-400 to-rose-500' },
  { id: 'interview', label: 'AI Mock Interviewer', icon: Briefcase, color: '#F59E0B', accent: '#FBBF24', bg: '#FFFBEB', gradient: 'from-amber-400 to-orange-500' },
  { id: 'presentation', label: 'Slide & Viva Studio', icon: Video, color: '#7C3AED', accent: '#A78BFA', bg: '#F5F3FF', gradient: 'from-indigo-500 to-indigo-600' },
];

// ─── Cinematic Waveform ───
function CinematicWaveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 400, h = 80;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const bars = 48;
      const barW = (w / bars) * 0.6;
      const gap = w / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * gap + gap * 0.2;
        const amplitude = active ? 0.8 : 0.1;
        const noise = Math.sin(i * 0.3 + t * 0.04) * Math.cos(i * 0.15 + t * 0.02) * amplitude;
        const h2 = Math.max(3, (noise + amplitude) * (h * 0.45));
        const y = (h - h2) / 2;

        const grad = ctx.createLinearGradient(x, y, x, y + h2);
        const alpha = active ? 0.6 + noise * 0.4 : 0.15;
        grad.addColorStop(0, `rgba(255, 107, 53, ${alpha * 0.4})`);
        grad.addColorStop(0.5, `rgba(255, 107, 53, ${alpha})`);
        grad.addColorStop(1, `rgba(255, 166, 43, ${alpha * 0.4})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h2, barW / 2);
        ctx.fill();
      }
      t++;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  return <canvas ref={canvasRef} className="w-full h-20" style={{ width: '100%', height: '80px' }} />;
}

// ─── Animated Ring Score ───
function RingScore({ value, label, color, delay = 0 }: { value: number; label: string; color: string; delay?: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 2;
        if (start > value) { setProgress(value); return; }
        setProgress(start);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const r = 22, c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 -rotate-90" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" className="text-indigo-100" strokeWidth="4" />
          <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-100" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs sm:text-sm font-black text-slate-800">{progress}%</span>
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Floating Particle Dots ───
function FloatingDots({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full opacity-30"
          style={{
            backgroundColor: color,
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float-dot ${3 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Frame 1: Speech Coach (Cinematic) ───
function SpeechFrame() {
  const [phase, setPhase] = useState<'rec' | 'done'>('rec');
  useEffect(() => {
    const t = setTimeout(() => setPhase('done'), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-5 relative">
      <FloatingDots color="#FF6B35" />

      {/* Status chip */}
      <div className="flex items-center gap-2">
        <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
          phase === 'rec' ? 'bg-gradient-to-r from-rose-500/15 to-orange-500/10 text-rose-600 border border-rose-200/50' : 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-600 border border-emerald-200/50'
        }`}>
          <span className={`w-2 h-2 rounded-full ${phase === 'rec' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
            {phase === 'rec' && <span className="absolute inset-0 w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </span>
          {phase === 'rec' ? 'Recording' : 'Analysis Complete'}
        </div>
      </div>

      {/* Cinematic Waveform */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-2xl border border-orange-200/40 p-4 shadow-sm shadow-orange-100/30 overflow-hidden">
        <CinematicWaveform active={phase === 'rec'} />
      </div>

      {/* Results — 3 Ring Scores */}
      <div className={`flex items-center justify-around transition-all duration-700 ease-out ${
        phase === 'done' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
      }`}>
        <RingScore value={92} label="Score" color="#FF6B35" delay={0} />
        <div className="w-px h-12 bg-orange-200/60" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-black bg-gradient-to-br from-orange-600 to-rose-600 bg-clip-text text-transparent">142</span>
          </div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">WPM</span>
        </div>
        <div className="w-px h-12 bg-orange-200/60" />
        <RingScore value={85} label="Clarity" color="#FFA62B" delay={200} />
      </div>
    </div>
  );
}

// ─── Frame 2: Live PPT Presenter Studio (Cinematic) ───
function PresentationFrame() {
  const [phase, setPhase] = useState<'scan' | 'live'>('scan');
  const [scanLine, setScanLine] = useState(0);

  // Cycle phase smoothly: scan -> live -> scan -> live
  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev === 'scan' ? 'live' : 'scan'));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Laser scan line movement during 'scan' phase
  useEffect(() => {
    if (phase !== 'scan') return;
    const interval = setInterval(() => setScanLine((p) => (p >= 100 ? 0 : p + 5)), 30);
    return () => clearInterval(interval);
  }, [phase]);

  const metrics = [
    { label: 'Slide Density', value: 88, color: '#7C3AED', icon: BarChart3 },
    { label: 'Pacing WPM', value: 142, color: '#A78BFA', icon: TrendingUp },
    { label: 'Text Clarity', value: 94, color: '#6D28D9', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col gap-3.5 relative">
      <FloatingDots color="#7C3AED" />

      {/* Dynamic Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all duration-500 ${
            phase === 'scan'
              ? 'bg-indigo-500/15 text-indigo-900 border border-indigo-200/60'
              : 'bg-emerald-500/15 text-emerald-700 border border-emerald-200/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${phase === 'scan' ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
            <span>{phase === 'scan' ? '1. AI Slide Audit Scanning...' : '2. Live PPT Presenter Studio'}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-extrabold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
          {phase === 'scan' ? 'Scanning Deck' : 'Slide 3 / 12'}
        </span>
      </div>

      {/* Main Stage Display Area (Smoothly Cross-Fading between Scan Grid & Live Presenter Stage) */}
      <div className="relative min-h-[140px] overflow-hidden rounded-2xl">
        {/* PHASE 1: SLIDE AUDIT SCAN GRID */}
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50/40 border border-indigo-200/50 p-3 rounded-2xl flex flex-col justify-between transition-all duration-700 ease-out ${
          phase === 'scan'
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto blur-0'
            : 'opacity-0 scale-95 -translate-y-3 pointer-events-none blur-xs'
        }`}>
          {/* Laser Scanner Line */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-20 pointer-events-none shadow-lg shadow-indigo-500/50 transition-all duration-75"
            style={{ top: `${scanLine}%` }}
          />
          <div className="flex items-center justify-between text-[9px] font-extrabold text-indigo-900 border-b border-indigo-100 pb-1 mb-1">
            <span>Evaluating Slide Density & Structural Flow...</span>
            <span className="text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">Score: 94/100</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 my-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`aspect-[16/10] rounded-lg border p-1 flex flex-col justify-between relative bg-white transition-all ${
                i === 3 ? 'border-indigo-400 ring-2 ring-indigo-300' : 'border-indigo-100'
              }`}>
                <div className="h-1 bg-indigo-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-0.5 bg-indigo-100 rounded w-full"></div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[6px] font-bold text-slate-400">S{i}</span>
                  <span className="text-[5px] text-emerald-700 font-bold bg-emerald-100 rounded-full px-1">OK</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[8px] font-bold text-indigo-700 bg-white/90 p-1 rounded border border-indigo-100 flex items-center justify-between">
            <span>Slide 3 passed audit. Launching live presenter...</span>
            <span className="text-emerald-600 font-extrabold">Ready ➔</span>
          </div>
        </div>

        {/* PHASE 2: LIVE PRESENTATION STAGE WITH WEBCAM PIP */}
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-3 rounded-2xl text-white flex flex-col justify-between transition-all duration-700 ease-out ${
          phase === 'live'
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto blur-0'
            : 'opacity-0 scale-95 translate-y-3 pointer-events-none blur-xs'
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-[10px] font-extrabold text-indigo-200 truncate">Slide 3: Executive Growth Strategy</span>
            </div>
            <span className="text-[8px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.2 rounded-full">
              Slide Deck Studio
            </span>
          </div>

          <div className="flex justify-between items-center my-1 relative">
            <div className="space-y-1.5 max-w-[62%]">
              <div className="h-2.5 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-1.5 bg-indigo-200/50 rounded-full w-full"></div>
              <div className="h-1.5 bg-indigo-200/40 rounded-full w-5/6"></div>
            </div>

            {/* Webcam Presenter PIP */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-950 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Presenter Webcam Feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0.5 right-0.5 px-1 py-0.1 bg-slate-900/90 rounded text-[6px] font-bold text-emerald-400 flex items-center gap-1 border border-emerald-500/40">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> CAM
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[8.5px] font-bold text-indigo-200">
            <span className="text-emerald-400">142 WPM</span>
            <span className="text-amber-300">0 Fillers</span>
            <span className="text-indigo-300">94% Clarity</span>
          </div>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="flex flex-col gap-2 transition-all duration-700 ease-out">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                <Icon size={12} style={{ color: m.color }} />
              </div>
              <span className="text-[11px] font-bold text-slate-600 w-24 shrink-0">{m.label}</span>
              <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${m.value > 100 ? 92 : m.value}%`,
                    backgroundColor: m.color,
                    transitionDelay: `${i * 150}ms`,
                  }}
                />
              </div>
              <span className="text-xs font-black text-slate-700 w-8 text-right tabular-nums">
                {m.label.includes('WPM') ? `${m.value}` : `${m.value}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Frame 3: AI Voice Mock Interviewer (Cinematic) ───
function InterviewFrame() {
  const [phase, setPhase] = useState<'q' | 'rec' | 'done'>('q');
  const [typed, setTyped] = useState('');
  const question = "Tell me about a complex system architecture decision you made under deadline pressure.";

  useEffect(() => {
    setPhase('q'); setTyped('');
    const t1 = setTimeout(() => setPhase('rec'), 1500);
    const t2 = setTimeout(() => setPhase('done'), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (typed.length >= question.length) return;
    const t = setTimeout(() => setTyped(question.slice(0, typed.length + 1)), 20);
    return () => clearTimeout(t);
  }, [typed, question]);

  return (
    <div className="flex flex-col gap-4 relative">
      <FloatingDots color="#F59E0B" />

      {/* AI Interviewer Header with Resume Chip */}
      <div className="flex items-center justify-between border-b border-amber-100 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Briefcase size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">AI Voice Interviewer</div>
            <div className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest">Unscripted Discussion</div>
          </div>
        </div>

        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Check size={10} className="stroke-[3]" /> Resume PDF Loaded
        </span>
      </div>

      {/* Interactive Speech Question Bubble */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200/50 p-4 shadow-sm relative">
        <div className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest mb-1 flex items-center justify-between">
          <span>Round 3: Technical Deep Dive</span>
          {phase === 'rec' && (
            <span className="text-rose-500 font-bold flex items-center gap-1 text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> LISTENING...
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-800 leading-relaxed min-h-[38px]">
          &quot;{typed}
          {typed.length < question.length && (
            <span className="inline-block w-0.5 h-3.5 bg-amber-500 ml-0.5 align-middle animate-pulse" />
          )}
        </p>
      </div>

      {/* STAR Scorecard Results */}
      <div className={`transition-all duration-700 ease-out ${
        phase === 'done' ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-sm'
      }`}>
        <div className="flex items-center justify-around bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
          <RingScore value={92} label="Technical" color="#F59E0B" delay={0} />
          <div className="w-px h-10 bg-amber-200/60" />
          <RingScore value={88} label="STAR Method" color="#10B981" delay={150} />
          <div className="w-px h-10 bg-amber-200/60" />
          <RingScore value={95} label="Clarity" color="#6366F1" delay={300} />
        </div>
      </div>
    </div>
  );
}

// ─── Main HeroShowcase ───
export default function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOut, setIsOut] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  const cycleNext = useCallback(() => {
    setIsOut(true);
    setTimeout(() => {
      setActiveIndex(p => (p + 1) % modules.length);
      setFrameKey(k => k + 1);
      setIsOut(false);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleNext, 5000);
    return () => clearInterval(interval);
  }, [cycleNext]);

  const current = modules[activeIndex];
  const CurrentIcon = current.icon;

  const renderFrame = () => {
    switch (current.id) {
      case 'speech': return <SpeechFrame key={frameKey} />;
      case 'presentation': return <PresentationFrame key={frameKey} />;
      case 'interview': return <InterviewFrame key={frameKey} />;
      default: return <SpeechFrame key={frameKey} />;
    }
  };

  return (
    <div className="w-full relative group aspect-[4/3]">
      {/* Dynamic glow behind card */}
      <div className="absolute -inset-6 rounded-3xl transition-all duration-1000 blur-3xl opacity-50"
        style={{ background: `radial-gradient(circle at 60% 40%, ${current.color}55, ${current.accent}30, transparent 70%)` }}
      />

      {/* Main Card */}
      <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-2xl rounded-3xl border border-indigo-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">

        {/* Header with Glass Effect */}
        <div className="bg-gradient-to-r from-indigo-50/90 to-white/90 backdrop-blur-xl px-3 sm:px-5 py-3 border-b border-indigo-200/50 flex items-center justify-between gap-1 overflow-hidden shrink-0">
          {/* Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57] shadow-xs" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] shadow-xs" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840] shadow-xs" />
          </div>

          {/* Module Tabs */}
          <div className="flex items-center bg-indigo-100/90 rounded-xl p-1 gap-0.5 overflow-x-auto no-scrollbar">
            {modules.map((m, i) => {
              const Icon = m.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (i !== activeIndex) {
                      setIsOut(true);
                      setTimeout(() => { setActiveIndex(i); setFrameKey(k => k + 1); setIsOut(false); }, 400);
                    }
                  }}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={12} />
                  <span>{m.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Live Demo Pill */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#1B2140] to-[#F2A93B] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm shrink-0">
            <Zap size={8} />
            Live
          </div>
        </div>

        {/* Module Title Bar */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${current.color}20, ${current.color}05)` }}>
            <CurrentIcon size={16} style={{ color: current.color }} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{current.label}</div>
            <div className="text-[10px] font-semibold text-slate-400">{modules[activeIndex].id === 'speech' ? 'Real-time voice analysis' : modules[activeIndex].id === 'presentation' ? 'AI-powered deck feedback' : 'Mock defense simulator'}</div>
          </div>
        </div>

        {/* Frame Content */}
        <div className="flex-1 relative w-full overflow-hidden">
          <div className={`absolute inset-0 px-6 pb-5 flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOut ? 'opacity-0 scale-[0.96] translate-y-3 blur-[2px]' : 'opacity-100 scale-100 translate-y-0 blur-0'
          }`}>
            {renderFrame()}
          </div>
        </div>

        {/* Bottom Progress Track */}
        <div className="h-1 bg-indigo-100 relative overflow-hidden shrink-0 mt-auto">
          <div className="h-full rounded-r-full" style={{
            background: `linear-gradient(90deg, ${current.color}, ${current.color}aa)`,
            animation: 'showcase-progress 5s linear infinite',
          }} />
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes showcase-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes float-dot {
          from { transform: translateY(0px) scale(1); opacity: 0.2; }
          to { transform: translateY(-12px) scale(1.3); opacity: 0.5; }
        }
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
