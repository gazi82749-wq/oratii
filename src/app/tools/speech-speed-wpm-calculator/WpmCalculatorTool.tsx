'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface BenchmarkPrompt {
  id: string;
  title: string;
  category: string;
  targetWpm: number;
  wordCount: number;
  text: string;
}

const BENCHMARK_PROMPTS: BenchmarkPrompt[] = [
  {
    id: 'fresher-intro',
    title: '60-Second Fresher Introduction',
    category: 'Interview Prep',
    targetWpm: 140,
    wordCount: 140,
    text: 'Hello, my name is Alex and I recently completed my degree in Computer Science with a focus on web technologies. During my final year, I led a four-person capstone project where we developed an inventory optimization dashboard using React and Node.js. One of our biggest milestones was reducing data query latency by over thirty percent through smart caching. Outside of academic coursework, I actively participate in open-source hackathons and solve algorithmic challenges. I am eager to bring my strong problem-solving mindset, collaborative work ethic, and passion for building scalable web applications to your engineering team as a software associate.',
  },
  {
    id: 'star-answer',
    title: 'STAR Method Behavioral Story',
    category: 'Behavioral Round',
    targetWpm: 145,
    wordCount: 152,
    text: 'During our semester final deployment, our primary database server crashed just four hours before the project submission deadline. As the team coordinator, my objective was to restore the database without losing any submitted client records while keeping our team calm. I immediately initiated our rollback protocol, restored the data from our latest hourly snapshot on our backup cluster, and isolated the offending migration script that caused the memory overflow. We verified full data integrity with twenty minutes to spare and successfully presented our live demo. This experience reinforced the immense value of automated backups and calm crisis communication under strict time constraints.',
  },
  {
    id: 'keynote-opening',
    title: 'Executive Keynote Opening',
    category: 'Public Speaking',
    targetWpm: 125,
    wordCount: 131,
    text: 'Good morning everyone. Look around this room today. Five years ago, the problems we are discussing this morning did not exist in any business textbook. Today, technological innovation is not merely accelerating our products; it is fundamentally transforming how our customers make everyday decisions. In the next twenty minutes, I will share three practical observations from our latest research, and outline why teams that embrace deliberate, thoughtful communication will consistently outperform those that merely react to daily market noise.',
  },
];

const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'literally', 'so', 'sort of', 'kind of'];

function getPaceVerdict(wpm: number): {
  category: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  status: 'slow' | 'conversational' | 'ideal' | 'fast' | 'rushed';
} {
  if (wpm === 0) {
    return {
      category: 'Ready to Test',
      badgeBg: 'bg-slate-100',
      badgeBorder: 'border-slate-200',
      badgeText: 'text-slate-700',
      description: 'Start speaking or reading to measure your real-time words per minute.',
      status: 'ideal',
    };
  }
  if (wpm < 110) {
    return {
      category: 'Too Slow / Hesitant',
      badgeBg: 'bg-blue-50',
      badgeBorder: 'border-blue-200',
      badgeText: 'text-blue-700',
      description: 'Pacing feels disconnected or hesitant. Listeners may lose engagement. Aim for 130–150 WPM.',
      status: 'slow',
    };
  }
  if (wpm < 130) {
    return {
      category: 'Deliberate / Technical Pace',
      badgeBg: 'bg-cyan-50',
      badgeBorder: 'border-cyan-200',
      badgeText: 'text-cyan-700',
      description: 'Great for explaining complex technical architectures or high-density code, but slightly slow for everyday conversation.',
      status: 'conversational',
    };
  }
  if (wpm <= 155) {
    return {
      category: 'Ideal Conversational & Interview Pace',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      description: 'The golden standard. Clear, confident, authoritative, and easy for recruiters to digest without cognitive strain.',
      status: 'ideal',
    };
  }
  if (wpm <= 175) {
    return {
      category: 'Energetic / Fast Presentation',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-800',
      description: 'Dynamic and passionate, but borderlining on rushed. Make sure to pause after periods to let key points sink in.',
      status: 'fast',
    };
  }
  return {
    category: 'Too Fast / Nervous Rushing',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-700',
    description: 'Recruiters often perceive 175+ WPM as nervous rushing. Slow down, take full breaths, and use silent pauses instead of filler words.',
    status: 'rushed',
  };
}

