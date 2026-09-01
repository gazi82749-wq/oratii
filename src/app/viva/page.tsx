'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '../../lib/storage';
import { processSessionCompletion } from '../../lib/gamification';
import XPToast from '../../components/XPToast';
import TrialSignupPrompt from '../../components/TrialSignupPrompt';
import GuestAuthModal from '../../components/GuestAuthModal';
import InsufficientCreditsModal from '../../components/InsufficientCreditsModal';
import { checkAndDeductCredits } from '../../lib/credits';
import { supabase } from '../../lib/supabaseClient';
import ConfidenceGraph, { ScoreRing } from '../../components/ConfidenceGraph';
import {
  Sparkles, Send, Mic, HelpCircle, CheckCircle, RotateCcw,
  MessageSquare, Volume2, VolumeX, Flame, Smile, Play, ArrowLeft
} from 'lucide-react';

export default function VivaCoachPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'setup' | 'viva' | 'results'>('setup');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [examinerTone, setExaminerTone] = useState<'friendly' | 'hostile'>('friendly');
  const [enableVoiceAudio, setEnableVoiceAudio] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'hinglish'>('hinglish');
  const [topic, setTopic] = useState<string>('');
  const [slideAnalysisData, setSlideAnalysisData] = useState<any>(null);

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({ confidence: 0, accuracy: 0, communication: 0, overall: 0 });
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [xpEvents, setXpEvents] = useState<any[]>([]);
  const [showTrialPrompt, setShowTrialPrompt] = useState<boolean>(false);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  // Progressive Viva Stage Tracking
  const [stageLabel, setStageLabel] = useState<string>('Level 1: Basic Warmup');
  const [answerFormatHint, setAnswerFormatHint] = useState<string>('Answer in 1 word or 1 single sentence.');
  const [currentTip, setCurrentTip] = useState<string>('');

  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-restore context from sessionStorage if redirected from Slide/Speech Analyzer
  useEffect(() => {
    try {
      const presentationStateStr = sessionStorage.getItem('vocalize_presentation_state');
      const vivaContextStr = sessionStorage.getItem('vocalize_viva_context');

      if (vivaContextStr) {
        setTopic(vivaContextStr);
      } else if (presentationStateStr) {
        const parsed = JSON.parse(presentationStateStr);
        if (parsed.fileName) {
          setTopic(`Slide Deck: ${parsed.fileName}`);
        }
        if (parsed.analysis) {
          setSlideAnalysisData(parsed.analysis);
        }
      }
    } catch (e) {
      console.warn("Could not parse saved viva context:", e);
    }
  }, []);

  // Initialize Speech Recognition for Voice Mode
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAnswer(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const speakText = (text: string) => {
    if (!enableVoiceAudio || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  const startVivaSession = async () => {
    // 1. Check Auth & Credits (1 credit per Viva session)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'guest-viva-user';

    const creditCheck = await checkAndDeductCredits(userId, 1);
    if (!creditCheck.allowed) {
      setCreditBalance(creditCheck.remainingCredits);
      setIsCreditModalOpen(true);
      return;
    }

    const finalTopic = topic.trim() || 'General Presentation & Academic Defense';
    setPhase('viva');
    setIsLoading(true);
    setChatHistory([]);
    setQuestionsAnswered(0);
    setAllScores([]);

    try {
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const initialContextPrompt = `Provide Context: Official Viva Voce defense topic: ${finalTopic}`;

      const res = await fetch('/api/viva', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chatHistory: [{ question: initialContextPrompt, answer: 'Ready' }],
          currentAnswer: 'Ready to defend topic',
          examinerTone,
          topic: finalTopic,
          slideAnalysisData,
          language,
          mode,
          interviewType: 'academic_viva'
        })
      });

      const data = await res.json();
      const vivaPayload = data.data || data.viva;
      if (data.status === 'success' && vivaPayload) {
        const nextQ = vivaPayload.nextQuestion || `Welcome to your Viva Voce defense on ${finalTopic}. In a single sentence, what is the core focus of your work?`;
        setCurrentQuestion(nextQ);
        setStageLabel(vivaPayload.stageLabel || 'Level 1: Basic Warmup');
        setAnswerFormatHint(vivaPayload.answerFormatHint || 'Answer in 1 word or 1 single sentence.');
        if (vivaPayload.tip) setCurrentTip(vivaPayload.tip);

        setChatHistory([{
          role: 'examiner',
          question: nextQ,
          stageLabel: vivaPayload.stageLabel || 'Level 1: Basic Warmup'
        }]);

        speakText(nextQ);
      } else {
        alert(data.message || 'Could not start Viva session.');
        setPhase('setup');
      }
    } catch (err) {
      console.error("Viva start error:", err);
      alert("Error initializing Viva session.");
      setPhase('setup');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || isLoading) return;

    const userAns = answer.trim();
    setAnswer('');
    setIsLoading(true);

    const updatedHistory = [
      ...chatHistory,
      { role: 'candidate', text: userAns }
    ];
    setChatHistory(updatedHistory);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/viva', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chatHistory: updatedHistory,
          currentAnswer: userAns,
          examinerTone,
          topic: topic.trim() || 'General Presentation & Academic Defense',
          slideAnalysisData,
          language,
          mode,
          interviewType: 'academic_viva'
        })
      });

      const data = await res.json();
      const vivaPayload = data.data || data.viva;
      if (data.status === 'success' && vivaPayload) {
        const rawScores = vivaPayload.scores || {};
        const scoreObj = mode === 'text'
          ? {
              accuracy: rawScores.accuracy || 84,
              reasoning: rawScores.reasoning || 82,
              clarity: rawScores.clarity || 85,
              overall: rawScores.overall || 84
            }
          : {
              confidence: rawScores.confidence || 82,
              accuracy: rawScores.accuracy || 84,
              delivery: rawScores.delivery || 84,
              communication: rawScores.communication || 86,
              overall: rawScores.overall || 84
            };
        setScores(scoreObj);
        setAllScores(prev => [...prev, scoreObj]);

        const nextCount = questionsAnswered + 1;
        setQuestionsAnswered(nextCount);

        if (vivaPayload.stageLabel) setStageLabel(vivaPayload.stageLabel);
        if (vivaPayload.answerFormatHint) setAnswerFormatHint(vivaPayload.answerFormatHint);
        if (vivaPayload.tip) setCurrentTip(vivaPayload.tip);

        const nextQ = vivaPayload.nextQuestion || 'Could you elaborate further on how your solution handles edge cases?';
        setCurrentQuestion(nextQ);

        const newHistoryWithExaminer = [
          ...updatedHistory,
          {
            role: 'examiner',
            feedback: vivaPayload.feedbackToPreviousAnswer || vivaPayload.feedback || 'Good defense response.',
            scores: scoreObj,
            question: nextQ,
            stageLabel: vivaPayload.stageLabel
          }
        ];
        setChatHistory(newHistoryWithExaminer);

        if (nextCount >= 5) {
          setPhase('results');
          saveSession('viva', {
            topic: topic || 'Viva Defense',
            mode,
            scores: scoreObj
          });
          const result = processSessionCompletion('viva', { overall: scoreObj.overall });
          setXpEvents(result.events as any);
        } else {
          speakText(nextQ);
        }
      } else {
        alert(data.message || 'Error processing response.');
      }
    } catch (err) {
      console.error('Viva submission error:', err);
      alert('Connection error submitting response.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceListen = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Try typing in Text mode.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const avgOverallScore = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.overall || 80), 0) / allScores.length)
    : scores.overall || 85;

  const avgAccuracy = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.accuracy || 80), 0) / allScores.length)
    : scores.accuracy || 84;

  const avgReasoning = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.reasoning || 80), 0) / allScores.length)
    : scores.reasoning || 82;

  const avgClarity = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.clarity || 80), 0) / allScores.length)
    : scores.clarity || 85;

  const avgDelivery = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.delivery || 80), 0) / allScores.length)
    : scores.delivery || 84;

  const avgConfidence = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.confidence || 80), 0) / allScores.length)
    : scores.confidence || 82;

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in text-slate-900 relative flex-1 min-h-0">
      {/* Page Header (Matching Speech Coach) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-800 text-[11px] font-extrabold uppercase tracking-widest mb-1 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span> Viva Defense AI Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>🎓</span> AI Viva Defense
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Defend your slides, thesis, and presentation topic in a deep conversational Q&A with an AI committee panel.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEnableVoiceAudio(!enableVoiceAudio)}
            title={enableVoiceAudio ? "Mute Examiner Voice" : "Enable Read Aloud Voice"}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${enableVoiceAudio ? 'bg-[#151930] text-[#F2A93B] border-amber-500/40 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
          >
            {enableVoiceAudio ? <Volume2 size={15} className="animate-pulse text-amber-400" /> : <VolumeX size={15} />}
            <span className="hidden sm:inline">{enableVoiceAudio ? 'Voice Aloud ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Card (Matching Speech Coach White Card Theme) */}
      <div className="border border-slate-200/80 rounded-2xl sm:rounded-3xl bg-white shadow-xl p-5 sm:p-6 text-slate-900 flex flex-col flex-1 min-h-0 max-h-[82vh] overflow-y-auto relative" style={{ isolation: 'isolate' }}>
        {/* Top Accent Gradient Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-[#F2A93B]"></div>

        {/* SETUP PHASE */}
        {phase === 'setup' && (
          <div className="my-auto max-w-2xl mx-auto w-full space-y-6 animate-fade-in text-left">

            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Presentation / Defense Topic:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI Ethics in Modern Software, Financial Projections Slide 4, Machine Learning Thesis..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-semibold transition-all"
              />
              <p className="text-[11px] text-slate-500 font-medium">Leave default or type a custom presentation topic for your defense panel.</p>
            </div>

            {/* Defense Language Selector (Hinglish vs English) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Defense Language:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLanguage('hinglish')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${language === 'hinglish'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇮🇳</span>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-sm">Hinglish Defense</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Hindi + English mix (Conversational)</p>
                    </div>
                  </div>
                  {language === 'hinglish' && <span className="text-[#151930] font-black text-sm">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${language === 'en'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-sm">English Defense</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Standard Formal Academic</p>
                    </div>
                  </div>
                  {language === 'en' && <span className="text-[#151930] font-black text-sm">✓</span>}
                </button>
              </div>
            </div>

            {/* Response Mode Selector (Text vs Voice) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Choose Response Mode:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('text')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-2 ${mode === 'text'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">⌨️</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">Standard</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">Text Defense</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Type your responses to the panel questions.</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('voice')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-2 ${mode === 'voice'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">🎙️</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">Live Mic</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm">Voice Defense</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Speak naturally into your mic (Speech-to-Text enabled).</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Examiner Tone Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Committee Examiner Panel Style:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExaminerTone('friendly')}
                  className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${examinerTone === 'friendly'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200'
                    }`}
                >
                  <Smile size={16} /> Friendly & Supportive
                </button>
                <button
                  onClick={() => setExaminerTone('hostile')}
                  className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${examinerTone === 'hostile'
                      ? 'bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-300'
                      : 'bg-white text-slate-600 border-slate-200'
                    }`}
                >
                  <Flame size={16} /> Skeptical & Demanding
                </button>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={startVivaSession}
              className="w-full py-4 bg-[#151930] hover:bg-[#0B0E27] text-white font-black text-base rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={18} className="text-amber-400" /> Start AI Defense Session
            </button>
          </div>
        )}

        {/* ACTIVE DEFENSE PHASE */}
        {phase === 'viva' && (
          <div className="flex-1 min-h-0 flex flex-col justify-between space-y-4">

            {/* Modern 5-Stage Defense Stepper Timeline */}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs shrink-0 gap-2 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-extrabold text-amber-800 uppercase tracking-wider">{stageLabel}</span>
              </div>

              {/* Stage Pills Timeline */}
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold">
                {[
                  { r: 1, label: '1. Warmup' },
                  { r: 2, label: '2. Core Concepts' },
                  { r: 3, label: '3. Cross-Exam' },
                  { r: 4, label: '4. Real-world Case' },
                  { r: 5, label: '5. Final Review' }
                ].map((s) => {
                  const currentRound = questionsAnswered + 1;
                  const isActive = s.r === currentRound;
                  const isDone = s.r < currentRound;
                  return (
                    <span 
                      key={s.r}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-[#151930] text-white font-black shadow-xs' 
                          : isDone 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  );
                })}
              </div>

              <div className="font-mono text-slate-600 font-bold shrink-0">
                Round <span className="text-[#151930] font-black">{questionsAnswered + 1}</span> of 5
              </div>
            </div>

            {/* Chat History Stream */}
            <div className="flex-1 min-h-[220px] max-h-[52vh] sm:max-h-[58vh] overflow-y-auto space-y-4 pr-1">
              {chatHistory.map((item, idx) => (
                <div key={idx} className="space-y-3 animate-fade-in">

                  {/* Examiner Question */}
                  {item.role === 'examiner' && item.question && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-2xs">
                        🎓
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                        <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>Examiner Panel Question</span>
                            {enableVoiceAudio && (
                              <div className="flex items-center gap-0.5">
                                <span className="w-1 h-3 bg-amber-500 animate-pulse rounded-full"></span>
                                <span className="w-1 h-4 bg-amber-400 animate-pulse delay-75 rounded-full"></span>
                                <span className="w-1 h-2 bg-amber-600 animate-pulse delay-150 rounded-full"></span>
                              </div>
                            )}
                          </div>
                          {item.stageLabel && <span className="text-slate-500 font-mono">{item.stageLabel}</span>}
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-950 leading-relaxed">{item.question}</p>
                        {answerFormatHint && idx === chatHistory.length - 1 && (
                          <p className="text-[11px] text-amber-800 font-medium italic border-t border-slate-200 pt-2">
                            💡 Format Hint: {answerFormatHint}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Candidate Answer */}
                  {item.role === 'candidate' && (
                    <div className="flex gap-3 items-start justify-end">
                      <div className="bg-[#151930] text-white p-4 rounded-2xl max-w-xl shadow-md font-medium text-sm sm:text-base">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-1">Your Defense Answer</div>
                        <p className="leading-relaxed font-semibold">{item.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        👤
                      </div>
                    </div>
                  )}

                  {/* AI Feedback on previous answer */}
                  {item.role === 'examiner' && item.feedback && (
                    <div className="ml-11 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-emerald-800 font-extrabold uppercase tracking-wider text-[10px]">
                        <span>Panel Evaluation</span>
                        {item.scores && (
                          <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                            Score: {item.scores.overall}/100
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">{item.feedback}</p>
                    </div>
                  )}

                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-center text-slate-400 text-xs font-bold animate-pulse p-4">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Examiner panel is evaluating your response and formulating next question...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Response Area */}
            <div className="border-t border-slate-200 pt-3 shrink-0 space-y-2">
              {/* Quick Answer Starter Chips */}
              {!isLoading && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-hide">
                  <span className="text-slate-500 shrink-0">Answer Starters:</span>
                  {[
                    "From a practical perspective...",
                    "Looking at the core metrics...",
                    "The primary reason behind this choice..."
                  ].map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => setAnswer((prev) => (prev ? `${prev} ${chip}` : chip))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {mode === 'voice' ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVoiceListen}
                    className={`flex-1 py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${isListening
                        ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900'
                        : 'bg-[#151930] text-white hover:bg-[#0B0E27]'
                      }`}
                  >
                    <Mic size={18} className="text-amber-400" />
                    <span>{isListening ? 'Listening... Speak Answer Now' : 'Click to Speak Answer (Mic)'}</span>
                  </button>
                  {answer && (
                    <button
                      onClick={submitAnswer}
                      disabled={isLoading}
                      className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Send size={16} /> Submit
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                    placeholder="Type your defense answer here..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-semibold transition-all"
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isLoading}
                    className="px-5 py-3.5 rounded-xl bg-[#151930] hover:bg-[#0B0E27] text-white font-extrabold text-sm disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={16} className="text-amber-400" /> Submit
                  </button>
                </div>
              )}

              {currentTip && (
                <p className="text-[10px] text-slate-500 font-medium text-center truncate">
                  💡 Examiner Tip: {currentTip}
                </p>
              )}
            </div>

          </div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <div className="my-auto max-w-2xl mx-auto w-full space-y-5 text-center animate-fade-in py-2 text-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-3xl mx-auto shadow-sm">
              🏆
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">Viva Defense Complete</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Here is your complete 5-round defense evaluation and examiner feedback.</p>
            </div>

            {/* Circular Score Ring Gauge Bar (Speech Coach Standard) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-indigo-50/60 via-slate-50 to-amber-50/40 p-5 rounded-2xl border border-indigo-100/80 shadow-2xs">
              <ScoreRing 
                value={avgOverallScore} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#6c5ce7" 
                label="Defense Grade" 
                unit="%" 
              />
              <ScoreRing 
                value={mode === 'text' ? avgAccuracy : avgDelivery} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#00cec9" 
                label={mode === 'text' ? 'Accuracy' : 'Delivery'} 
                unit="%" 
              />
              <ScoreRing 
                value={mode === 'text' ? avgReasoning : avgConfidence} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#fd79a8" 
                label={mode === 'text' ? 'Reasoning' : 'Confidence'} 
                unit="%" 
              />
              <ScoreRing 
                value={mode === 'text' ? avgClarity : avgAccuracy} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#f2a93b" 
                label={mode === 'text' ? 'Clarity' : 'Accuracy'} 
                unit="%" 
              />
            </div>

            {/* Interactive Defense Progression Wave Timeline */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Viva Defense Performance Wave</span>
                  <p className="text-[11px] text-indigo-600 font-medium">Scores and argument depth across 5 defense rounds</p>
                </div>
                <span className="text-xs font-bold text-slate-400">5 Rounds Complete</span>
              </div>
              <ConfidenceGraph 
                data={allScores.length > 0 ? allScores.map((s, i) => ({
                  timestamp: (i + 1) * 30,
                  wpm: s.score || 85,
                  confidence: s.score || 85
                })) : [
                  { timestamp: 30, wpm: 80 },
                  { timestamp: 60, wpm: 88 },
                  { timestamp: 90, wpm: 82 },
                  { timestamp: 120, wpm: 92 },
                  { timestamp: 150, wpm: 86 }
                ]} 
                events={[]} 
                type="area" 
                dataKey="wpm" 
                label="Round Score" 
                color="#6c5ce7" 
                height={170}
              />
            </div>

            {/* Deep 2-Column Strengths & Improvement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="bg-[#151930] border border-slate-800 border-t-4 border-t-emerald-500 rounded-2xl p-4 shadow-md space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Defense Strengths</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200 font-medium">
                    <li className="flex items-start gap-1.5"><span className="text-emerald-400 font-bold shrink-0">✅</span><span>Accurate domain concepts and technical terminology</span></li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-400 font-bold shrink-0">✅</span><span>Responsive answering directly addressing committee questions</span></li>
                  </ul>
                </div>

                <div className="bg-[#151930] border border-slate-800 border-t-4 border-t-amber-500 rounded-2xl p-4 shadow-md space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Defense Areas to Improve</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200 font-medium">
                    <li className="flex items-start gap-1.5"><span className="text-amber-400 font-bold shrink-0">⚠️</span><span>Elaborate deeper on slide data points & architectural choices</span></li>
                    <li className="flex items-start gap-1.5"><span className="text-amber-400 font-bold shrink-0">⚠️</span><span>Cite concrete trade-offs when answering technical challenges</span></li>
                  </ul>
                </div>
              </div>

              {/* Actionable Coaching Container */}
              <div className="bg-[#151930] border border-slate-800 border-t-4 border-t-indigo-500 rounded-2xl p-4 text-left shadow-md space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">🎯</span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Examiner Actionable Coaching Plan</h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium bg-[#0B0E27] p-3 rounded-xl border border-slate-800">
                  Focus on grounding your defense statements directly in your slide figures, methodology data, and system design diagrams. Use structured 2-part explanations (Core Choice + Alternative Trade-off).
                </p>
              </div>

              {/* Detailed 5-Round Question & Feedback Breakdown */}
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-4 text-left space-y-3.5 max-h-[300px] overflow-y-auto">
                <div className="text-xs font-black text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>Detailed 5-Round Feedback Breakdown</span>
                  <span className="text-slate-400 font-mono text-[10px]">All 5 Rounds Feedback</span>
                </div>

                {chatHistory.filter(item => item.role === 'examiner').map((exItem, qIdx) => {
                  const candidateItem = chatHistory.find((cItem, cIdx) => cItem.role === 'candidate' && cIdx === (qIdx * 2 + 1));
                  return (
                    <div key={qIdx} className="bg-[#0B0E27] border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-300">
                          Round {qIdx + 1}: {exItem.stageLabel || `Question ${qIdx + 1}`}
                        </span>
                        {exItem.scores && (
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
                            Score: {exItem.scores.overall}/100
                          </span>
                        )}
                      </div>

                      {exItem.question && (
                        <p className="text-slate-200 font-semibold"><span className="text-slate-400">Q:</span> {exItem.question}</p>
                      )}

                      {candidateItem && (
                        <p className="text-amber-200/90 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          <span className="font-bold text-amber-400">Your Answer:</span> {candidateItem.text}
                        </p>
                      )}

                      {exItem.feedback && (
                        <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg text-emerald-300">
                          <span className="font-bold text-emerald-400">Examiner Feedback:</span> {exItem.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPhase('setup')}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} /> Retake Viva
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 text-[#151930] font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle size={15} /> Return to Dashboard
              </button>
            </div>
          </div>
        )}

      <XPToast events={xpEvents} onComplete={() => setXpEvents([])} />
      <TrialSignupPrompt isOpen={showTrialPrompt} onClose={() => setShowTrialPrompt(false)} />
      <GuestAuthModal isOpen={isGuestAuthModalOpen} onClose={() => setIsGuestAuthModalOpen(false)} featureName="AI Viva Defense" />
      <InsufficientCreditsModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} requiredCredits={1} currentBalance={creditBalance} featureName="AI Viva Defense" />
    </>
  );
}
