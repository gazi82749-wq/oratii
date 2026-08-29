'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert, Award, Sparkles, Send, Mic, HelpCircle, CheckCircle,
  ArrowRight, RotateCcw, MessageSquare, X, Volume2, VolumeX, Flame, Smile, Play, Pause
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface VivaDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextSummary?: string;
  presentationTitle?: string;
  slideAnalysisData?: any;
}

export default function VivaDefenseModal({
  isOpen,
  onClose,
  contextSummary = '',
  presentationTitle = 'Presentation & Slide Defense',
  slideAnalysisData = null
}: VivaDefenseModalProps) {
  const [phase, setPhase] = useState<'setup' | 'viva' | 'results'>('setup');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [examinerTone, setExaminerTone] = useState<'friendly' | 'hostile'>('friendly');
  const [enableVoiceAudio, setEnableVoiceAudio] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'hinglish'>('hinglish');
  const [interviewType, setInterviewType] = useState<'job_interview' | 'academic_viva'>('job_interview');

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [scores, setScores] = useState({ confidence: 0, accuracy: 0, communication: 0, overall: 0 });
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [allScores, setAllScores] = useState<any[]>([]);

  // Progressive Viva Stage Tracking
  const [stageLabel, setStageLabel] = useState<string>('Level 1: Basic Warmup');
  const [answerFormatHint, setAnswerFormatHint] = useState<string>('Answer in 1 word or 1 single sentence.');
  const [currentTip, setCurrentTip] = useState<string>('');

  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

  // Auto-scroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, feedback, isLoading]);

  // Speech Synthesis helper
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
    setPhase('viva');
    setIsLoading(true);
    setChatHistory([]);
    setQuestionsAnswered(0);
    setAllScores([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const initialContextPrompt = contextSummary
        ? `Provide Context: Here is the presentation deck summary to ground your viva defense questions: ${contextSummary}`
        : `Provide Context: General viva defense for topic: ${presentationTitle}`;

      const res = await fetch('/api/viva', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chatHistory: [{ question: initialContextPrompt, answer: 'Understood' }],
          currentAnswer: 'Ready to defend presentation',
          examinerTone,
          topic: presentationTitle,
          slideAnalysisData,
          language,
          interviewType
        })
      });

      const data = await res.json();
      const vivaPayload = data.data || data.viva;
      if (data.status === 'success' && vivaPayload) {
        const nextQ = vivaPayload.nextQuestion || `Welcome! To get started, tell me about yourself and your background.`;
        setCurrentQuestion(nextQ);
        setStageLabel(vivaPayload.stageLabel || 'Round 1: Introduction');
        setAnswerFormatHint(vivaPayload.answerFormatHint || 'Give a 1 to 2 minute overview of your background.');
        if (vivaPayload.tip) setCurrentTip(vivaPayload.tip);

        setChatHistory([{
          role: 'examiner',
          question: nextQ,
          stageLabel: vivaPayload.stageLabel || 'Round 1: Candidate Introduction'
        }]);

        speakText(nextQ);
      } else {
        alert(data.message || 'Could not initialize session.');
        setPhase('setup');
      }
    } catch (err: any) {
      console.error('Failed to start viva session:', err);
      alert('Failed to connect to AI service.');
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
          topic: presentationTitle,
          slideAnalysisData,
          language,
          interviewType
        })
      });

      const data = await res.json();
      const vivaPayload = data.data || data.viva;
      if (data.status === 'success' && vivaPayload) {
        setFeedback(vivaPayload.feedbackToPreviousAnswer || vivaPayload.feedback || 'Good defense response.');
        const scoreObj = {
          confidence: vivaPayload.scores?.confidence || 80,
          accuracy: vivaPayload.scores?.accuracy || 82,
          communication: vivaPayload.scores?.communication || 85,
          overall: vivaPayload.scores?.overall || 82
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
            feedback: vivaPayload.feedbackToPreviousAnswer || vivaPayload.feedback,
            scores: scoreObj,
            question: nextQ,
            stageLabel: vivaPayload.stageLabel
          }
        ];
        setChatHistory(newHistoryWithExaminer);

        if (nextCount >= 5) {
          // Final Viva Evaluation reached
          setPhase('results');
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

  if (!isOpen) return null;

  const avgOverallScore = allScores.length
    ? Math.round(allScores.reduce((acc, curr) => acc + curr.overall, 0) / allScores.length)
    : scores.overall || 85;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl h-[88vh] max-h-[820px] min-h-[480px] bg-[#0B0E27] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#151930] border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[#F2A93B] flex items-center justify-center font-black text-lg shadow-sm">
              🎓
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                AI Viva Defense
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Built-in AI Examiner Panel
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                Topic: <span className="text-slate-200 font-bold">{presentationTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEnableVoiceAudio(!enableVoiceAudio)}
              title={enableVoiceAudio ? "Mute Examiner Voice" : "Enable Examiner Voice Read Aloud"}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${enableVoiceAudio ? 'bg-amber-500/20 text-[#F2A93B] border-amber-500/40 shadow-sm' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
            >
              {enableVoiceAudio ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Close Viva Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* SETUP PHASE */}
        {phase === 'setup' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center max-w-xl mx-auto w-full space-y-6 animate-fade-in text-left">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                Presentation / Defense Context:
              </label>
              <div className="bg-[#151930] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-medium leading-relaxed max-h-24 overflow-y-auto">
                {contextSummary || presentationTitle}
              </div>
            </div>

            {/* Session Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                Session Type:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewType('job_interview')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${interviewType === 'job_interview'
                      ? 'border-[#F2A93B] bg-amber-500/10 ring-2 ring-[#F2A93B]/30'
                      : 'border-slate-800 bg-[#151930] hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💼</span>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">Real Job Interview</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Unscripted & Technical Discussion</p>
                    </div>
                  </div>
                  {interviewType === 'job_interview' && <span className="text-amber-400 font-black text-xs">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewType('academic_viva')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${interviewType === 'academic_viva'
                      ? 'border-[#F2A93B] bg-amber-500/10 ring-2 ring-[#F2A93B]/30'
                      : 'border-slate-800 bg-[#151930] hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎓</span>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">Academic Viva</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Progressive Committee Defense</p>
                    </div>
                  </div>
                  {interviewType === 'academic_viva' && <span className="text-amber-400 font-black text-xs">✓</span>}
                </button>
              </div>
            </div>

            {/* Language Selector (Hinglish vs English) */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                Defense Language:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('hinglish')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${language === 'hinglish'
                      ? 'border-[#F2A93B] bg-amber-500/10 ring-2 ring-[#F2A93B]/30'
                      : 'border-slate-800 bg-[#151930] hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇮🇳</span>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">Hinglish</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Hindi + English mix</p>
                    </div>
                  </div>
                  {language === 'hinglish' && <span className="text-amber-400 font-black text-xs">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${language === 'en'
                      ? 'border-[#F2A93B] bg-amber-500/10 ring-2 ring-[#F2A93B]/30'
                      : 'border-slate-800 bg-[#151930] hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇬🇧</span>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">English</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Standard Formal</p>
                    </div>
                  </div>
                  {language === 'en' && <span className="text-amber-400 font-black text-xs">✓</span>}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                Choose Response Mode:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('text')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${mode === 'text'
                      ? 'border-[#F2A93B] bg-amber-500/10 ring-2 ring-[#F2A93B]/30'
                      : 'border-slate-800 bg-[#151930] hover:border-slate-700'
                    }`}
                >
                  <span className="text-lg">⌨️</span>
                  <h4 className="font-extrabold text-white text-xs">Text Mode</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Type responses</p>
                </button>

                <button
                  onClick={() => setMode('voice')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${mode === 'voice'
                      ? 'border-[#F2A93B] bg-amber-500/10 ring-2 ring-[#F2A93B]/30'
                      : 'border-slate-800 bg-[#151930] hover:border-slate-700'
                    }`}
                >
                  <span className="text-lg">🎙️</span>
                  <h4 className="font-extrabold text-white text-xs">Live Mic Mode</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Speak responses</p>
                </button>
              </div>
            </div>

            <button
              onClick={startVivaSession}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#F2A93B] to-amber-500 hover:from-amber-300 text-[#151930] font-black text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" /> Start AI Defense Session
            </button>
          </div>
        )}

        {/* VIVA IN PROGRESS PHASE */}
        {phase === 'viva' && (
          <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col justify-between space-y-3 overflow-hidden">

            {/* Modern 5-Stage Defense Stepper Timeline */}
            <div className="flex items-center justify-between bg-[#151930] px-4 py-2.5 rounded-xl border border-slate-800 text-xs shrink-0 gap-2 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span className="font-extrabold text-amber-400 uppercase tracking-wider">{stageLabel}</span>
              </div>

              {/* Stage Pills Timeline */}
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold">
                {[
                  { r: 1, label: '1. Warmup' },
                  { r: 2, label: '2. Core' },
                  { r: 3, label: '3. Cross-Exam' },
                  { r: 4, label: '4. Scenario' },
                  { r: 5, label: '5. Review' }
                ].map((s) => {
                  const currentRound = questionsAnswered + 1;
                  const isActive = s.r === currentRound;
                  const isDone = s.r < currentRound;
                  return (
                    <span 
                      key={s.r}
                      className={`px-2 py-0.5 rounded transition-all ${
                        isActive 
                          ? 'bg-[#F2A93B] text-[#151930] font-black shadow-sm' 
                          : isDone 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' 
                            : 'bg-slate-800/60 text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  );
                })}
              </div>

              <div className="font-mono text-slate-300 font-bold shrink-0">
                Round <span className="text-amber-400 font-black">{questionsAnswered + 1}</span> of 5
              </div>
            </div>

            {/* Chat Stream History */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
              {chatHistory.map((item, idx) => (
                <div key={idx} className="space-y-3 animate-fade-in">

                  {/* Examiner Question */}
                  {item.role === 'examiner' && item.question && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[#F2A93B] flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-sm">
                        🎓
                      </div>
                      <div className="flex-1 bg-[#151930] border border-slate-800 p-4 rounded-2xl space-y-2">
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>Examiner Panel Question</span>
                            {enableVoiceAudio && (
                              <div className="flex items-center gap-0.5">
                                <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full"></span>
                                <span className="w-1 h-4 bg-amber-300 animate-pulse delay-75 rounded-full"></span>
                                <span className="w-1 h-2 bg-amber-500 animate-pulse delay-150 rounded-full"></span>
                              </div>
                            )}
                          </div>
                          {item.stageLabel && <span className="text-slate-400 font-mono">{item.stageLabel}</span>}
                        </div>
                        <p className="text-sm sm:text-base font-bold text-white leading-relaxed">{item.question}</p>
                        {answerFormatHint && idx === chatHistory.length - 1 && (
                          <p className="text-[11px] text-amber-300/80 font-medium italic border-t border-slate-800/80 pt-2">
                            💡 Format Hint: {answerFormatHint}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Candidate Answer */}
                  {item.role === 'candidate' && (
                    <div className="flex gap-3 items-start justify-end">
                      <div className="bg-amber-500 text-[#151930] p-4 rounded-2xl max-w-xl shadow-md font-medium text-sm sm:text-base">
                        <div className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">Your Defense Answer</div>
                        <p className="leading-relaxed font-semibold">{item.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        👤
                      </div>
                    </div>
                  )}

                  {/* AI Feedback on previous answer */}
                  {item.role === 'examiner' && item.feedback && (
                    <div className="ml-11 bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">
                        <span>Panel Evaluation</span>
                        {item.scores && (
                          <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                            Score: {item.scores.overall}/100
                          </span>
                        )}
                      </div>
                      <p className="text-slate-200 font-medium leading-relaxed">{item.feedback}</p>
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

            {/* Bottom Response Input Area */}
            <div className="border-t border-slate-800 pt-3 shrink-0 space-y-2">
              {/* Quick Answer Starter Chips */}
              {!isLoading && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-hide">
                  <span className="text-slate-400 shrink-0">Answer Starters:</span>
                  {[
                    "From a practical perspective...",
                    "Looking at the core metrics...",
                    "The primary reason behind this choice..."
                  ].map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => setAnswer((prev) => (prev ? `${prev} ${chip}` : chip))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg shrink-0 transition-colors cursor-pointer"
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
                    className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${isListening
                        ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900'
                        : 'bg-gradient-to-r from-amber-400 to-[#F2A93B] text-[#151930] hover:from-amber-300'
                      }`}
                  >
                    <Mic size={18} />
                    <span>{isListening ? 'Listening... Speak Answer Now' : 'Click to Speak Answer (Mic)'}</span>
                  </button>
                  {answer && (
                    <button
                      onClick={submitAnswer}
                      disabled={isLoading}
                      className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
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
                    className="flex-1 bg-[#151930] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isLoading}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 text-[#151930] font-extrabold text-sm disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={16} /> Submit
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
            <div className="my-auto max-w-2xl mx-auto w-full space-y-5 text-center animate-fade-in py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-[#F2A93B] flex items-center justify-center text-3xl mx-auto shadow-xl">
                🏆
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">Viva Defense Complete</h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Here is your complete 5-round defense evaluation and examiner feedback.</p>
              </div>

              {/* Overall Score Card */}
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
                <div className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Final Defense Grade</div>
                <div className="text-4xl sm:text-5xl font-black text-white">{avgOverallScore}<span className="text-xl sm:text-2xl text-slate-400">/100</span></div>
                <p className="text-xs text-slate-300 font-semibold">
                  {avgOverallScore >= 85
                    ? '🎉 Outstanding Defense! You answered probing technical questions with strong reasoning and clarity.'
                    : '👍 Good Defense. Review your slide data points and practice concise explanations.'}
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

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPhase('setup')}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} /> Retake Viva
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 text-[#151930] font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={15} /> Done
                </button>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
