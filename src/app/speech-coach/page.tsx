'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '../../lib/storage';
import { saveMediaBlob } from '../../lib/videoStorage';
import { processSessionCompletion } from '../../lib/gamification';
import { groupFillerWords } from '../../lib/constants';
import { completeChallengeDay } from '../../lib/challenge';
import dynamic from 'next/dynamic';
import XPToast from '../../components/XPToast';
import { checkAndDeductCredits } from '../../lib/credits';
import { supabase } from '../../lib/supabaseClient';

const TrialSignupPrompt = dynamic(() => import('../../components/TrialSignupPrompt'), { ssr: false });
const GuestAuthModal = dynamic(() => import('../../components/GuestAuthModal'), { ssr: false });
const InsufficientCreditsModal = dynamic(() => import('../../components/InsufficientCreditsModal'), { ssr: false });
const ConfidenceGraph = dynamic(() => import('../../components/ConfidenceGraph'), { ssr: false });
const ScoreRing = dynamic(() => import('../../components/ConfidenceGraph').then(mod => mod.ScoreRing), { ssr: false });
const MediaPreviewPlayer = dynamic(() => import('../../components/MediaPreviewPlayer'), { ssr: false });
import { generateAuditedSpeechRubric, getAcademicLevel, AuditedSpeechRubric } from '../../lib/scoringRubric';
import {
  Mic, FileText, Upload, Sparkles, X, CheckCircle2, RotateCcw, Award, Zap, Globe,
  Target, AlertCircle, Check, HelpCircle, Volume2, Square, Play, Pause, BookOpen,
  Edit3, Copy, Shield, GraduationCap, Scale, BarChart3, ArrowRight, Flame, Timer, AlertTriangle
} from 'lucide-react';

const MAX_FREE_RECORDING_SECONDS = 180; // 3-Minute Free Drill Cap

const SUGGESTED_TOPICS = [
  'Tell Me About Yourself (Placement HR)',
  'Explain Your Final Year Project (Tech Viva)',
  'Why Should We Hire You Over Others?',
  'STAR Method: Handled High Pressure Situation',
  'IELTS Cue Card: A Life Changing Decision',
  'Why Do You Want to Work in Tech / IT?',
  'Extempore: Future of AI in Engineering',
  'Describe a Difficult Technical Bug You Solved'
];

