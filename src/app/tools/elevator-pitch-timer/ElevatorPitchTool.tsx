'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  Target,
  FileText,
  Sliders,
  ChevronRight,
  MessageSquare,
  Award,
  Timer,
  Compass,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export type PitchDuration = 30 | 60 | 90;

export interface PitchSegment {
  name: string;
  startSec: number;
  endSec: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  cue: string;
}

export interface PitchTemplate {
  id: string;
  title: string;
  targetDuration: PitchDuration;
  persona: 'job' | 'founder' | 'freelance' | 'student';
  personaLabel: string;
  wordCount: number;
  text: string;
  breakdown: {
    hook: string;
    solution: string;
    proof: string;
    cta: string;
  };
}

const PITCH_SEGMENTS: Record<PitchDuration, PitchSegment[]> = {
  30: [
    {
      name: 'The Hook',
      startSec: 0,
      endSec: 8,
      color: '#3B82F6', // Blue
      badgeBg: 'bg-blue-50',
      badgeBorder: 'border-blue-200',
      badgeText: 'text-blue-700',
      description: 'Who you are and the high-impact problem you solve.',
      cue: 'Grab attention immediately. State your identity and key domain.',
    },
    {
      name: 'Core Value & Proof',
      startSec: 8,
      endSec: 22,
      color: '#F59E0B', // Amber
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-700',
      description: 'How you solve it with a tangible result or metric.',
      cue: 'Deliver your secret sauce or biggest quantified achievement.',
    },
    {
      name: 'Call to Action',
      startSec: 22,
      endSec: 30,
      color: '#10B981', // Emerald
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      description: 'Next step, conversation open loop, or interview ask.',
      cue: 'State your goal crisply and leave the ball in their court.',
    },
  ],
  60: [
    {
      name: 'The Hook & Identity',
      startSec: 0,
      endSec: 12,
      color: '#3B82F6',
      badgeBg: 'bg-blue-50',
      badgeBorder: 'border-blue-200',
      badgeText: 'text-blue-700',
      description: 'Engaging greeting, who you are, and the problem landscape.',
      cue: 'Introduce your role and frame the exact problem you eliminate.',
    },
    {
      name: 'Value Proposition & Mechanism',
      startSec: 12,
      endSec: 32,
      color: '#F59E0B',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-700',
      description: 'Your approach, core skills, or technological advantage.',
      cue: 'Explain how your solution works and what makes your approach different.',
    },
    {
      name: 'Proof & Quantified Impact',
      startSec: 32,
      endSec: 48,
      color: '#8B5CF6', // Purple
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-200',
      badgeText: 'text-purple-700',
      description: 'Traction, percentage improvement, or real-world evidence.',
      cue: 'Share a concrete metric: revenue, latency, users, or contest victory.',
    },
    {
      name: 'Crisp Call to Action',
      startSec: 48,
      endSec: 60,
      color: '#10B981',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      description: 'Clear ask for an interview, meeting, or pilot opportunity.',
      cue: 'Specify exactly what you want: a 15-minute sync or a role discussion.',
    },
  ],
  90: [
    {
      name: 'Context & Relatable Story',
      startSec: 0,
      endSec: 18,
      color: '#3B82F6',
      badgeBg: 'bg-blue-50',
      badgeBorder: 'border-blue-200',
      badgeText: 'text-blue-700',
      description: 'Relatable hook, current industry friction, and mission.',
      cue: 'Set the stage with a striking stat, industry pain, or personal story.',
    },
    {
      name: 'The Innovation & Solution',
      startSec: 18,
      endSec: 45,
      color: '#F59E0B',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-700',
      description: 'Detailed explanation of your system, product, or leadership.',
      cue: 'Break down your architecture, workflow, or project implementation.',
    },
    {
      name: 'Traction, Metrics & Edge',
      startSec: 45,
      endSec: 72,
      color: '#8B5CF6',
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-200',
      badgeText: 'text-purple-700',
      description: 'Substantial results, user feedback, or benchmark beating.',
      cue: 'Demonstrate proven credibility and why competitors fail here.',
    },
    {
      name: 'Vision & Closing Ask',
      startSec: 72,
      endSec: 90,
      color: '#10B981',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-700',
      description: 'Long-term direction and compelling next collaborative step.',
      cue: 'Articulate the broader vision and invite them to partner or interview you.',
    },
  ],
};