export default function WpmCalculatorTool() {
  const [activeTab, setActiveTab] = useState<'live' | 'read-along' | 'text'>('live');

  // --- Live Speech Recognition State ---
  const [isListening, setIsListening] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Read-Along Benchmark State ---
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [benchmarkSeconds, setBenchmarkSeconds] = useState(0);
  const [benchmarkDone, setBenchmarkDone] = useState(false);
  const benchmarkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Text & Duration Mode State ---
  const [manualText, setManualText] = useState(
    'Practice speaking with confidence and clarity. When you communicate in interviews, your pacing determines whether the interviewer perceives you as calm and authoritative or nervous and unprepared.'
  );
  const [manualDurationMinutes, setManualDurationMinutes] = useState(1);
  const [manualDurationSeconds, setManualDurationSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // --- Mode 1: Live Voice Recognition Logic ---
  const startLiveRecording = () => {
    setSpeechError(null);
    setLiveTranscript('');
    setLiveInterim('');
    setLiveSeconds(0);

    trackEvent('practice_session_start', {
      source: 'wpm_calculator_live',
    });

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or try the Read-Along Benchmark mode below.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        trackEvent('mic_permission_granted', { tool: 'wpm_calculator' });
        liveTimerRef.current = setInterval(() => {
          setLiveSeconds((prev) => prev + 1);
        }, 1000);
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        setLiveTranscript(final);
        setLiveInterim(interim);
      };

      rec.onerror = (event: any) => {
        console.warn('[WpmCalculator] Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser bar.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Recognition notice: ${event.error}. You can still use the Read-Along mode!`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (liveTimerRef.current) {
          clearInterval(liveTimerRef.current);
          liveTimerRef.current = null;
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error('[WpmCalculator] Failed to start:', err);
      setSpeechError('Could not access microphone. Please verify device permissions.');
      setIsListening(false);
    }
  };

  const stopLiveRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
    }
    setIsListening(false);
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
    }
    trackEvent('recording_complete', {
      seconds: liveSeconds,
      tool: 'wpm_calculator',
    });
  };

  const resetLiveRecording = () => {
    stopLiveRecording();
    setLiveTranscript('');
    setLiveInterim('');
    setLiveSeconds(0);
    setSpeechError(null);
  };

  // Compute live words & WPM
  const fullLiveText = useMemo(() => {
    return `${liveTranscript} ${liveInterim}`.trim();
  }, [liveTranscript, liveInterim]);

  const liveWordCount = useMemo(() => {
    if (!fullLiveText) return 0;
    return fullLiveText.split(/\s+/).filter((w) => w.length > 0).length;
  }, [fullLiveText]);

  const liveWpm = useMemo(() => {
    if (liveSeconds < 3 || liveWordCount === 0) return 0;
    const minutes = liveSeconds / 60;
    return Math.round(liveWordCount / minutes);
  }, [liveSeconds, liveWordCount]);

  const liveFillersFound = useMemo(() => {
    if (!fullLiveText) return [];
    const lower = fullLiveText.toLowerCase();
    const found: { word: string; count: number }[] = [];
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches && matches.length > 0) {
        found.push({ word: filler, count: matches.length });
      }
    }
    return found;
  }, [fullLiveText]);

  const totalLiveFillerCount = useMemo(() => {
    return liveFillersFound.reduce((sum, item) => sum + item.count, 0);
  }, [liveFillersFound]);

  // --- Mode 2: Read-Along Benchmark Logic ---
  const currentPrompt = BENCHMARK_PROMPTS[selectedPromptIdx];

  const startBenchmark = () => {
    setBenchmarkDone(false);
    setBenchmarkSeconds(0);
    setIsBenchmarkRunning(true);
    trackEvent('practice_session_start', {
      source: 'wpm_calculator_benchmark',
      prompt: currentPrompt.id,
    });

    if (benchmarkTimerRef.current) clearInterval(benchmarkTimerRef.current);
    benchmarkTimerRef.current = setInterval(() => {
      setBenchmarkSeconds((prev) => prev + 1);
    }, 1000);
  };

  const finishBenchmark = () => {
    setIsBenchmarkRunning(false);
    setBenchmarkDone(true);
    if (benchmarkTimerRef.current) {
      clearInterval(benchmarkTimerRef.current);
      benchmarkTimerRef.current = null;
    }
  };

  const resetBenchmark = () => {
    setIsBenchmarkRunning(false);
    setBenchmarkDone(false);
    setBenchmarkSeconds(0);
    if (benchmarkTimerRef.current) {
      clearInterval(benchmarkTimerRef.current);
      benchmarkTimerRef.current = null;
    }
  };

  const benchmarkCalculatedWpm = useMemo(() => {
    if (benchmarkSeconds === 0) return 0;
    const minutes = benchmarkSeconds / 60;
    return Math.round(currentPrompt.wordCount / minutes);
  }, [benchmarkSeconds, currentPrompt.wordCount]);

  // --- Mode 3: Manual Text Calculation Logic ---
  const manualWordCount = useMemo(() => {
    if (!manualText.trim()) return 0;
    return manualText.trim().split(/\s+/).filter(Boolean).length;
  }, [manualText]);

  const manualTotalSeconds = manualDurationMinutes * 60 + manualDurationSeconds;

  const manualCalculatedWpm = useMemo(() => {
    if (manualTotalSeconds === 0 || manualWordCount === 0) return 0;
    return Math.round(manualWordCount / (manualTotalSeconds / 60));
  }, [manualWordCount, manualTotalSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      if (benchmarkTimerRef.current) clearInterval(benchmarkTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Determine active WPM based on current tab
  const displayWpm =
    activeTab === 'live'
      ? liveWpm
      : activeTab === 'read-along'
      ? benchmarkDone
        ? benchmarkCalculatedWpm
        : 0
      : manualCalculatedWpm;

  const verdict = getPaceVerdict(displayWpm);

  // SVG Gauge Calculations (-90deg to +90deg arc)
  // 0 WPM = -90deg, 220 WPM = +90deg
  const clampedWpm = Math.min(Math.max(displayWpm, 0), 220);
  const needleAngle = -90 + (clampedWpm / 220) * 180;

  const copyResults = () => {
    const textToCopy = `My Speaking Pace on Oratii: ${displayWpm} WPM (${verdict.category})\nTested with the Free WPM Speech Speed Calculator at https://oratii.in/tools/speech-speed-wpm-calculator`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tab Navigation in Oratii Light Theme */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl mb-8 shadow-xs">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'live'
              ? 'bg-[#0F1426] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Mic size={16} className={activeTab === 'live' ? 'text-[#F2A93B]' : ''} /> Live Voice Test
        </button>
        <button
          onClick={() => setActiveTab('read-along')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'read-along'
              ? 'bg-[#0F1426] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <FileText size={16} className={activeTab === 'read-along' ? 'text-[#F2A93B]' : ''} /> Read-Along Challenge
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-[#0F1426] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Gauge size={16} className={activeTab === 'text' ? 'text-[#F2A93B]' : ''} /> Transcript Calculator
        </button>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Oratii Speedometer Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-slate-200/50 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Live Speech Speedometer
            </span>
          </div>

          {/* SVG Speedometer Gauge on Clean White Surface */}
          <div className="relative w-72 h-44 my-3 flex items-center justify-center">
            <svg viewBox="0 0 240 140" className="w-full h-full overflow-visible">
              {/* Background Base Arc */}
              <path
                d="M 20 120 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* 0 - 110 WPM: Deliberate / Slow (Blue) */}
              <path
                d="M 20 120 A 100 100 0 0 1 70 33"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.75"
              />

              {/* 110 - 130 WPM: Technical / Deliberate (Cyan) */}
              <path
                d="M 72 31 A 100 100 0 0 1 120 20"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="14"
                opacity="0.85"
              />

              {/* 130 - 155 WPM: Oratii Target Zone (Emerald Green #10B981) */}
              <path
                d="M 120 20 A 100 100 0 0 1 168 31"
                fill="none"
                stroke="#10B981"
                strokeWidth="18"
                opacity="1"
              />

              {/* 155 - 175 WPM: Energetic / Fast (Amber Gold #F2A93B) */}
              <path
                d="M 170 33 A 100 100 0 0 1 200 68"
                fill="none"
                stroke="#F2A93B"
                strokeWidth="14"
                opacity="0.9"
              />

              {/* 175+ WPM: Too Fast / Rushed (Rose Red) */}
              <path
                d="M 200 68 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="#EF4444"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Center Pivot Circle */}
              <circle cx="120" cy="120" r="11" fill="#0F1426" />
              <circle cx="120" cy="120" r="5" fill="#F2A93B" />

              {/* Needle */}
              <g
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transformOrigin: '120px 120px',
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <line
                  x1="120"
                  y1="120"
                  x2="120"
                  y2="28"
                  stroke="#0F1426"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="28" r="4" fill="#F2A93B" />
              </g>

              {/* Gauge Labels */}
              <text x="24" y="136" fill="#94A3B8" fontSize="10" fontWeight="bold">0</text>
              <text x="63" y="30" fill="#94A3B8" fontSize="9">110</text>
              <text x="110" y="13" fill="#10B981" fontSize="10" fontWeight="bold">145</text>
              <text x="170" y="30" fill="#F2A93B" fontSize="9">175</text>
              <text x="210" y="136" fill="#94A3B8" fontSize="10" fontWeight="bold">220+</text>
            </svg>
          </div>

          {/* WPM Readout */}
          <div className="flex items-baseline justify-center gap-1.5 my-1">
            <span className="text-5xl sm:text-6xl font-black text-[#0F1426] tracking-tight font-mono">
              {displayWpm}
            </span>
            <span className="text-lg font-black text-[#F2A93B] uppercase tracking-widest">
              WPM
            </span>
          </div>

          {/* Pace Category Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold my-2 ${verdict.badgeBg} ${verdict.badgeBorder} ${verdict.badgeText}`}
          >
            {verdict.category}
          </div>

          <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
            {verdict.description}
          </p>

          {/* Key Metric Cards */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                Target Cadence
              </span>
              <span className="text-sm font-black text-emerald-700">130 – 155 WPM</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                Filler Words
              </span>
              <span className={`text-sm font-black ${totalLiveFillerCount > 3 ? 'text-rose-600' : 'text-slate-800'}`}>
                {activeTab === 'live' ? `${totalLiveFillerCount} detected` : 'Voice Mode'}
              </span>
            </div>
          </div>

          {displayWpm > 0 && (
            <button
              onClick={copyResults}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? 'Copied to clipboard!' : 'Copy your pace score'}
            </button>
          )}
        </div>

        {/* Right Column: Active Mode Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 flex flex-col justify-between min-h-[460px]">
          {/* TAB 1: LIVE VOICE TEST */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-[#0F1426] flex items-center gap-2">
                    <Mic className="text-[#F2A93B]" size={20} />
                    Live Microphone Test
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
                    <Clock size={13} className="text-[#F2A93B]" />
                    <span>
                      {Math.floor(liveSeconds / 60)}:
                      {String(liveSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Click the button below and speak for 15–30 seconds. The calculator transcribes your speech live in your browser, measures elapsed time, and calculates your precise speaking cadence.
                </p>
              </div>

              {speechError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{speechError}</span>
                </div>
              )}

              {/* Live Transcript Display Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[140px] max-h-[200px] overflow-y-auto text-left relative">
                {fullLiveText ? (
                  <p className="text-sm text-slate-800 leading-relaxed font-sans">
                    <span>{liveTranscript}</span>
                    <span className="text-[#D98200] italic font-medium">{liveInterim}</span>
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6 text-slate-400">
                    <Volume2 size={24} className="mb-2 opacity-40 text-slate-400" />
                    <p className="text-xs">Your spoken words will appear here in real-time...</p>
                  </div>
                )}
              </div>

              {/* Filler Word Badges */}
              {liveFillersFound.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Detected Fillers:
                  </span>
                  {liveFillersFound.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-md text-[11px] font-bold text-rose-700"
                    >
                      &ldquo;{f.word}&rdquo; ({f.count})
                    </span>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!isListening ? (
                  <button
                    onClick={startLiveRecording}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer group"
                  >
                    <Mic size={18} className="text-[#F2A93B]" />
                    <span>Start Speaking (Free)</span>
                  </button>
                ) : (
                  <button
                    onClick={stopLiveRecording}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 animate-pulse transition-all cursor-pointer"
                  >
                    <Pause size={18} />
                    <span>Stop Recording</span>
                  </button>
                )}

                <button
                  onClick={resetLiveRecording}
                  disabled={liveSeconds === 0 && !fullLiveText}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition-colors font-bold text-xs cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: READ-ALONG BENCHMARK */}
          {activeTab === 'read-along' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-[#0F1426] flex items-center gap-2 mb-1">
                  <FileText className="text-[#F2A93B]" size={20} />
                  Read-Along Benchmark Test
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Select a standardized passage. Click <strong>&ldquo;Start Timer&rdquo;</strong>, read the passage aloud naturally, and click <strong>&ldquo;Finished!&rdquo;</strong> the moment you say the last word.
                </p>
              </div>

              {/* Prompt Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {BENCHMARK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={prompt.id}
                    onClick={() => {
                      setSelectedPromptIdx(idx);
                      resetBenchmark();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedPromptIdx === idx
                        ? 'bg-[#FEF7ED] border-[#F2A93B] text-[#D98200]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {prompt.title}
                  </button>
                ))}
              </div>

              {/* Benchmark Text Display */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left relative">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">{currentPrompt.category}</span>
                  <span>
                    Word Count: <strong className="text-slate-900">{currentPrompt.wordCount} words</strong> | Target:{' '}
                    <strong className="text-emerald-700">~{currentPrompt.targetWpm} WPM</strong>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {currentPrompt.text}
                </p>
              </div>

              {/* Benchmark Controls */}
              <div className="flex items-center gap-3">
                {!isBenchmarkRunning && !benchmarkDone && (
                  <button
                    onClick={startBenchmark}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer group"
                  >
                    <Play size={18} className="text-[#F2A93B]" />
                    <span>Start Reading Timer</span>
                  </button>
                )}

                {isBenchmarkRunning && (
                  <button
                    onClick={finishBenchmark}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 animate-pulse transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={18} />
                    <span>Finished Reading! ({benchmarkSeconds}s)</span>
                  </button>
                )}

                {benchmarkDone && (
                  <button
                    onClick={resetBenchmark}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw size={18} />
                    <span>Try Another Passage</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSCRIPT & DURATION CALCULATOR */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-[#0F1426] flex items-center gap-2 mb-1">
                  <Gauge className="text-[#F2A93B]" size={20} />
                  Transcript &amp; Audio Duration Calculator
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Paste your speech transcript or script, and specify how long your recorded audio or rehearsal took.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Paste Script or Speech Transcript
                </label>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#F2A93B] transition-colors leading-relaxed"
                  placeholder="Paste your interview answer, presentation script, or toast speech here..."
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Total words: <strong className="text-slate-900">{manualWordCount}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={manualDurationMinutes}
                    onChange={(e) => setManualDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#F2A93B]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={manualDurationSeconds}
                    onChange={(e) => setManualDurationSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#F2A93B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Conversion Bar directly linked into Oratii core apps */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FEF7ED]/60 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 sm:p-5 rounded-b-3xl">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#F2A93B]/40 flex items-center justify-center text-[#D98200] shrink-0 shadow-2xs">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Want Full AI Vocal Feedback?</p>
                <p className="text-[11px] text-slate-500">
                  Analyze tone, vocal inflection, filler words, and STAR delivery for free.
                </p>
              </div>
            </div>
            <Link
              href="/speech-coach"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer group"
            >
              <span>Try Speech Coach</span>
              <ArrowRight size={13} className="text-[#F2A93B] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