export default function SpeechCoach() {
  const router = useRouter();

  // Top-level section: 'record' (existing flow) or 'topic' (new AI speech writer flow)
  const [section, setSection] = useState('record');

  // --- Record section state (existing) ---
  const [mode, setMode] = useState('live-audio');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showTimeLimitNotice, setShowTimeLimitNotice] = useState(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepLoading, setIsDeepLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showScoreAudit, setShowScoreAudit] = useState(false);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [xpEvents, setXpEvents] = useState([]);
  const [language, setLanguage] = useState('hi');
  const [situation, setSituation] = useState('');
  const [challengeDay, setChallengeDay] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 30-Second Clean Re-Do Drill State ("Muscle Memory Gym")
  const [showCleanDrill, setShowCleanDrill] = useState(false);
  const [cleanDrillSeconds, setCleanDrillSeconds] = useState(30);
  const [isCleanDrillRecording, setIsCleanDrillRecording] = useState(false);
  const [cleanDrillTranscript, setCleanDrillTranscript] = useState('');
  const [cleanDrillFillers, setCleanDrillFillers] = useState<string[]>([]);
  const [cleanDrillCompleted, setCleanDrillCompleted] = useState(false);
  const [cleanDrillXp, setCleanDrillXp] = useState(0);
  const cleanDrillTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanDrillRecRef = useRef<any>(null);

  const DRILL_FILLERS = ['um', 'uh', 'like', 'matlab', 'basically', 'actually', 'you know', 'literally', 'yaani', 'toh'];

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : language || 'en-US';

      rec.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        const clean = text.trim();
        setCleanDrillTranscript(clean);

        const words = clean.toLowerCase().split(/\s+/);
        const found = words.filter(w => DRILL_FILLERS.includes(w.replace(/[^a-zA-Z]/g, '')));
        setCleanDrillFillers(found);
      };

      rec.onerror = () => setIsCleanDrillRecording(false);
      rec.onend = () => setIsCleanDrillRecording(false);
      cleanDrillRecRef.current = rec;
    }
  }, [language]);

  const startCleanDrill = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsGuestAuthModalOpen(true);
      return;
    }

    setCleanDrillSeconds(30);
    setCleanDrillTranscript('');
    setCleanDrillFillers([]);
    setCleanDrillCompleted(false);
    setIsCleanDrillRecording(true);

    if (cleanDrillRecRef.current) {
      try {
        cleanDrillRecRef.current.start();
      } catch (e) {}
    }

    if (cleanDrillTimerRef.current) clearInterval(cleanDrillTimerRef.current);
    cleanDrillTimerRef.current = setInterval(() => {
      setCleanDrillSeconds(prev => {
        if (prev <= 1) {
          stopCleanDrill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCleanDrill = () => {
    setIsCleanDrillRecording(false);
    if (cleanDrillTimerRef.current) {
      clearInterval(cleanDrillTimerRef.current);
      cleanDrillTimerRef.current = null;
    }
    if (cleanDrillRecRef.current) {
      try {
        cleanDrillRecRef.current.stop();
      } catch (e) {}
    }
    setCleanDrillCompleted(true);
    setCleanDrillXp(cleanDrillFillers.length === 0 ? 50 : 25);
  };

  const handleSpeakFeedback = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cDay = params.get('challengeDay');
      const cTopic = params.get('topic');
      if (cDay) {
        const parsed = parseInt(cDay, 10);
        if (!isNaN(parsed)) setChallengeDay(parsed);
      }
      if (cTopic) {
        setSituation(cTopic);
        setShowContext(true);
      }
    }
  }, []);
  
  const [mediaUrl, setMediaUrl] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMediaUrl('');
    }
  }, [mediaFile]);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop microphone stream & recording timer on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, []);

  // --- Topic Speech section state (new) ---
  const [topicInput, setTopicInput] = useState('');
  const [topicTone, setTopicTone] = useState('Professional & Inspiring');
  const [topicAudience, setTopicAudience] = useState('General Public');
  const [topicLoading, setTopicLoading] = useState(false);
  const [generatedSpeech, setGeneratedSpeech] = useState(null);
  const [originalSpeech, setOriginalSpeech] = useState(null);
  const [isEditingSpeech, setIsEditingSpeech] = useState(false);
  const [isEditingInPractice, setIsEditingInPractice] = useState(false);
  const [topicError, setTopicError] = useState('');
  const [copied, setCopied] = useState(false);
  const [topicPhase, setTopicPhase] = useState('input'); // 'input' | 'speech' | 'practice'
  const [showContext, setShowContext] = useState(false);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const speechRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);

  const startRecordingTimer = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const maxTime = challengeDay ? 60 : MAX_FREE_RECORDING_SECONDS;
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev + 1 >= maxTime) {
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          stopRecording();
          setShowTimeLimitNotice(true);
          return maxTime;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsGuestAuthModalOpen(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : undefined;
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setMediaFile(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);
      setShowTimeLimitNotice(false);
      startRecordingTimer();
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access the microphone. Please check permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startRecordingTimer();
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      e.target.value = ''; // Reset so re-uploading same file triggers onChange
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|aac|flac|webm|ogg)$/i)) {
        setMediaFile(file);
      } else {
        alert("Please upload a valid audio file (MP3, WAV, M4A, AAC, FLAC, WEBM).");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = async (fileOrBlob?: any) => {
    const targetFile = fileOrBlob || mediaFile;
    if (!targetFile) {
      alert("No audio file found to analyze. Please upload or record an audio file first.");
      return;
    }

    // 1. Check Auth & Credits before starting analysis
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsGuestAuthModalOpen(true);
      return;
    } else {
      // Signed-in user: deduct 1 credit for Speech Coach analysis
      const creditCheck = await checkAndDeductCredits(session.user.id, 1);
      if (!creditCheck.allowed) {
        setCreditBalance(creditCheck.remainingCredits);
        setIsCreditModalOpen(true);
        return;
      }
    }

    // Keep user on action screen with clear progress loader for 1-2s while fetching transcript
    setIsLoading(true);
    setIsDeepLoading(true);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', targetFile, targetFile.name || 'recording.webm');
      formData.append('language', language);
      
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/speech-analyzer', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        router.push('/login?message=trial_expired');
        return;
      }

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const duration = data.analysis?.duration || 0;
      const transcript = data.transcript || '';
      const totalWords = data.analysis?.totalWords || (transcript ? transcript.split(/\s+/).filter(Boolean).length : 0);
      
      if (duration < 4 || totalWords < 8 || transcript.trim().length === 0) {
        setResults({ 
          error: true,
          title: "Insufficient Speech Sample",
          message: `We detected only ${totalWords} words (${Math.round(duration)}s). An authentic, reliable assessment requires at least 15-20 seconds of continuous speaking. Please re-record and share a full thought.`
        });
        setIsLoading(false);
        setIsDeepLoading(false);
        return;
      }

      // Group filler words using shared utility
      const mappedFillers = data.analysis?.topFillers || groupFillerWords(data.words);
      const fillerCount = data.analysis?.totalFillers || 0;
      const wpm = data.analysis?.wpm || 0;

      // Deterministic Academic Rubric
      const auditedRubric: AuditedSpeechRubric = data.analysis?.rubric || generateAuditedSpeechRubric(wpm, fillerCount, duration, transcript);

      // Instantly populate transcript, WPM, fillers, pace graph, and rubric!
      setResults({
        overallScore: auditedRubric.overallScore,
        wpm: wpm,
        targetWpm: '130 - 155',
        fillers: mappedFillers,
        totalFillers: fillerCount,
        transcript: data.transcript || "No transcript detected.",
        feedback: "Generating AI feedback & coaching recommendations...",
        strengths: [],
        weaknesses: [],
        suggestions: [],
        tone: "Analyzing...",
        timeMarkers: [],
        paceData: data.analysis?.paceData || [],
        duration: duration,
        rubric: auditedRubric,
        cefrBand: auditedRubric.benchmark.cefrLevel,
        cefrTitle: auditedRubric.benchmark.cefrTitle,
        ieltsBand: auditedRubric.benchmark.ieltsBand,
        ieltsDescriptor: auditedRubric.benchmark.ieltsDescriptor,
        trustGuarantee: auditedRubric.trustGuarantee
      });
      
      // Phase 2: Deep Analysis (no media file needed, only metadata)
      const deepFormData = new FormData();
      deepFormData.append('wpm', String(wpm));
      deepFormData.append('totalFillers', String(fillerCount));
      deepFormData.append('timedTranscript', data.analysis?.timedTranscript || '');
      deepFormData.append('situation', situation);
      deepFormData.append('language', language);

      const deepResponse = await fetch('/api/speech-analyzer-deep', {
        method: 'POST',
        headers,
        body: deepFormData,
      });

      let finalOverallScore = auditedRubric.overallScore;
      let finalFeedback = "Your pacing and tone were analyzed successfully.";
      let finalStrengths: string[] = [];
      let finalWeaknesses: string[] = [];
      let finalSuggestions: string[] = [];
      let finalTone = "Neutral";
      let finalTimeMarkers: any[] = [];
      let finalCefr = auditedRubric.benchmark.cefrLevel;
      let finalIelts = auditedRubric.benchmark.ieltsBand;

      try {
        if (deepResponse.ok) {
          const deepData = await deepResponse.json();
          if (deepData.status === 'success' && deepData.tone) {
            finalOverallScore = deepData.tone.toneScore || auditedRubric.overallScore;
            finalFeedback = deepData.tone.feedback || finalFeedback;
            finalStrengths = deepData.tone.strengths || [];
            finalWeaknesses = deepData.tone.weaknesses || [];
            finalSuggestions = deepData.tone.suggestions || [];
            finalTone = deepData.tone.tone || finalTone;
            finalTimeMarkers = deepData.tone.timeMarkers || [];
            if (deepData.tone.cefrBand) finalCefr = deepData.tone.cefrBand;
            if (deepData.tone.ieltsBand) finalIelts = deepData.tone.ieltsBand;
          }
        }
      } catch (err) {
        console.error("Deep analysis failed:", err);
      }

      setResults({
        overallScore: finalOverallScore,
        wpm: wpm,
        targetWpm: '130 - 155',
        fillers: mappedFillers,
        totalFillers: fillerCount,
        transcript: data.transcript || "No transcript detected.",
        feedback: finalFeedback,
        strengths: finalStrengths,
        weaknesses: finalWeaknesses,
        suggestions: finalSuggestions,
        tone: finalTone,
        timeMarkers: finalTimeMarkers,
        paceData: data.analysis?.paceData || [],
        duration: duration,
        rubric: auditedRubric,
        cefrBand: finalCefr,
        cefrTitle: auditedRubric.benchmark.cefrTitle,
        ieltsBand: finalIelts,
        ieltsDescriptor: auditedRubric.benchmark.ieltsDescriptor,
        trustGuarantee: auditedRubric.trustGuarantee
      });

      const sessionRecord = saveSession('speech', {
        topic: situation ? `Speech: ${situation}` : 'Speech Coach Analysis',
        type: 'speech',
        duration: duration || 120,
        scores: { overall: finalOverallScore, fillerCount: fillerCount },
        strengths: finalStrengths,
        weaknesses: finalWeaknesses,
        suggestions: finalSuggestions,
        feedback: finalFeedback,
        transcript: data.transcript || '',
        wpm,
        totalFillers: fillerCount,
        topFillers: mappedFillers,
        rubric: auditedRubric,
        paceData: data.analysis?.paceData || [],
        tone: finalTone,
        timeMarkers: finalTimeMarkers,
        cefrBand: finalCefr,
        cefrTitle: auditedRubric.benchmark.cefrTitle,
        ieltsBand: finalIelts,
        ieltsDescriptor: auditedRubric.benchmark.ieltsDescriptor,
        situation
      });

      setLastSessionId(sessionRecord.id);

      if (mediaFile) {
        saveMediaBlob(sessionRecord.id, mediaFile, 'audio');
      }
      const gamificationResult = processSessionCompletion('speech', { overall: finalOverallScore, fillerCount: fillerCount });
      setXpEvents(gamificationResult.events);

      if (challengeDay) {
        completeChallengeDay(challengeDay, {
          overallScore: finalOverallScore,
          fillerCount: fillerCount
        });
      }

      setIsLoading(false);
      setIsDeepLoading(false);

    } catch (err) {
      console.error(err);
      alert("Speech analysis failed. Please try again.");
      setIsLoading(false);
      setIsDeepLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setMediaFile(null);
    setIsRecording(false);
  };

  const modes = [
    { key: 'live-audio', label: 'Live Audio' },
    { key: 'upload', label: 'Upload Audio' },
  ];

  const getPacingInfo = (wpm, tone) => {
    if (wpm === 0) return { label: 'N/A', color: 'text-slate-400' };
    
    if (wpm < 110) {
      if (tone === 'Impactful' || tone === 'Confident') {
        return { label: 'Deliberate & Impactful', color: 'text-[#1B2140]' };
      }
      return { label: 'Too Slow', color: 'text-amber-500' };
    }
    
    if (wpm <= 140) return { label: 'Perfect Pace', color: 'text-emerald-500' };
    
    if (wpm <= 180) {
      if (tone === 'Nervous') return { label: 'Rushed & Nervous', color: 'text-rose-500' };
      return { label: 'Fast / Passionate', color: 'text-[#F2A93B]' };
    }
    
    return { label: 'Too Fast', color: 'text-rose-600' };
  };

  const pacingInfo = results ? getPacingInfo(results.wpm, results.tone) : { label: '', color: '' };

  // Helper: parse [M:SS] timestamp from start of a feedback string
  const parseTimestampFromText = (text) => {
    const match = text.match(/^\[(\d+):(\d{2})\]\s*/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const timeInSeconds = minutes * 60 + seconds;
      const cleanText = text.replace(/^\[(\d+):(\d{2})\]\s*/, '');
      return { time: timeInSeconds, label: match[0].trim(), text: cleanText };
    }
    return { time: null, label: null, text };
  };

  // Helper: jump audio to specific time
  const jumpToTime = (timeInSeconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
      audioRef.current.play();
    }
  };

  // Helper: score color
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'from-emerald-500 to-teal-600';
    if (score >= 70) return 'from-blue-500 to-indigo-600';
    if (score >= 50) return 'from-amber-500 to-orange-600';
    return 'from-rose-500 to-red-600';
  };

  // SVG Pace Graph Component
  const PaceGraph = ({ paceData, duration }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    
    if (!paceData || paceData.length < 2) {
      return (
        <div className="flex items-center justify-center h-36 text-slate-400 text-sm font-medium">
          Not enough data to show pace graph
        </div>
      );
    }

    const width = 600;
    const height = 135;
    const padding = { top: 15, right: 20, bottom: 28, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxWpm = Math.max(...paceData.map(d => d.wpm), 180);
    const minWpm = Math.min(...paceData.map(d => d.wpm), 80);
    const yRange = maxWpm - minWpm || 1;

    const xScale = (time) => padding.left + (time / (duration || 1)) * chartW;
    const yScale = (wpm) => padding.top + chartH - ((wpm - minWpm) / yRange) * chartH;

    // Build path
    const points = paceData.map(d => ({ x: xScale(d.time), y: yScale(d.wpm), ...d }));
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Area path for gradient fill under line
    const areaPath = linePath + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    // Ideal zone band (120-160 WPM)
    const idealTop = yScale(160);
    const idealBottom = yScale(120);

    // Time labels
    const timeLabels = [];
    const labelInterval = duration > 60 ? 15 : duration > 30 ? 10 : 5;
    for (let t = 0; t <= duration; t += labelInterval) {
      timeLabels.push(t);
    }

    // WPM labels
    const wpmLabels = [];
    const wpmStep = yRange > 100 ? 40 : yRange > 50 ? 20 : 10;
    for (let w = Math.floor(minWpm / wpmStep) * wpmStep; w <= maxWpm + wpmStep; w += wpmStep) {
      if (w >= minWpm && w <= maxWpm + 10) wpmLabels.push(w);
    }

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {wpmLabels.map(w => (
            <line key={w} x1={padding.left} x2={width - padding.right} y1={yScale(w)} y2={yScale(w)} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}

          {/* Ideal zone */}
          <rect x={padding.left} y={idealTop} width={chartW} height={idealBottom - idealTop} fill="#10b981" opacity="0.08" rx="3" />
          <line x1={padding.left} x2={width - padding.right} y1={idealTop} y2={idealTop} stroke="#10b981" strokeWidth="0.7" strokeDasharray="6 3" opacity="0.4" />
          <line x1={padding.left} x2={width - padding.right} y1={idealBottom} y2={idealBottom} stroke="#10b981" strokeWidth="0.7" strokeDasharray="6 3" opacity="0.4" />
          <text x={width - padding.right - 2} y={idealTop - 3} fill="#10b981" fontSize="8" textAnchor="end" fontWeight="600" opacity="0.7">160</text>
          <text x={width - padding.right - 2} y={idealBottom + 10} fill="#10b981" fontSize="8" textAnchor="end" fontWeight="600" opacity="0.7">120</text>
          <text x={padding.left + 4} y={(idealTop + idealBottom) / 2 + 3} fill="#10b981" fontSize="7" fontWeight="700" opacity="0.5">IDEAL ZONE</text>

          {/* Area fill */}
          <path d={areaPath} fill="url(#paceGradient)" />

          {/* Main line */}
          <path d={linePath} fill="none" stroke="rgb(99, 102, 241)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => {
            const inZone = p.wpm >= 120 && p.wpm <= 160;
            const tooFast = p.wpm > 160;
            const color = inZone ? '#10b981' : tooFast ? '#ef4444' : '#f59e0b';
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={hoveredPoint === i ? 6 : 4} fill={color} stroke="white" strokeWidth="2" 
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {hoveredPoint === i && (
                  <g>
                    <rect x={p.x - 38} y={p.y - 32} width="76" height="22" rx="4" fill="#1e293b" opacity="0.95" />
                    <text x={p.x} y={p.y - 17} fill="white" fontSize="9" textAnchor="middle" fontWeight="700">
                      {p.wpm} WPM @ {Math.floor(p.time / 60)}:{Math.floor(p.time % 60).toString().padStart(2, '0')}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Y-axis labels */}
          {wpmLabels.map(w => (
            <text key={w} x={padding.left - 6} y={yScale(w) + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontWeight="600">{w}</text>
          ))}

          {/* X-axis labels */}
          {timeLabels.map(t => (
            <text key={t} x={xScale(t)} y={height - 5} fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="600">
              {Math.floor(t / 60)}:{(t % 60).toString().padStart(2, '0')}
            </text>
          ))}

          {/* Axis labels */}
          <text x={padding.left - 8} y={8} fill="#64748b" fontSize="8" fontWeight="700">WPM</text>
          <text x={width - padding.right} y={height - 5} fill="#64748b" fontSize="8" textAnchor="end" fontWeight="700">TIME</text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Ideal (120-160)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Too Slow</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Too Fast</span>
        </div>
      </div>
    );
  };

  // Feedback item renderer with clickable timestamp and standardized styling
  const FeedbackItem = ({ text, colorClass, icon = '•' }: { text: string; colorClass?: string; icon?: React.ReactNode }) => {
    const parsed = parseTimestampFromText(text);
    return (
      <li className="flex items-start gap-2.5 leading-relaxed text-slate-700 font-medium text-sm">
        {parsed.time !== null ? (
          <button
            onClick={() => jumpToTime(parsed.time)}
            className="shrink-0 mt-0.5 px-2 py-0.5 bg-slate-900 text-white text-xs font-mono font-bold rounded hover:bg-slate-700 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
            title={`Jump to ${parsed.label}`}
          >
            <span>▶</span>
            <span>{parsed.label.replace('[', '').replace(']', '')}</span>
          </button>
        ) : (
          <span className="shrink-0 mt-0.5 text-base select-none">{icon}</span>
        )}
        <span className={colorClass || 'text-slate-700'}>{parsed.text}</span>
      </li>
    );
  };

  // --- Topic Speech handlers ---
  const handleGenerateSpeech = async () => {
    if (!topicInput.trim()) {
      setTopicError('Please type a topic first!');
      return;
    }
    setTopicError('');
    setTopicLoading(true);
    setGeneratedSpeech(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsGuestAuthModalOpen(true);
        setTopicLoading(false);
        return;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/speech-writer', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          topic: topicInput.trim(),
          tone: topicTone,
          audience: topicAudience
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setGeneratedSpeech(data.data);
      setOriginalSpeech(data.data);
      setIsEditingSpeech(false);
      setIsEditingInPractice(false);
      setTopicPhase('speech');

      setTimeout(() => {
        speechRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      setTopicError(err.message || 'Failed to generate speech. Please try again.');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleTitleChange = (newTitle) => {
    setGeneratedSpeech(prev => (prev ? { ...prev, title: newTitle } : prev));
  };

  const handleSpeechTextChange = (newText) => {
    setGeneratedSpeech(prev => (prev ? { ...prev, speech: newText } : prev));
  };

  const handleResetToOriginal = () => {
    if (originalSpeech) {
      setGeneratedSpeech({ ...originalSpeech });
    }
  };

  const handleCopySpeech = async () => {
    if (!generatedSpeech) return;
    try {
      await navigator.clipboard.writeText(`${generatedSpeech.title}\n\n${generatedSpeech.speech}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = `${generatedSpeech.title}\n\n${generatedSpeech.speech}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePracticeSpeech = () => {
    setTopicPhase('practice');
    setIsEditingInPractice(false);
    setSituation(`Practicing a speech on: ${topicInput}`);
  };

  const handleTopicReset = () => {
    setTopicInput('');
    setGeneratedSpeech(null);
    setOriginalSpeech(null);
    setIsEditingSpeech(false);
    setIsEditingInPractice(false);
    setTopicError('');
    setCopied(false);
    setTopicPhase('input');
    setResults(null);
    setMediaFile(null);
  };

  // Shared sections for top-level
  const sections = [
    { key: 'record', label: 'Record / Upload', desc: 'Record or upload your speech' },
    { key: 'topic', label: 'Topic Speech', desc: 'Pick a topic & practice' },
  ];

  return (
    <div className="w-full flex flex-col gap-4 text-slate-900 animate-fade-in relative pb-6">
      {!results ? (
        <>
          {/* Header Title */}
          <div className="mb-3 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span> Speech Coach AI &bull; Pacing Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
              <Mic size={24} className="text-teal-600" /> Speech Coach Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl">Record live speech, upload audio, or pick a topic to receive real-time pacing, WPM, and filler word AI analysis.</p>
          </div>

          {/* Top-level Section Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 w-full max-w-md border border-slate-200/80 shadow-xs">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => { setSection(s.key); setResults(null); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
                  section === s.key 
                    ? 'bg-[#0F1426] text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Challenge Banner if launched from Daily Challenge */}
          {challengeDay && (
            <div className="bg-[#0F1426] text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-slate-800 mb-4">
              <div className="flex items-center gap-3 font-semibold text-sm">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 text-[#F2A93B] border border-white/10">
                  Day {challengeDay} Challenge
                </span>
                <span className="truncate text-slate-200 font-bold">{situation || `Task Day ${challengeDay}`}</span>
              </div>
              <button
                onClick={() => router.push('/challenge')}
                className="text-xs font-black px-4 py-2 bg-gradient-to-r from-amber-400 to-[#F2A93B] text-[#151930] rounded-xl hover:from-amber-300 hover:to-[#e0992b] transition-all shrink-0 self-start sm:self-auto shadow-md"
              >
                Back to Challenge
              </button>
            </div>
          )}

          {/* ============= SECTION: RECORD / UPLOAD (Executive SaaS Aesthetic) ============= */}
          {section === 'record' && (
            <div className="border border-slate-200/90 rounded-2xl sm:rounded-3xl bg-white shadow-sm p-5 sm:p-6 flex flex-col gap-5 relative">
              
              {/* Header / Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                    <Mic size={18} className="text-amber-500" /> Practice & Record Speech
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Select input mode and spoken language to get detailed pacing & clarity analysis.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 shrink-0">
                  {modes.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key)}
                      className={`px-5 py-2 text-xs font-black transition-all rounded-lg cursor-pointer ${
                        mode === m.key 
                          ? 'bg-white text-slate-950 shadow-xs border border-slate-200' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Settings Panel: Language & Context */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <div className="md:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Globe size={13} className="text-slate-600" /> Spoken Language
                  </label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#151930]/30 focus:border-[#151930] font-bold shadow-2xs cursor-pointer"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi">Hindi / Hinglish</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5 justify-center">
                  {!showContext ? (
                    <button onClick={() => setShowContext(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-900 flex items-center gap-1 transition-colors w-max mt-4">
                      + Add context / topic (Optional)
                    </button>
                  ) : (
                    <>
                      <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between gap-1.5 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Target size={13} className="text-slate-600" /> Context / Speech Topic</span>
                        <button onClick={() => { setShowContext(false); setSituation(''); }} className="text-slate-400 hover:text-slate-700">✕</button>
                      </label>
                      <input 
                        type="text"
                        value={situation}
                        onChange={(e) => setSituation(e.target.value)}
                        placeholder="e.g. Master thesis presentation, casual pitch, storytelling..."
                        className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#151930]/30 focus:border-[#151930] font-medium shadow-2xs"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Recording / Upload Work Area — Standardized & Premium */}
              <div className="w-full flex flex-col items-center justify-center py-3 min-h-[180px]">
                {isLoading ? (
                  <div className="w-full max-w-lg bg-indigo-50/80 border border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 animate-fade-in shadow-sm my-2 text-center">
                    <div className="relative">
                      <div className="w-14 h-14 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
                      <Mic size={20} className="text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Transcribing Audio &amp; Extracting Telemetry...</p>
                      <p className="text-xs text-slate-600 font-semibold">Measuring WPM speed, filler words (&quot;um&quot;, &quot;matlab&quot;), and vocal clarity (1–2s)...</p>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-xs mt-1">
                      <div className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {mediaFile && !isRecording ? (
                      /* Clean Audio Ready State — Placeholder Hidden */
                      <div className="w-full max-w-lg bg-indigo-50/90 border-2 border-indigo-300 rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in shadow-lg">
                        <div className="flex items-center justify-between w-full pb-3 border-b border-indigo-200/80">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs"><FileText size={12} /></span>
                            <span>Audio File Ready</span>
                          </span>
                          <span className="text-xs font-extrabold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
                            {mediaFile.name || 'Recorded Audio'}
                          </span>
                        </div>

                        {mediaUrl && <audio controls src={mediaUrl} className="w-full h-10 rounded-lg border border-indigo-200 shadow-inner" />}

                        <div className="flex items-center gap-3 w-full pt-1">
                          <button
                            onClick={() => { setMediaFile(null); setMediaUrl(''); setRecordingSeconds(0); setShowTimeLimitNotice(false); }}
                            className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5"
                            title="Re-record to match within 60 seconds"
                          >
                            <RotateCcw size={14} className="text-[#F2A93B]" />
                            <span>{challengeDay ? 'Repeat / Re-record (60s)' : 'Change File'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleAnalyze(mediaFile)}
                            className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 via-[#F2A93B] to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#151930] font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
                          >
                            Analyze Audio
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Upload Dropzone or Live Mic Recorder Placeholder */
                      mode === 'upload' ? (
                        <div className="w-full flex flex-col items-center justify-center">
                          <div 
                            className="w-full max-w-lg border-2 border-dashed border-slate-300 hover:border-[#151930] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50/40 transition-all cursor-pointer group" 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#151930] flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform shadow-sm">
                              <Upload size={20} className="text-slate-600" />
                            </div>
                            <p className="font-extrabold text-slate-950 text-sm sm:text-base">Click or Drag & Drop Audio File</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Supports MP3, WAV, M4A, AAC, FLAC (Max 50MB)</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept="audio/*,.mp3,.wav,.m4a,.aac,.flac" onChange={handleFileUpload} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-1">
                          <div className="relative">
                            {isRecording && !isPaused && <div className="absolute -inset-3 rounded-full border-4 border-rose-500 animate-ping opacity-30"></div>}
                            <button 
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl sm:text-5xl transition-all duration-300 shadow-2xl cursor-pointer ${
                                isRecording 
                                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white scale-95 shadow-rose-500/40' 
                                  : 'bg-gradient-to-br from-[#151930] via-indigo-950 to-[#1B2140] text-white hover:scale-105 shadow-[0_15px_30px_-8px_rgba(21,25,48,0.4)] border-4 border-white/20'
                              }`}
                            >
                              {isRecording ? <Square size={28} className="text-white fill-white" /> : <Mic size={34} className="text-white" />}
                            </button>
                          </div>
                          <p className={`mt-4 text-sm sm:text-base font-extrabold ${isRecording ? (isPaused ? 'text-amber-600' : 'text-rose-600 animate-pulse') : 'text-slate-950'}`}>
                            {isRecording ? (isPaused ? 'Recording Paused' : 'Recording in Progress...') : 'Click Mic to Start Recording'}
                          </p>

                          {/* Recording Progress HUD with 60s Daily Challenge Cap */}
                          {isRecording && (
                            <div className="w-full max-w-xs flex flex-col items-center mt-2.5">
                              <div className="flex items-center justify-between w-full text-xs font-bold px-1 mb-1">
                                <span className={recordingSeconds > (challengeDay ? 50 : 150) ? 'text-rose-600 animate-pulse' : 'text-slate-700'}>
                                  {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {challengeDay ? '01:00 Max (Daily Challenge)' : '03:00 Max (Free Drill)'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    recordingSeconds > (challengeDay ? 50 : 150) ? 'bg-rose-500' : recordingSeconds > (challengeDay ? 35 : 100) ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-violet-600'
                                  }`}
                                  style={{ width: `${Math.min(100, (recordingSeconds / (challengeDay ? 60 : MAX_FREE_RECORDING_SECONDS)) * 100)}%` }}
                                />
                              </div>
                              {recordingSeconds >= (challengeDay ? 50 : 165) && (
                                <p className="text-[10px] font-bold text-rose-500 mt-1 animate-pulse">
                                  {challengeDay ? 'Approaching 60-second limit' : 'Approaching 3-min practice cap'}
                                </p>
                              )}
                            </div>
                          )}

                          {showTimeLimitNotice && (
                            <div className="mt-3.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2 max-w-md text-center">
                              <Zap size={14} className="text-amber-600 shrink-0" />
                              <span>
                                {challengeDay 
                                  ? '60-Second Daily Challenge limit reached! Recording stopped automatically and is ready for AI analysis.' 
                                  : '3-Minute Free Practice Drill Limit reached! Your audio was saved and is ready for AI analysis.'}
                              </span>
                            </div>
                          )}
                          
                          {isRecording && (
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={isPaused ? resumeRecording : pauseRecording}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                {isPaused ? 'Resume Recording' : 'Pause Recording'}
                              </button>
                              <button
                                onClick={stopRecording}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                Finish Recording
                              </button>
                            </div>
                          )}

                          {!isRecording && (
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              Free drills are evaluated on up to 3 minutes. Ensure clear mic input.
                            </p>
                          )}
                          
                          {/* Security & Privacy Guarantee Badge */}
                          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-1 rounded-full shadow-2xs">
                            <Shield size={13} className="text-emerald-500" />
                            <span>100% Encrypted & Private • Voice analyzed live</span>
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ============= SECTION: TOPIC SPEECH ============= */}
          {section === 'topic' && (
            <div className="flex flex-col gap-6">
              {/* Phase: Input — pick topic */}
              {topicPhase === 'input' && (
                <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 md:p-10">
                  <div className="bg-gradient-to-br from-[#151930] via-indigo-950 to-[#1B2140] rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden text-white border border-indigo-500/30 shadow-xl">
                    <div className="absolute top-4 right-8 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-3 border border-white/10">
                        Campus Placement & Viva Drills
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Placement & Viva Speech Prompts</h2>
                      <p className="text-slate-300 text-sm md:text-base font-medium">Generate structured answer scripts for high-frequency HR rounds, engineering viva defenses, and IELTS cue cards. Then practice speaking live!</p>
                    </div>
                  </div>

                  <div className="max-w-lg mx-auto">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Interview Question / Viva Topic:</label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <input
                        id="speech-topic-input"
                        type="text"
                        value={topicInput}
                        onChange={(e) => { setTopicInput(e.target.value); setTopicError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !topicLoading) handleGenerateSpeech(); }}
                        placeholder="e.g. Tell me about yourself, Explain my final project, STAR behavioral..."
                        className="flex-1 px-5 py-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-slate-900 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                        disabled={topicLoading}
                        maxLength={200}
                      />
                      <button
                        id="generate-speech-btn"
                        onClick={handleGenerateSpeech}
                        disabled={topicLoading || !topicInput.trim()}
                        className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {topicLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Writing...
                          </>
                        ) : (
                          <>Generate Speech</>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Audience / Context</label>
                        <select
                          value={topicAudience}
                          onChange={(e) => setTopicAudience(e.target.value)}
                          disabled={topicLoading}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all cursor-pointer"
                        >
                          <option value="General Public">General Public / Public Speaking</option>
                          <option value="HR Interview">HR Interview / Hiring Manager</option>
                          <option value="Technical Viva Defense">Technical Viva / Project Defense</option>
                          <option value="Corporate / Executive">Corporate / Executive Leadership</option>
                          <option value="Academic / Classroom">Academic / Classroom Teacher</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Speech Tone</label>
                        <select
                          value={topicTone}
                          onChange={(e) => setTopicTone(e.target.value)}
                          disabled={topicLoading}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all cursor-pointer"
                        >
                          <option value="Professional & Inspiring">Professional & Inspiring</option>
                          <option value="Strict, Concise, & Technical">Strict, Concise, & Technical</option>
                          <option value="Friendly & Conversational">Friendly & Conversational</option>
                          <option value="Persuasive & Confident">Persuasive & Confident</option>
                          <option value="Formal & Academic">Formal & Academic</option>
                        </select>
                      </div>
                    </div>

                    {topicError && (
                      <p className="mt-3 text-sm font-bold text-rose-500 flex items-center justify-center gap-1.5">
                        <AlertTriangle size={14} /> {topicError}
                      </p>
                    )}

                    <div className="mt-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">High-Frequency Placement & Viva Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_TOPICS.map((t) => (
                          <button
                            key={t}
                            onClick={() => { setTopicInput(t); setTopicError(''); }}
                            disabled={topicLoading}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all
                              ${topicInput === t 
                                ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm' 
                                : 'bg-indigo-50 border-indigo-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {topicLoading && (
                    <div className="mt-8 flex flex-col items-center justify-center py-8">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <Edit3 size={24} className="text-orange-600 animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">Writing your speech...</h3>
                      <p className="text-slate-500 text-sm">Creating a simple speech on “{topicInput}”</p>
                      <div className="flex gap-1.5 mt-4">
                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phase: Speech — show generated speech */}
              {topicPhase === 'speech' && generatedSpeech && (
                <div ref={speechRef} className="border border-indigo-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <BookOpen size={18} className="text-white shrink-0" />
                      {isEditingSpeech ? (
                        <input
                          type="text"
                          value={generatedSpeech.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          className="bg-white/20 border border-white/40 text-white font-bold text-lg md:text-xl rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-white/60 w-full"
                          placeholder="Speech Title"
                        />
                      ) : (
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                          {generatedSpeech.title}
                        </h2>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsEditingSpeech(!isEditingSpeech)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isEditingSpeech 
                            ? 'bg-white text-orange-600 shadow-sm' 
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
                        }`}
                      >
                        {isEditingSpeech ? 'Done Editing' : 'Edit Speech'}
                      </button>
                      {originalSpeech && (generatedSpeech.speech !== originalSpeech.speech || generatedSpeech.title !== originalSpeech.title) && (
                        <button
                          onClick={handleResetToOriginal}
                          title="Reset to AI Original Speech"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white text-xs font-semibold hover:bg-white/20 transition-all border border-white/20"
                        >
                          ↺ Reset
                        </button>
                      )}
                      <button
                        onClick={handleCopySpeech}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-semibold hover:bg-white/30 transition-all border border-white/20"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    {isEditingSpeech ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                          <span>Editing Mode: Customize your script below</span>
                          <span>Click “Done Editing” when finished</span>
                        </div>
                        <textarea
                          value={generatedSpeech.speech}
                          onChange={(e) => handleSpeechTextChange(e.target.value)}
                          className="w-full min-h-[220px] p-4 bg-amber-50/60 border border-orange-300 rounded-xl text-slate-900 text-sm md:text-base leading-[1.8] font-medium outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-y font-sans shadow-inner"
                          placeholder="Type or edit your speech script here..."
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingSpeech(true)}
                        className="relative bg-amber-50/40 rounded-xl p-5 border border-amber-100/60 max-h-[280px] overflow-y-auto cursor-pointer group hover:border-orange-300 hover:bg-amber-50/80 transition-all"
                        title="Click to edit speech text"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-indigo-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                          <span>Click to Edit</span>
                        </div>
                        <div className="absolute top-0 left-8 w-px h-full bg-rose-200/30 pointer-events-none"></div>
                        <div className="text-slate-800 text-sm md:text-base leading-[1.8] font-medium whitespace-pre-line pl-5">
                          {generatedSpeech.speech}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-4">
                        <span>{generatedSpeech.speech.split(/\s+/).filter(Boolean).length} words</span>
                        <span>~{Math.ceil(generatedSpeech.speech.split(/\s+/).filter(Boolean).length / 130)} min read</span>
                      </div>
                      {!isEditingSpeech && (
                        <button 
                          onClick={() => setIsEditingSpeech(true)} 
                          className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                        >
                          Edit script
                        </button>
                      )}
                    </div>
                  </div>

                  {generatedSpeech.tips && generatedSpeech.tips.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {generatedSpeech.tips.map((tip, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-50/60 rounded-lg border border-amber-100/60 text-xs">
                            <span className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-orange-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-slate-600 font-medium">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="px-5 pb-5 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handlePracticeSpeech}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                    >
                      <Mic size={16} className="text-amber-400" /> Practice Speaking This
                    </button>
                    <button
                      onClick={handleTopicReset}
                      className="w-full sm:w-auto px-5 py-3 bg-indigo-100 border border-indigo-200 text-slate-700 font-semibold rounded-xl hover:bg-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      Try Another Topic
                    </button>
                  </div>
                </div>
              )}

              {/* Phase: Practice — compact speech + recording side by side */}
              {topicPhase === 'practice' && generatedSpeech && (
                <div className="border border-indigo-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-amber-400" /> Read & Speak
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsEditingInPractice(!isEditingInPractice)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                          isEditingInPractice 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-slate-800 text-indigo-200 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {isEditingInPractice ? 'Done Editing' : 'Edit Script'}
                      </button>
                      <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-1.5 outline-none font-medium cursor-pointer"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-IN">English (India)</option>
                        <option value="hi">Hindi / Hinglish</option>
                      </select>
                      <button
                        onClick={() => setTopicPhase('speech')}
                        className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-indigo-100">
                      {isEditingInPractice ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
                            Editing script live for practice:
                          </div>
                          <textarea
                            value={generatedSpeech.speech}
                            onChange={(e) => handleSpeechTextChange(e.target.value)}
                            className="w-full h-[200px] p-3 bg-amber-50/60 border border-orange-300 rounded-lg text-slate-900 text-sm leading-[1.7] font-medium outline-none focus:ring-2 focus:ring-orange-400 resize-y font-sans"
                            placeholder="Edit speech script for practice..."
                          />
                        </div>
                      ) : (
                        <div 
                          onClick={() => setIsEditingInPractice(true)}
                          className="bg-amber-50/50 rounded-lg p-4 border border-amber-100/60 max-h-[240px] overflow-y-auto cursor-pointer group hover:border-orange-300 transition-all relative"
                          title="Click to edit speech"
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-indigo-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                            Click to Edit
                          </div>
                          <div className="text-slate-800 text-sm leading-[1.7] font-medium whitespace-pre-line">
                            {generatedSpeech.speech}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mt-2">
                        <span>{generatedSpeech.speech.split(/\s+/).filter(Boolean).length} words · Read the speech and record yourself</span>
                        {!isEditingInPractice && (
                          <button onClick={() => setIsEditingInPractice(true)} className="text-orange-600 font-bold hover:underline">
                            Edit text
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 md:w-[240px] shrink-0">
                      {isLoading ? (
                        <div className="flex flex-col items-center animate-pulse">
                          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full border-t-slate-900 animate-spin mb-4"></div>
                          <p className="text-sm font-bold text-slate-500">Analyzing...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            {isRecording && <div className="absolute -inset-3 rounded-full border-4 border-rose-400 animate-ping opacity-20"></div>}
                            <button 
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all shadow-sm ${
                                isRecording 
                                  ? 'bg-rose-50 border-4 border-rose-200 text-rose-600 scale-95' 
                                  : 'bg-white border-4 border-indigo-200 hover:scale-105'
                              }`}
                            >
                              {isRecording ? <Square size={24} className="text-rose-600 fill-rose-600" /> : <Mic size={30} className="text-slate-800" />}
                            </button>
                          </div>
                          <p className={`mt-4 text-sm font-bold text-center ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                            {isRecording ? 'Recording...' : 'Tap to speak'}
                          </p>
                          {isRecording && <p className="text-xs font-medium text-slate-500 mt-1 text-center">Speak clearly</p>}
                        </div>
                      )}

                      <button
                        onClick={handleTopicReset}
                        className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        ← Different topic
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : results.error ? (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">{results.title}</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md">{results.message}</p>
          <button onClick={() => { reset(); if (section === 'topic') handleTopicReset(); }} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-black transition-all">
            Try Again
          </button>
        </div>
      ) : (
        <div className="animate-fade-in-up flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                {isDeepLoading ? "Analyzing Deep Insights..." : "Analysis Complete"}
                {isDeepLoading && <span className="ml-3 inline-block w-5 h-5 border-2 border-indigo-300 border-t-slate-900 rounded-full animate-spin"></span>}
              </h2>
              <p className="text-slate-500 font-medium">Here is your detailed breakdown.</p>
            </div>
            <div className="flex items-center gap-3">
              {challengeDay && (
                <button
                  onClick={() => { reset(); if (section === 'topic') handleTopicReset(); setRecordingSeconds(0); setShowTimeLimitNotice(false); }}
                  disabled={isDeepLoading}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0F1426] text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  <span>Repeat Challenge (60s)</span>
                </button>
              )}
              <button onClick={() => { reset(); if (section === 'topic') handleTopicReset(); }} disabled={isDeepLoading} className="px-5 py-2.5 bg-white border border-indigo-200 rounded-xl text-slate-900 text-sm font-bold shadow-sm hover:bg-indigo-50 transition-all disabled:opacity-50">
                Start New Session
              </button>
            </div>
          </div>

          {/* Universal Audio Recording Preview Player */}
          {lastSessionId && (
            <MediaPreviewPlayer
              sessionId={lastSessionId}
              mediaType="audio"
              title="Speech Practice Audio Recording & Waveform"
            />
          )}

          {/* Placement & Delivery Practice Gym: 30-Second Clean Re-Do Drill */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-3xl p-0.5 shadow-xl animate-fade-in">
            <div className="bg-white rounded-[23px] p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider">
                    <Flame size={13} className="text-amber-600" /> Interactive Practice Drill
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950">
                    The 30-Second Clean Re-Do Challenge
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Spoken repetition eliminates verbal crutches. Re-speak your thesis in 30 seconds with <strong>ZERO filler words</strong>.
                  </p>
                </div>
                {!showCleanDrill ? (
                  <button
                    onClick={() => setShowCleanDrill(true)}
                    className="px-5 py-3 bg-[#151930] hover:bg-slate-900 text-[#F2A93B] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:scale-105"
                  >
                    <Play size={14} className="fill-[#F2A93B]" />
                    <span>Open 30s Clean Drill</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { stopCleanDrill(); setShowCleanDrill(false); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Drill
                  </button>
                )}
              </div>

              {showCleanDrill && (
                <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col items-center gap-4 animate-fade-in text-center">
                  <div className="space-y-1 max-w-md">
                    <span className="text-[11px] text-amber-400 font-black uppercase tracking-widest">
                      Muscle Memory Rule
                    </span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Whenever you feel the urge to say &quot;um&quot;, &quot;like&quot;, or &quot;basically&quot;, <strong>pause silently for 1 second</strong>. Silence conveys executive authority.
                    </p>
                  </div>

                  {/* 30-Second Circular Timer */}
                  <div className="relative flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                      isCleanDrillRecording 
                        ? 'bg-rose-500/20 border-2 border-rose-500 animate-pulse text-rose-400' 
                        : cleanDrillCompleted
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-2 border-slate-700 text-slate-200'
                    }`}>
                      <span className="text-2xl font-black font-mono leading-none">{cleanDrillSeconds}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">SEC</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {!isCleanDrillRecording && !cleanDrillCompleted && (
                      <button
                        onClick={startCleanDrill}
                        className="px-6 py-3 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 text-[#151930] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                      >
                        <Mic size={16} />
                        <span>Start 30s Clean Drill</span>
                      </button>
                    )}

                    {isCleanDrillRecording && (
                      <button
                        onClick={stopCleanDrill}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Square size={14} className="fill-white" />
                        <span>Finish &amp; Check Cleanliness</span>
                      </button>
                    )}

                    {cleanDrillCompleted && (
                      <button
                        onClick={startCleanDrill}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Repeat Drill</span>
                      </button>
                    )}
                  </div>

                  {/* Filler counter */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-slate-400">Fillers detected in retry:</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono font-black ${
                      cleanDrillFillers.length === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {cleanDrillFillers.length} {cleanDrillFillers.length === 1 ? 'filler' : 'fillers'}
                    </span>
                  </div>

                  {/* Live Transcript */}
                  {cleanDrillTranscript && (
                    <div className="w-full max-w-lg bg-[#151930] border border-slate-800 rounded-xl p-3 text-left text-xs font-medium text-slate-200 leading-relaxed max-h-24 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Live Re-Spoken Text:</span>
                      &ldquo;{cleanDrillTranscript}&rdquo;
                    </div>
                  )}

                  {/* Completion Evaluation */}
                  {cleanDrillCompleted && (
                    <div className={`w-full max-w-lg p-3.5 rounded-xl border text-left text-xs font-medium space-y-1 animate-fade-in ${
                      cleanDrillFillers.length === 0
                        ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                        : 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                    }`}>
                      <div className="flex items-center justify-between font-black uppercase text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className={cleanDrillFillers.length === 0 ? 'text-emerald-400' : 'text-amber-400'} />
                          <span>{cleanDrillFillers.length === 0 ? 'Zero-Filler Mastery!' : 'Drill Completed!'}</span>
                        </span>
                        <span className="text-amber-400 font-extrabold">+{cleanDrillXp} Bonus XP</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {cleanDrillFillers.length === 0
                          ? 'Outstanding control. Pausing instead of uttering filler words immediately elevates your perceived confidence and leadership presence.'
                          : `Good attempt! You noted '${cleanDrillFillers.join(', ')}'. Do 1 more rep and consciously inhale quietly whenever you want to fill the silence.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {mediaUrl && (
            <div className="flex flex-col gap-5 w-full">
              {/* Dark Compact Audio Player Header */}
              <div className="bg-slate-900 rounded-2xl p-5 shadow-md flex flex-col gap-3 w-full text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Recording Audio Player</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {results.duration ? `${Math.floor(results.duration / 60)}m ${Math.floor(results.duration % 60)}s total` : ''}
                  </span>
                </div>
                <audio ref={audioRef} controls src={mediaUrl} className="w-full h-11 rounded-xl" />
              </div>

              {/* Dedicated Full-Width Timestamp Coaching Suggestions Section */}
              {results.timeMarkers && results.timeMarkers.length > 0 && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                        <span>⏱️ Timestamp Coaching Suggestions</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Click any moment card to jump audio playback directly to that timestamp
                      </p>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full shrink-0">
                      {results.timeMarkers.length} Moments Flagged
                    </span>
                  </div>

                  {/* Full Spacious Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-1">
                    {results.timeMarkers.map((marker, idx) => (
                      <div
                        key={idx}
                        onClick={() => jumpToTime(marker.time)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 hover:shadow-md ${
                          marker.type === 'strength'
                            ? 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200/80 hover:border-emerald-400'
                            : marker.type === 'weakness'
                            ? 'bg-rose-50/40 hover:bg-rose-50 border-rose-200/80 hover:border-rose-400'
                            : 'bg-indigo-50/40 hover:bg-indigo-50 border-indigo-200/80 hover:border-indigo-400'
                        }`}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); jumpToTime(marker.time); }}
                          className={`shrink-0 mt-0.5 px-3 py-1.5 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 shadow-2xs group-hover:scale-105 transition-transform ${
                            marker.type === 'strength'
                              ? 'bg-emerald-600 text-white'
                              : marker.type === 'weakness'
                              ? 'bg-rose-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          <span>▶</span>
                          <span>
                            {Math.floor(marker.time / 60)}:{(Math.floor(marker.time % 60)).toString().padStart(2, '0')}
                          </span>
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                marker.type === 'strength'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : marker.type === 'weakness'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {marker.type === 'strength' ? 'Strength' : marker.type === 'weakness' ? 'Area to Improve' : 'Suggestion'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed break-words">
                            {marker.feedback}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#151930] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  <FileText size={18} className="text-white" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Speech Transcript</h3>
                  <p className="text-xs text-slate-500 font-medium">Text transcribed directly from your recording</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black px-3 py-1.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                  {results.transcript ? results.transcript.split(/\s+/).filter(Boolean).length : 0} words
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(results.transcript || '');
                    alert('Transcript copied to clipboard!');
                  }}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Copy size={13} /> Copy Text
                </button>
              </div>
            </div>
            {results.isAnalyzing ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-2.5 animate-pulse">
                <div className="h-4 bg-slate-200/90 rounded-md w-5/6"></div>
                <div className="h-4 bg-slate-200/90 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-200/90 rounded-md w-2/3"></div>
                <p className="text-xs font-bold text-indigo-600 pt-1">Transcribing speech audio & extracting filler words...</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-sm md:text-base font-medium text-slate-800 leading-relaxed italic">
                &quot;{results.transcript || "No transcript detected."}&quot;
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-600" /> Executive Speech Analysis & Pacing
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Academic evaluation aligned with international CEFR & IELTS Spoken Fluency benchmarks
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {results.cefrBand && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    CEFR: {results.cefrBand}
                  </span>
                )}
                {results.ieltsBand && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-50 border border-teal-200 text-teal-700 shadow-2xs">
                    IELTS: Band {results.ieltsBand}
                  </span>
                )}
                <button
                  onClick={() => setShowScoreAudit(prev => !prev)}
                  className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  {showScoreAudit ? 'Close Audit' : 'Verify Score Audit'}
                </button>
              </div>
            </div>

            {/* Collapsible Scientific Score Audit Modal / Banner */}
            {showScoreAudit && results.rubric && (
              <div className="mb-6 bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
                        100% Deterministic Rubric
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">Institutional Grade Audit</span>
                    </div>
                    <h4 className="text-lg font-black text-white mt-1">
                      Academic Score Calculation: {results.rubric.overallScore}/100 pts
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Standard</span>
                      <span className="text-xs font-black text-indigo-400">{results.rubric.benchmark.cefrTitle}</span>
                    </div>
                  </div>
                </div>

                {/* 3 Pillars Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
                  {/* Pillar 1 */}
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">1. Pacing Control</span>
                      <span className="text-sm font-black text-white">{results.rubric.pacing.score}/30 pts</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${results.rubric.pacing.percentage}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-2">{results.rubric.pacing.summary}</p>
                    {results.rubric.pacing.deductions.length > 0 && (
                      <p className="text-[11px] text-rose-300 mt-1.5 leading-snug flex items-center gap-1">
                        <AlertCircle size={11} className="text-rose-400 shrink-0" /> {results.rubric.pacing.deductions[0]}
                      </p>
                    )}
                    {results.rubric.pacing.bonuses.length > 0 && (
                      <p className="text-[11px] text-emerald-300 mt-1.5 leading-snug flex items-center gap-1">
                        <Check size={11} className="text-emerald-400 shrink-0" /> {results.rubric.pacing.bonuses[0]}
                      </p>
                    )}
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-300">2. Fluency & Fillers</span>
                      <span className="text-sm font-black text-white">{results.rubric.fluency.score}/30 pts</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${results.rubric.fluency.percentage}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-2">{results.rubric.fluency.summary}</p>
                    {results.rubric.fluency.deductions.length > 0 && (
                      <p className="text-[11px] text-rose-300 mt-1.5 leading-snug flex items-center gap-1">
                        <AlertCircle size={11} className="text-rose-400 shrink-0" /> {results.rubric.fluency.deductions[0]}
                      </p>
                    )}
                    {results.rubric.fluency.bonuses.length > 0 && (
                      <p className="text-[11px] text-emerald-300 mt-1.5 leading-snug flex items-center gap-1">
                        <Check size={11} className="text-emerald-400 shrink-0" /> {results.rubric.fluency.bonuses[0]}
                      </p>
                    )}
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-300">3. Coherence & Lexicon</span>
                      <span className="text-sm font-black text-white">{results.rubric.vocabularyAndStructure.score}/40 pts</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full" style={{ width: `${results.rubric.vocabularyAndStructure.percentage}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-2">{results.rubric.vocabularyAndStructure.summary}</p>
                    {results.rubric.vocabularyAndStructure.deductions.length > 0 && (
                      <p className="text-[11px] text-rose-300 mt-1.5 leading-snug flex items-center gap-1">
                        <AlertCircle size={11} className="text-rose-400 shrink-0" /> {results.rubric.vocabularyAndStructure.deductions[0]}
                      </p>
                    )}
                    {results.rubric.vocabularyAndStructure.bonuses.length > 0 && (
                      <p className="text-[11px] text-emerald-300 mt-1.5 leading-snug flex items-center gap-1">
                        <Check size={11} className="text-emerald-400 shrink-0" /> {results.rubric.vocabularyAndStructure.bonuses[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trust Guarantee note */}
                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 flex items-start gap-2.5">
                  <Shield size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">Institutional Transparency Guarantee:</strong> {results.rubric.trustGuarantee}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
                {/* Rounded Score Gauge Rings Bar */}
                <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-indigo-50/60 via-slate-50 to-amber-50/40 p-4 rounded-2xl border border-indigo-100/80 shadow-2xs">
                  <ScoreRing 
                    value={parseInt(results.overallScore) || 0} 
                    max={100} 
                    size={76} 
                    strokeWidth={8} 
                    color="#6c5ce7" 
                    label="Overall Score" 
                    unit="%" 
                  />
                  <ScoreRing 
                    value={results.wpm || 0} 
                    max={200} 
                    size={76} 
                    strokeWidth={8} 
                    color="#00cec9" 
                    label="Pacing" 
                    unit="WPM" 
                  />
                  <ScoreRing 
                    value={Math.max(0, 100 - (results.fillers?.reduce((a: number, b: any) => a + b.count, 0) || 0) * 8)} 
                    max={100} 
                    size={76} 
                    strokeWidth={8} 
                    color="#fd79a8" 
                    label="Fluency" 
                    unit="%" 
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-3 ${
                    results.overallScore >= 85 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
                    results.overallScore >= 70 ? 'bg-blue-50 border-blue-200 text-blue-950' :
                    results.overallScore >= 50 ? 'bg-amber-50 border-amber-200 text-amber-950' :
                    'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">Overall Rating</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black">{results.overallScore}%</span>
                        <span className="text-xs font-bold opacity-80">
                          {results.overallScore >= 85 ? 'Excellent' : results.overallScore >= 70 ? 'Good' : results.overallScore >= 50 ? 'Needs Work' : 'Keep Practicing'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Vocal Tone</span>
                      {isDeepLoading ? (
                        <div className="h-6 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
                      ) : (
                        <span className="text-lg font-black text-[#151930] truncate mt-0.5">{results.tone || "Neutral"}</span>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Avg. Pacing</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-black text-slate-950">{results.wpm}</span>
                        <span className="text-xs font-bold text-slate-400">WPM</span>
                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded uppercase ${pacingInfo.color} bg-white border border-slate-200 ml-1`}>
                          {pacingInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Filler Words</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-black text-slate-950">{results.fillers.reduce((a: number, b: any) => a + b.count, 0)}</span>
                        {results.fillers.length > 0 && (
                          <div className="flex items-center gap-1 overflow-hidden">
                            {results.fillers.slice(0, 2).map((f: any) => (
                              <span key={f.word} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 truncate">
                                &quot;{f.word}&quot; x{f.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Interactive Speaking Pace & Energy Timeline</span>
                  <p className="text-[11px] text-indigo-600 font-medium">Click any point or event pin on the chart to jump audio playback</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {results.duration ? `${Math.floor(results.duration / 60)}m ${Math.floor(results.duration % 60)}s total` : ''}
                </span>
              </div>
              <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
                <ConfidenceGraph 
                  data={results.paceData || []} 
                  events={results.events && results.events.length > 0 ? results.events : (results.timeMarkers || []).map((m: any) => ({
                    timestamp: m.time,
                    type: m.type === 'strength' ? 'excellent_moment' : (m.type === 'weakness' ? 'speaking_fast' : 'filler_word'),
                    message: m.feedback
                  }))} 
                  type="area" 
                  dataKey="wpm" 
                  label="Pace (WPM)" 
                  color="#6c5ce7" 
                  height={220}
                  onSeekAudio={(timestamp) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = timestamp;
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/80 border-t-4 border-t-emerald-500 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">
                  Key Strengths
                </h3>
              </div>
              {isDeepLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              ) : (
                <ul className="space-y-3 font-medium text-sm text-slate-700 flex-1">
                  {results.strengths?.length > 0 ? results.strengths.map((s, i) => (
                    <FeedbackItem key={i} text={s} colorClass="text-slate-800" icon={<Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />} />
                  )) : <li className="text-slate-500 italic">No specific strengths detected.</li>}
                </ul>
              )}
            </div>

            <div className="bg-white border border-slate-200/80 border-t-4 border-t-rose-500 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                  !
                </span>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">
                  Areas to Improve
                </h3>
              </div>
              {isDeepLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              ) : (
                <ul className="space-y-3 font-medium text-sm text-slate-700 flex-1">
                  {results.weaknesses?.length > 0 ? results.weaknesses.map((w, i) => (
                    <FeedbackItem key={i} text={w} colorClass="text-slate-800" icon={<AlertCircle size={13} className="text-rose-600 shrink-0 mt-0.5" />} />
                  )) : <li className="text-slate-500 italic">No specific areas to improve identified.</li>}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 border-t-4 border-t-indigo-600 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-[#151930] flex items-center justify-center text-xs font-bold">
                  <Target size={13} className="text-indigo-600" />
                </span>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">
                  Recommendations & Actionable Coaching Plan
                </h3>
              </div>
              {results?.feedback && (
                <button
                  onClick={() => handleSpeakFeedback(results.feedback)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Listen to AI Coach feedback aloud"
                >
                  {isSpeaking ? 'Stop Voice' : 'Listen to AI Coach'}
                </button>
              )}
            </div>
            {isDeepLoading ? (
              <div className="space-y-2 animate-pulse mb-4">
                <div className="h-4 bg-indigo-100 rounded w-full"></div>
                <div className="h-4 bg-indigo-100 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-base font-medium text-slate-800 leading-relaxed mb-6 bg-indigo-50 border border-indigo-200/70 p-4 rounded-xl">
                {results.feedback}
              </p>
            )}
            {!isDeepLoading && results.suggestions?.length > 0 && (
              <div className="bg-white rounded-xl">
                <p className="text-xs font-bold text-[#1B2140] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span>Targeted Next Steps</span>
                </p>
                <ul className="space-y-3 text-sm font-medium">
                  {results.suggestions.map((s, i) => (
                    <FeedbackItem key={i} text={s} colorClass="text-slate-700" icon={<ArrowRight size={13} className="text-indigo-600 shrink-0 mt-0.5" />} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <XPToast events={xpEvents} onComplete={() => setXpEvents([])} />
      <TrialSignupPrompt isOpen={showTrialPrompt} onClose={() => setShowTrialPrompt(false)} />
      <GuestAuthModal isOpen={isGuestAuthModalOpen} onClose={() => setIsGuestAuthModalOpen(false)} featureName="Speech Coach" />
      <InsufficientCreditsModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} requiredCredits={1} currentBalance={creditBalance} featureName="Speech Coach" />
    </div>
  );
}