const CURATED_TEMPLATES: PitchTemplate[] = [
  {
    id: 'fresher-cs-30s',
    title: '30s Software Engineer Fresher Pitch',
    targetDuration: 30,
    persona: 'job',
    personaLabel: 'Campus Placement / Fresher',
    wordCount: 71,
    text: "Hi, I'm Alex, a computer science graduate specializing in scalable web systems. In my capstone project, I led a four-developer team building an inventory dashboard that reduced database query latency by 32% using Redis caching. I love untangling performance bottlenecks, and I'm eager to bring that problem-solving speed to your backend engineering team as a software associate. When would be a great time to discuss how I can contribute?",
    breakdown: {
      hook: "Hi, I'm Alex, a computer science graduate specializing in scalable web systems.",
      solution: "In my capstone project, I led a four-developer team building an inventory dashboard that reduced database query latency by 32% using Redis caching.",
      proof: "I love untangling performance bottlenecks, and I'm eager to bring that problem-solving speed to your backend engineering team.",
      cta: "When would be a great time to discuss how I can contribute?",
    },
  },
  {
    id: 'startup-ai-60s',
    title: '60s AI Startup Founder Pitch',
    targetDuration: 60,
    persona: 'founder',
    personaLabel: 'Startup Founder / Pitch',
    wordCount: 141,
    text: "Every week, 70% of job seekers fail their dream interviews not because they lack skills, but because verbal anxiety ruins their delivery. We built Oratii: a real-time AI interview and speech coach that analyzes candidate pacing, filler words, and body language right inside the web browser without any expensive human coaching fees. In our first beta pilot, over 1,400 students across 12 universities logged practice rounds, boosting mock interview clearance rates by 41% within two weeks. We're raising our pre-seed round to expand our enterprise campus partnerships across the nation. If you're interested in backing the future of AI-driven workforce readiness, I'd love to share our live investor demo.",
    breakdown: {
      hook: "Every week, 70% of job seekers fail their dream interviews not because they lack skills, but because verbal anxiety ruins their delivery.",
      solution: "We built Oratii: a real-time AI interview and speech coach that analyzes candidate pacing, filler words, and body language right inside the web browser.",
      proof: "In our first beta pilot, over 1,400 students across 12 universities logged practice rounds, boosting mock interview clearance rates by 41% within two weeks.",
      cta: "If you're interested in backing the future of AI-driven workforce readiness, I'd love to share our live investor demo.",
    },
  },
  {
    id: 'freelancer-growth-60s',
    title: '60s Growth Consultant / Freelancer Pitch',
    targetDuration: 60,
    persona: 'freelance',
    personaLabel: 'Consultant / Freelancer',
    wordCount: 138,
    text: "Most B2B SaaS founders waste thousands of dollars on paid ads while their landing page leaks 85% of incoming traffic. I help early-stage technical founders rewrite their product messaging and redesign high-converting onboarding funnels so their demo signups double without spending an extra dime on advertising. Last quarter, I restructured the value proposition for an open-source dev tool, driving their visitor-to-trial conversion from 2.4% to 6.1% in just 30 days. That unlocked $45,000 in additional annual pipeline. I'm currently opening two consultation slots for Q3. If you want a quick 15-minute teardown of your current landing page friction, let's grab coffee this afternoon.",
    breakdown: {
      hook: "Most B2B SaaS founders waste thousands of dollars on paid ads while their landing page leaks 85% of incoming traffic.",
      solution: "I help early-stage technical founders rewrite their product messaging and redesign high-converting onboarding funnels.",
      proof: "Last quarter, I restructured value proposition for an open-source dev tool, driving trial conversion from 2.4% to 6.1% and unlocking $45,000 in pipeline.",
      cta: "If you want a quick 15-minute teardown of your current landing page friction, let's grab coffee this afternoon.",
    },
  },
  {
    id: 'student-research-90s',
    title: '90s Academic Research & Capstone Pitch',
    targetDuration: 90,
    persona: 'student',
    personaLabel: 'Research / Capstone',
    wordCount: 206,
    text: "Autonomous vehicles and warehouse robots rely heavily on LiDAR and camera sensors, yet in adverse weather conditions like dense fog or blinding glare, vision models experience up to a 40% accuracy drop. For the past year, my research lab has been investigating multimodal sensor fusion under extreme environmental degradation. We developed an adaptive attention-weighting network that dynamically rebalances confidence between radar and optical sensors when noise exceeds safety thresholds. In simulated edge tests across 50,000 synthetic weather frames, our model reduced false obstacle detections by 64% while maintaining a real-time inference latency of 18 milliseconds on embedded hardware. Our work was recently accepted for presentation at our regional robotics symposium. As I prepare to graduate, I am looking to bring this deep sensor-fusion expertise to an innovative robotics or autonomous mobility engineering team. I would love to connect and discuss how my research aligns with your upcoming vehicle autonomy milestones.",
    breakdown: {
      hook: "Autonomous vehicles rely heavily on sensors, yet in dense fog or glare, vision models experience up to a 40% accuracy drop.",
      solution: "We developed an adaptive attention-weighting network that dynamically rebalances confidence between radar and optical sensors.",
      proof: "Across 50,000 synthetic frames, our model reduced false detections by 64% with 18ms real-time latency on embedded hardware.",
      cta: "As I prepare to graduate, I would love to connect and discuss how my research aligns with your upcoming vehicle autonomy milestones.",
    },
  },
];

const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'literally', 'so', 'sort of', 'kind of'];

export default function ElevatorPitchTool() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'timer' | 'builder' | 'templates'>('timer');

  // Timer configuration
  const [targetDuration, setTargetDuration] = useState<PitchDuration>(30);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTeleprompter, setShowTeleprompter] = useState(true);

  // Practice state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Speech and Audio state
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  // Script text in Teleprompter
  const [teleprompterText, setTeleprompterText] = useState(CURATED_TEMPLATES[0].text);
  const [copiedScript, setCopiedScript] = useState(false);

  // Builder state
  const [builderPersona, setBuilderPersona] = useState<'job' | 'founder' | 'freelance' | 'student'>('job');
  const [builderForm, setBuilderForm] = useState({
    name: 'Alex Patel',
    role: 'Full-Stack Developer & AI Enthusiast',
    problem: 'Manual data entry wastes 10+ hours per week for operations teams',
    solution: 'Built an automated pipeline using Next.js and Python that syncs records in real-time',
    metric: 'Saved 14 hours per week and eliminated human entry errors completely',
    cta: 'Discuss how my development skills can accelerate your engineering sprint',
  });

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Recognition ref
  const recognitionRef = useRef<any>(null);
  const isSpeechRecognitionRunning = useRef<boolean>(false);

  // Timer interval ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Segments for current duration
  const segments = useMemo(() => PITCH_SEGMENTS[targetDuration], [targetDuration]);

  // Current active segment
  const currentSegment = useMemo(() => {
    const matched = segments.find(
      (s) => elapsedSeconds >= s.startSec && (elapsedSeconds < s.endSec || s.endSec === targetDuration)
    );
    return matched || segments[segments.length - 1];
  }, [segments, elapsedSeconds, targetDuration]);

  // Time remaining
  const remainingSeconds = Math.max(0, targetDuration - elapsedSeconds);
  const progressPercent = Math.min(100, (elapsedSeconds / targetDuration) * 100);

  // Clean transcript for calculations
  const fullSpokenText = useMemo(() => {
    return `${transcript} ${interimTranscript}`.trim();
  }, [transcript, interimTranscript]);

  const spokenWordCount = useMemo(() => {
    if (!fullSpokenText) return 0;
    return fullSpokenText.split(/\s+/).filter(Boolean).length;
  }, [fullSpokenText]);

  // Live WPM calculation
  const liveWpm = useMemo(() => {
    if (elapsedSeconds < 3 || spokenWordCount === 0) return 0;
    const minutes = elapsedSeconds / 60;
    const raw = Math.round(spokenWordCount / minutes);
    return Math.min(Math.max(raw, 0), 240);
  }, [elapsedSeconds, spokenWordCount]);

  // Count filler words
  const fillerAnalysis = useMemo(() => {
    if (!fullSpokenText) return { totalCount: 0, items: [] };
    const lower = fullSpokenText.toLowerCase();
    const items: { word: string; count: number }[] = [];
    let totalCount = 0;

    FILLER_WORDS.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches && matches.length > 0) {
        items.push({ word, count: matches.length });
        totalCount += matches.length;
      }
    });

    return { totalCount, items };
  }, [fullSpokenText]);

  // Synthesize soft audio chimes using pure browser Web Audio API
  const playChime = useCallback(
    (type: 'phase' | 'warning' | 'finish') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'phase') {
          // Soft double ping (440Hz -> 660Hz)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'warning') {
          // Gentle warning pulse (2 short beeps)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        } else if (type === 'finish') {
          // Triumphant chord
          [523.25, 659.25, 783.99].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          });
        }
      } catch {
        // Audio synthesis blocked or unsupported; silent fail
      }
    },
    [soundEnabled]
  );

  // Previous segment tracker to chime on transitions
  const prevSegmentRef = useRef<string>(segments[0].name);

  // Monitor segment transitions for audio chime
  useEffect(() => {
    if (!isRunning) {
      prevSegmentRef.current = segments[0].name;
      return;
    }
    if (currentSegment.name !== prevSegmentRef.current) {
      prevSegmentRef.current = currentSegment.name;
      playChime('phase');
    }
    // 5 seconds remaining warning
    if (Math.round(remainingSeconds) === 5) {
      playChime('warning');
    }
  }, [currentSegment, isRunning, remainingSeconds, segments, playChime]);

  // Audio Visualizer loop
  const startAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(Math.round((avg / 128) * 100), 100);
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch {
      // AudioContext unavailable
    }
  };

  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setMicVolume(0);
  }, []);

  // Stop microphone media tracks
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    stopAudioMeter();
    setMicActive(false);
  }, [stopAudioMeter]);

  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalStr += item[0].transcript + ' ';
        } else {
          interimStr += item[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => `${prev} ${finalStr}`.trim());
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setMicError('Microphone permission was denied. Please allow mic access to measure speech.');
      }
    };

    recognition.onend = () => {
      // Auto-restart if session is still running (common on mobile browsers)
      if (isSpeechRecognitionRunning.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    return recognition;
  };

  // Start Pitch Practice
  const startPitch = async () => {
    setMicError(null);
    setIsFinished(false);
    setTranscript('');
    setInterimTranscript('');
    setElapsedSeconds(0);
    prevSegmentRef.current = segments[0].name;

    // Track analytics
    trackEvent('practice_session_start', {
      tool: 'elevator_pitch_timer',
      duration: targetDuration,
    });

    // 1. Request microphone stream
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMicActive(true);
        startAudioMeter(stream);
      }
    } catch (err: any) {
      setMicError('Mic access denied. You can still rehearse using the manual stopwatch!');
      setMicActive(false);
    }

    // 2. Start Speech Recognition
    try {
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        isSpeechRecognitionRunning.current = true;
        recognition.start();
      }
    } catch {
      // Speech recognition fallback
    }

    // 3. Start Timer
    const startEpoch = Date.now();
    startTimeRef.current = startEpoch;
    setIsRunning(true);

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - startEpoch) / 1000;
      setElapsedSeconds(diffSec);

      // Auto-stop if user hits target + 15 seconds grace period
      if (diffSec >= targetDuration + 15) {
        stopPitch();
      }
    }, 100);
  };

  // Stop and Analyze Pitch
  const stopPitch = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    isSpeechRecognitionRunning.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    stopMediaStream();
    setIsRunning(false);
    setIsFinished(true);
    playChime('finish');

    trackEvent('recording_complete', {
      tool: 'elevator_pitch_timer',
      duration: targetDuration,
      elapsed: Math.round(elapsedSeconds),
    });
  };

  // Reset Pitch
  const resetPitch = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    isSpeechRecognitionRunning.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    stopMediaStream();
    setIsRunning(false);
    setIsFinished(false);
    setElapsedSeconds(0);
    setTranscript('');
    setInterimTranscript('');
    setMicError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      isSpeechRecognitionRunning.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      stopMediaStream();
    };
  }, [stopMediaStream]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic assembled builder script
  const generatedBuilderScript = useMemo(() => {
    return `Hi, I'm ${builderForm.name}, ${builderForm.role}. ${builderForm.problem}. To solve this, I ${builderForm.solution}. As a direct result, we ${builderForm.metric}. I would love to connect and ${builderForm.cta}.`;
  }, [builderForm]);

  const builderWordCount = useMemo(() => {
    return generatedBuilderScript.split(/\s+/).filter(Boolean).length;
  }, [generatedBuilderScript]);

  // Projected duration at ideal 140 WPM
  const builderEstimatedSec = useMemo(() => {
    return Math.round((builderWordCount / 140) * 60);
  }, [builderWordCount]);

  // Timing verdict
  const timingVerdict = useMemo(() => {
    const diff = elapsedSeconds - targetDuration;
    const absDiff = Math.abs(diff);

    if (absDiff <= 2.5) {
      return {
        badgeBg: 'bg-emerald-50',
        badgeBorder: 'border-emerald-200',
        badgeText: 'text-emerald-700',
        title: 'Bullseye Pitch Timing! 🎯',
        description: `You nailed your ${targetDuration}s pitch within ±${absDiff.toFixed(1)}s! This level of timing discipline conveys immense executive presence.`,
        status: 'perfect',
      };
    } else if (diff < -2.5) {
      return {
        badgeBg: 'bg-amber-50',
        badgeBorder: 'border-amber-200',
        badgeText: 'text-amber-700',
        title: `Finished Early (${absDiff.toFixed(1)}s remaining)`,
        description: `You wrapped up with ${absDiff.toFixed(1)} seconds to spare. You can afford to add a stronger proof metric or slow down your pacing for gravitas.`,
        status: 'under',
      };
    } else {
      return {
        badgeBg: 'bg-red-50',
        badgeBorder: 'border-red-200',
        badgeText: 'text-red-700',
        title: `Exceeded Target (+${diff.toFixed(1)}s over)`,
        description: `In a real interview or networking event, the listener would have cut you off. Trim 15–20 words to ensure you close before the timer ends.`,
        status: 'over',
      };
    }
  }, [elapsedSeconds, targetDuration]);

  // Load a template into the Rehearsal Studio
  const handleLoadTemplate = (template: PitchTemplate) => {
    setTargetDuration(template.targetDuration);
    setTeleprompterText(template.text);
    setActiveTab('timer');
    resetPitch();
  };

  // Load builder script into the Rehearsal Studio
  const handleLoadBuilderIntoStudio = () => {
    // Select closest target duration based on word count
    if (builderWordCount <= 85) {
      setTargetDuration(30);
    } else if (builderWordCount <= 165) {
      setTargetDuration(60);
    } else {
      setTargetDuration(90);
    }
    setTeleprompterText(generatedBuilderScript);
    setActiveTab('timer');
    resetPitch();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Navigation Mode Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/90 backdrop-blur-sm rounded-2xl border border-slate-200 mb-6 max-w-xl mx-auto shadow-xs">
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'timer'
              ? 'bg-white text-[#0F1426] shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Timer size={15} className={activeTab === 'timer' ? 'text-[#F2A93B]' : 'text-slate-400'} />
          Rehearsal Studio
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'builder'
              ? 'bg-white text-[#0F1426] shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders size={15} className={activeTab === 'builder' ? 'text-indigo-600' : 'text-slate-400'} />
          Pitch Structurer
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'templates'
              ? 'bg-white text-[#0F1426] shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={15} className={activeTab === 'templates' ? 'text-emerald-600' : 'text-slate-400'} />
          Model Templates
        </button>
      </div>

      {/* TAB 1: REHEARSAL STUDIO (TIMER + SEGMENT ROADMAP + MIC & TELEPROMPTER) */}
      {activeTab === 'timer' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Controls: Duration Picker & Sound Toggle */}
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-1">
                Pitch Target:
              </span>
              {([30, 60, 90] as PitchDuration[]).map((dur) => (
                <button
                  key={dur}
                  disabled={isRunning}
                  onClick={() => {
                    setTargetDuration(dur);
                    resetPitch();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all ${
                    targetDuration === dur
                      ? 'bg-[#0F1426] text-white shadow-sm ring-2 ring-[#0F1426]/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {dur}s Pitch
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Phase Chimes' : 'Enable Phase Chimes'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 size={14} className="text-emerald-600" />
                    <span>Sound On</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={14} className="text-slate-400" />
                    <span>Muted</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowTeleprompter(!showTeleprompter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all"
              >
                <FileText size={14} className="text-indigo-600" />
                <span>{showTeleprompter ? 'Hide Script' : 'Show Script'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {/* SEGMENT ROADMAP BAR */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  4-Part Pitch Architecture
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Phase: <strong className="text-[#0F1426]">{currentSegment.name}</strong>
                </span>
              </div>

              {/* Segmented Timeline */}
              <div className="grid gap-1 sm:gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${segments.length}, 1fr)` }}>
                {segments.map((seg, idx) => {
                  const isCurrent = currentSegment.name === seg.name && isRunning;
                  const isPast = elapsedSeconds >= seg.endSec;

                  return (
                    <div key={idx} className="flex flex-col">
                      <div
                        className={`h-2.5 sm:h-3 rounded-full transition-all relative overflow-hidden ${
                          isPast
                            ? 'bg-slate-300'
                            : isCurrent
                            ? 'bg-slate-200 ring-2 ring-offset-1'
                            : 'bg-slate-100'
                        }`}
                        style={{
                          // ring color
                          borderColor: seg.color,
                        }}
                      >
                        {isCurrent && (
                          <div
                            className="h-full rounded-full transition-all duration-100 animate-pulse"
                            style={{
                              backgroundColor: seg.color,
                              width: `${Math.min(
                                100,
                                Math.max(0, ((elapsedSeconds - seg.startSec) / (seg.endSec - seg.startSec)) * 100)
                              )}%`,
                            }}
                          />
                        )}
                        {isPast && (
                          <div className="h-full w-full rounded-full" style={{ backgroundColor: seg.color }} />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 mt-1.5 px-0.5">
                        <span className="truncate">{seg.name}</span>
                        <span className="text-slate-400 shrink-0">{seg.endSec}s</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Segment Cue Card */}
              <div
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 ${currentSegment.badgeBg} ${currentSegment.badgeBorder}`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 animate-ping"
                  style={{ backgroundColor: currentSegment.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-black uppercase tracking-wider ${currentSegment.badgeText}`}>
                      {currentSegment.name} ({currentSegment.startSec}s – {currentSegment.endSec}s)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                    {currentSegment.cue}
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN CLOCK & TELEPROMPTER SPLIT VIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center mb-8">
              {/* Radial Stopwatch & Countdown Clock (5 cols on lg) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
                <div className="relative w-56 sm:w-64 aspect-square flex items-center justify-center">
                  {/* Circular Progress SVG */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-slate-100"
                      fill="transparent"
                    />
                    {/* Animated Progress Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke={
                        remainingSeconds <= 5
                          ? '#EF4444' // Red under 5s
                          : remainingSeconds <= 10
                          ? '#F59E0B' // Amber under 10s
                          : currentSegment.color
                      }
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (264 * progressPercent) / 100}
                      className="transition-all duration-100"
                      fill="transparent"
                    />
                  </svg>

                  {/* Inner Clock Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                      {isRunning ? 'Time Remaining' : 'Target Pitch'}
                    </span>
                    <span
                      className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${
                        remainingSeconds <= 5 && isRunning
                          ? 'text-red-600 animate-pulse'
                          : 'text-[#0F1426]'
                      }`}
                    >
                      {isRunning ? formatTime(remainingSeconds) : `${targetDuration}s`}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 mt-1">
                      Elapsed: <strong className="text-slate-800 tabular-nums">{elapsedSeconds.toFixed(1)}s</strong>
                    </span>

                    {/* Live Mic Volume Waveform Indicator */}
                    {micActive && isRunning && (
                      <div className="flex items-center gap-1 mt-2.5">
                        <div
                          className="w-1 bg-[#10B981] rounded-full transition-all duration-75"
                          style={{ height: `${Math.max(6, (micVolume * 16) / 100)}px` }}
                        />
                        <div
                          className="w-1 bg-[#10B981] rounded-full transition-all duration-75"
                          style={{ height: `${Math.max(10, (micVolume * 24) / 100)}px` }}
                        />
                        <div
                          className="w-1 bg-[#10B981] rounded-full transition-all duration-75"
                          style={{ height: `${Math.max(6, (micVolume * 16) / 100)}px` }}
                        />
                        <span className="text-[10px] font-bold text-emerald-600 ml-1">Mic Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pace telemetry badges */}
                <div className="flex items-center gap-3 mt-4 text-xs font-semibold text-slate-600">
                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    Spoken: <strong className="text-slate-900 tabular-nums">{spokenWordCount}</strong> words
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    Live Pace:{' '}
                    <strong
                      className={`tabular-nums ${
                        liveWpm >= 130 && liveWpm <= 155
                          ? 'text-emerald-600 font-bold'
                          : liveWpm > 155
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-800'
                      }`}
                    >
                      {liveWpm > 0 ? `${liveWpm} WPM` : '—'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Teleprompter / Custom Script Display (7 cols on lg) */}
              <div className="lg:col-span-7">
                {showTeleprompter ? (
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                          Teleprompter &amp; Script Reference
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {teleprompterText.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>

                    <textarea
                      value={teleprompterText}
                      disabled={isRunning}
                      onChange={(e) => setTeleprompterText(e.target.value)}
                      placeholder="Paste your custom pitch script here or customize this text..."
                      rows={6}
                      className={`w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#F2A93B]/50 transition-all resize-y ${
                        isRunning ? 'opacity-90 bg-slate-50 cursor-default' : ''
                      }`}
                    />

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span>💡 <strong>Target Word Count:</strong> ~{targetDuration === 30 ? '70' : targetDuration === 60 ? '140' : '210'} words at 140 WPM.</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(teleprompterText);
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                      >
                        {copiedScript ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedScript ? 'Copied' : 'Copy Script'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Teleprompter is currently hidden for freeform memory rehearsal.
                    </p>
                    <button
                      onClick={() => setShowTeleprompter(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      Show script teleprompter <ChevronRight size={12} />
                    </button>
                  </div>
                )}

                {/* Live Speech Recognition Transcript Box (Active when speaking) */}
                {isRunning && (
                  <div className="mt-3 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-emerald-700">
                      <Mic size={12} className="animate-pulse" />
                      <span>Live Speech Recognition:</span>
                    </div>
                    <p className="text-xs text-slate-700 italic min-h-[2.5rem]">
                      {transcript || interimTranscript ? (
                        <>
                          <span>{transcript}</span>
                          <span className="text-slate-400"> {interimTranscript}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Start speaking into your mic to see live transcription...</span>
                      )}
                    </p>
                  </div>
                )}

                {micError && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>{micError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS (BIG PRIMARY CTA) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              {!isRunning ? (
                <button
                  onClick={startPitch}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0F1426] hover:bg-slate-800 text-white font-black text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-95 group"
                >
                  <Play size={18} className="fill-white text-white group-hover:scale-110 transition-transform" />
                  <span>Start {targetDuration}s Pitch Practice</span>
                </button>
              ) : (
                <button
                  onClick={stopPitch}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-95 animate-pulse"
                >
                  <Pause size={18} className="fill-white text-white" />
                  <span>Finish &amp; Analyze Pitch</span>
                </button>
              )}

              {(elapsedSeconds > 0 || isFinished) && (
                <button
                  onClick={resetPitch}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* POST-PITCH EVALUATION REPORT CARD */}
          {isFinished && (
            <div className="p-4 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Award size={18} className="text-[#F2A93B]" />
                <h3 className="text-lg sm:text-xl font-black text-[#0F1426]">
                  Pitch Performance Analysis
                </h3>
              </div>

              {/* Timing Verdict Alert */}
              <div
                className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${timingVerdict.badgeBg} ${timingVerdict.badgeBorder}`}
              >
                <div>
                  <h4 className={`text-sm sm:text-base font-black ${timingVerdict.badgeText} mb-1`}>
                    {timingVerdict.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    {timingVerdict.description}
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-black text-slate-800 shrink-0">
                  Total Time: <strong className="text-[#0F1426]">{elapsedSeconds.toFixed(1)}s</strong> / {targetDuration}s
                </div>
              </div>

              {/* 3 Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Spoken Words
                  </span>
                  <div className="text-2xl font-black text-[#0F1426]">
                    {spokenWordCount > 0 ? spokenWordCount : teleprompterText.split(/\s+/).filter(Boolean).length}
                  </div>
                  <span className="text-xs text-slate-500">
                    {spokenWordCount > 0 ? 'Transcribed via live microphone' : 'Estimated from prepared script'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Calculated Cadence
                  </span>
                  <div className="text-2xl font-black text-[#0F1426]">
                    {liveWpm > 0
                      ? `${liveWpm} WPM`
                      : `${Math.round(
                          (teleprompterText.split(/\s+/).filter(Boolean).length / (elapsedSeconds / 60)) || 140
                        )} WPM`}
                  </div>
                  <span className="text-xs text-slate-500">Ideal range: 130–150 WPM</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Filler Words
                  </span>
                  <div
                    className={`text-2xl font-black ${
                      fillerAnalysis.totalCount === 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {fillerAnalysis.totalCount}
                  </div>
                  <span className="text-xs text-slate-500">
                    {fillerAnalysis.totalCount === 0
                      ? 'Clean verbal delivery!'
                      : `${fillerAnalysis.items.map((i) => `"${i.word}" (${i.count})`).join(', ')}`}
                  </span>
                </div>
              </div>

              {/* Actionable Next Step Callouts */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-indigo-950 mb-1">
                    Ready to practice with a live AI Interviewer?
                  </h4>
                  <p className="text-xs text-indigo-800 font-medium">
                    Test your introduction against realistic recruiter follow-up questions and eye contact tracking.
                  </p>
                </div>
                <Link
                  href="/interview"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Launch AI Mock Interview</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE PITCH STRUCTURER (BUILDER) */}
      {activeTab === 'builder' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-1 block">
              Modular Pitch Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1426] tracking-tight mb-2">
              The 4-Part Elevator Pitch Structurer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Fill in the key building blocks below. Oratii will assemble a high-converting pitch script and calculate your exact word count and timing.
            </p>
          </div>

          {/* Persona selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'job', label: 'Job Seeker / Fresher' },
              { id: 'founder', label: 'Startup Founder' },
              { id: 'freelance', label: 'Freelancer / Consultant' },
              { id: 'student', label: 'Student / Capstone' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setBuilderPersona(p.id as any);
                  if (p.id === 'job') {
                    setBuilderForm({
                      name: 'Alex Patel',
                      role: 'Full-Stack Developer & AI Enthusiast',
                      problem: 'Manual data entry wastes 10+ hours per week for operations teams',
                      solution: 'Built an automated pipeline using Next.js and Python that syncs records in real-time',
                      metric: 'Saved 14 hours per week and eliminated human entry errors completely',
                      cta: 'Discuss how my development skills can accelerate your engineering sprint',
                    });
                  } else if (p.id === 'founder') {
                    setBuilderForm({
                      name: 'Elena Vance',
                      role: 'Founder at DataFlow',
                      problem: '70% of enterprise teams spend 4 hours daily fixing broken SQL queries',
                      solution: 'Built an autonomous AI co-pilot that self-heals broken data pipelines in seconds',
                      metric: 'Reduced pipeline downtime by 82% across 15 enterprise beta customers',
                      cta: 'Share our seed investor deck and walkthrough our live interactive demo',
                    });
                  } else if (p.id === 'freelance') {
                    setBuilderForm({
                      name: 'Marcus Brody',
                      role: 'B2B Conversion Rate Optimization Specialist',
                      problem: 'SaaS companies spend thousands on ads while their onboarding loses 80% of signups',
                      solution: 'Audit friction points and redesign activation funnels with proven behavioral psychology',
                      metric: 'Boosted visitor-to-paid conversions by 3.4x for three Y-Combinator startups',
                      cta: 'Conduct a free 15-minute diagnostic of your current onboarding funnel',
                    });
                  } else {
                    setBuilderForm({
                      name: 'Rohan Sharma',
                      role: 'Robotics Engineering Researcher',
                      problem: 'Computer vision sensors fail under heavy fog and glaring sunlight',
                      solution: 'Engineered an adaptive sensor-fusion model combining radar and optical feeds',
                      metric: 'Reduced false collision warnings by 64% with 18ms edge latency',
                      cta: 'Explore how my research can support your autonomous vehicle systems team',
                    });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  builderPersona === p.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                1. Your Name &amp; Title
              </label>
              <input
                type="text"
                value={builderForm.name}
                onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                2. Professional Role / Focus
              </label>
              <input
                type="text"
                value={builderForm.role}
                onChange={(e) => setBuilderForm({ ...builderForm, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                3. The Problem You Solve (The Hook)
              </label>
              <input
                type="text"
                value={builderForm.problem}
                onChange={(e) => setBuilderForm({ ...builderForm, problem: e.target.value })}
                placeholder="What friction, loss, or pain do your target clients or employers face?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                4. Your Solution / Mechanism (The Core Value)
              </label>
              <input
                type="text"
                value={builderForm.solution}
                onChange={(e) => setBuilderForm({ ...builderForm, solution: e.target.value })}
                placeholder="How do you solve this? What project, tech stack, or method did you use?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                5. Tangible Metric or Credibility (The Proof)
              </label>
              <input
                type="text"
                value={builderForm.metric}
                onChange={(e) => setBuilderForm({ ...builderForm, metric: e.target.value })}
                placeholder="e.g. 32% latency reduction, $40k revenue, 1st place hackathon"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                6. Clear Call to Action (The Ask)
              </label>
              <input
                type="text"
                value={builderForm.cta}
                onChange={(e) => setBuilderForm({ ...builderForm, cta: e.target.value })}
                placeholder="e.g. Discuss open roles, schedule a 15-min coffee, view demo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Real-Time Assembled Pitch Script Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F2A93B]" />
                Assembled Pitch Script
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {builderWordCount} words
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  ≈ {builderEstimatedSec}s @ 140 WPM
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 mb-4 select-text">
              &ldquo;{generatedBuilderScript}&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-500">
                {builderWordCount <= 80 ? (
                  <span className="text-emerald-700 font-bold">🟢 Recommended Target: 30-Second Pitch</span>
                ) : builderWordCount <= 160 ? (
                  <span className="text-blue-700 font-bold">🔵 Recommended Target: 60-Second Pitch</span>
                ) : (
                  <span className="text-purple-700 font-bold">🟣 Recommended Target: 90-Second Pitch</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedBuilderScript);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedScript ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleLoadBuilderIntoStudio}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#0F1426] hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} className="text-[#F2A93B]" />
                  <span>Load Into Rehearsal Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURATED MODEL TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1 block">
              Proven Scripts
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1426] tracking-tight mb-2">
              Tested Elevator Pitch Formulas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Click any model pitch below to load it directly into the Rehearsal Studio with pre-configured pacing milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CURATED_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      {tmpl.personaLabel}
                    </span>
                    <span className="text-xs font-black text-[#0F1426] bg-[#FEF7ED] border border-[#F2A93B]/40 px-2 py-0.5 rounded-md text-[#D98200]">
                      {tmpl.targetDuration}s Target
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#0F1426] mb-2">{tmpl.title}</h3>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4 italic bg-white p-3 rounded-xl border border-slate-200/70">
                    &ldquo;{tmpl.text}&rdquo;
                  </p>

                  {/* 4-part breakdown mini tags */}
                  <div className="space-y-1.5 text-[11px] text-slate-600 mb-4 font-medium">
                    <div>
                      <strong className="text-blue-700">Hook:</strong> {tmpl.breakdown.hook}
                    </div>
                    <div>
                      <strong className="text-amber-700">Proof:</strong> {tmpl.breakdown.proof}
                    </div>
                    <div>
                      <strong className="text-emerald-700">Ask:</strong> {tmpl.breakdown.cta}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                  <span className="text-xs font-bold text-slate-500">
                    {tmpl.wordCount} words (~140 WPM)
                  </span>
                  <button
                    onClick={() => handleLoadTemplate(tmpl)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0F1426] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Practice This Pitch</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
