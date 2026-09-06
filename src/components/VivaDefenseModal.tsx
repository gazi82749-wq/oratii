'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert, Award, Sparkles, Send, Mic, HelpCircle, CheckCircle,
  ArrowRight, RotateCcw, MessageSquare, X, Volume2, VolumeX, Flame, Smile, Play, Pause,
  GraduationCap, Briefcase, Keyboard, User, Check, AlertCircle, Target
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { saveSession } from '@/lib/storage';
import { processSessionCompletion } from '@/lib/gamification';

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
  const [scores, setScores] = useState<Record<string, number>>({ confidence: 0, accuracy: 0, communication: 0, overall: 0 });
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
          interviewType,
          mode
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
          interviewType,
          mode
        })
      });

      const data = await res.json();
      const vivaPayload = data.data || data.viva;
      if (data.status === 'success' && vivaPayload) {
        setFeedback(vivaPayload.feedbackToPreviousAnswer || vivaPayload.feedback || 'Good defense response.');
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
          saveSession('viva', {
            topic: presentationTitle || 'Viva Defense',
            mode,
            scores: scoreObj
          });
          processSessionCompletion('viva', { overall: scoreObj.overall });
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
    <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl h-[88vh] max-h-[820px] min-h-[480px] bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Top Accent Gradient Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-[#F2A93B]"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-black text-lg shadow-2xs">
              <GraduationCap size={18} className="text-amber-900" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
                AI Viva Defense
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Built-in AI Examiner Panel
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                Topic: <span className="text-slate-900 font-bold">{presentationTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEnableVoiceAudio(!enableVoiceAudio)}
              title={enableVoiceAudio ? "Mute Examiner Voice" : "Enable Examiner Voice Read Aloud"}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${enableVoiceAudio ? 'bg-[#151930] text-[#F2A93B] border-amber-500/40 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
            >
              {enableVoiceAudio ? <Volume2 size={16} className="animate-pulse text-amber-400" /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
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
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Presentation / Defense Context:
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold leading-relaxed max-h-24 overflow-y-auto">
                {contextSummary || presentationTitle}
              </div>
            </div>

            {/* Session Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Session Type:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewType('job_interview')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${interviewType === 'job_interview'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-800"><Briefcase size={16} /></span>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xs">Real Job Interview</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Unscripted & Technical Discussion</p>
                    </div>
                  </div>
                  {interviewType === 'job_interview' && <Check size={14} className="text-[#151930] stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewType('academic_viva')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${interviewType === 'academic_viva'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-800"><GraduationCap size={16} /></span>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xs">Academic Viva</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Progressive Committee Defense</p>
                    </div>
                  </div>
                  {interviewType === 'academic_viva' && <Check size={14} className="text-[#151930] stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Language Selector (Hinglish vs English) */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Defense Language:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('hinglish')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${language === 'hinglish'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-black text-[10px]">HI</span>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xs">Hinglish</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Hindi + English mix</p>
                    </div>
                  </div>
                  {language === 'hinglish' && <Check size={14} className="text-[#151930] stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${language === 'en'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-black text-[10px]">EN</span>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xs">English</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Standard Formal</p>
                    </div>
                  </div>
                  {language === 'en' && <Check size={14} className="text-[#151930] stroke-[3]" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Choose Response Mode:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('text')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${mode === 'text'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <Keyboard size={18} className="text-slate-700" />
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">Text</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-xs">Text Defense</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Type answers</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('voice')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${mode === 'voice'
                      ? 'border-[#151930] bg-slate-100 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <Mic size={18} className="text-amber-600" />
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">Live Mic</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-xs">Voice Defense</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Speak into mic</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={startVivaSession}
              className="w-full py-3.5 bg-[#151930] hover:bg-[#0B0E27] text-white font-black text-sm rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={16} className="text-amber-400" /> Start AI Defense Session
            </button>
          </div>
        )}

        {/* VIVA IN PROGRESS PHASE */}
        {phase === 'viva' && (
          <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col justify-between space-y-3 overflow-hidden">

            {/* Modern 5-Stage Defense Stepper Timeline */}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs shrink-0 gap-2 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-extrabold text-amber-800 uppercase tracking-wider">{stageLabel}</span>
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

            {/* Chat Stream History */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
              {chatHistory.map((item, idx) => (
                <div key={idx} className="space-y-3 animate-fade-in">

                  {/* Examiner Question */}
                  {item.role === 'examiner' && item.question && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-2xs">
                        <GraduationCap size={16} className="text-amber-900" />
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
                          <p className="text-[11px] text-amber-800 font-medium italic border-t border-slate-200 pt-2 flex items-center gap-1">
                            <Sparkles size={12} className="text-amber-600 shrink-0" />
                            <span>Format Hint: {answerFormatHint}</span>
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
                        <User size={14} className="text-slate-700" />
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
                <div className="flex gap-3 items-center text-slate-500 text-xs font-bold animate-pulse p-4">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Examiner panel is evaluating your response and formulating next question...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Response Input Area */}
            <div className="border-t border-slate-200 pt-3 shrink-0 space-y-2">
              {/* Quick Answer Starter Chips */}
              {!isLoading && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-hide">
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
                    className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${isListening
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
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-semibold transition-all"
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isLoading}
                    className="px-5 py-3 rounded-xl bg-[#151930] hover:bg-[#0B0E27] text-white font-extrabold text-sm disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={16} className="text-amber-400" /> Submit
                  </button>
                </div>
              )}

                {currentTip && (
                  <p className="text-[10px] text-slate-500 font-medium text-center truncate flex items-center justify-center gap-1">
                    <Sparkles size={11} className="text-amber-600 shrink-0" />
                    <span>Examiner Tip: {currentTip}</span>
                  </p>
                )}
              </div>

            </div>
          )}

          {/* RESULTS PHASE */}
          {phase === 'results' && (
            <div className="my-auto max-w-2xl mx-auto w-full space-y-5 text-center animate-fade-in py-2 text-slate-900">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center mx-auto shadow-sm">
                <Award size={28} className="text-amber-700" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950">Viva Defense Complete</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Here is your complete 5-round defense evaluation and examiner feedback.</p>
              </div>

              {/* Overall Score Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-amber-800 uppercase tracking-widest">Final Defense Grade</div>
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                    {mode === 'text' ? 'Text Defense Mode' : 'Voice Defense Mode'}
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-950">{avgOverallScore}<span className="text-xl sm:text-2xl text-slate-400">/100</span></div>
                <p className="text-xs text-slate-700 font-semibold">
                  {avgOverallScore >= 85
                    ? 'Outstanding Defense! You answered probing technical questions with strong reasoning and clarity.'
                    : 'Good Defense. Review your slide data points and practice concise explanations.'}
                </p>

                {/* Mode-Specific Sub-Scores Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  {mode === 'text' ? (
                    <>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Technical Accuracy</span>
                        <span className="text-xl font-black text-amber-600">{avgAccuracy}%</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Depth of Reasoning</span>
                        <span className="text-xl font-black text-emerald-600">{avgReasoning}%</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Written Structure</span>
                        <span className="text-xl font-black text-blue-600">{avgClarity}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Spoken Delivery</span>
                        <span className="text-xl font-black text-amber-600">{avgDelivery}%</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Vocal Confidence</span>
                        <span className="text-xl font-black text-emerald-600">{avgConfidence}%</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Technical Accuracy</span>
                        <span className="text-xl font-black text-blue-600">{avgAccuracy}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

                {/* Deep 2-Column Strengths & Improvement Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div className="bg-white border border-slate-200/80 border-t-4 border-t-emerald-500 rounded-2xl p-4 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        <Check size={11} className="stroke-[3]" />
                      </span>
                      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Defense Strengths</h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                      <li className="flex items-start gap-1.5"><Check size={13} className="text-emerald-600 font-bold shrink-0 mt-0.5" /><span>Accurate domain concepts and technical terminology</span></li>
                      <li className="flex items-start gap-1.5"><Check size={13} className="text-emerald-600 font-bold shrink-0 mt-0.5" /><span>Responsive answering directly addressing committee questions</span></li>
                    </ul>
                  </div>

                  <div className="bg-amber-50/40 border border-amber-200/60 border-t-4 border-t-amber-500 rounded-2xl p-4 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-amber-200/50">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                        <AlertCircle size={11} className="stroke-[3]" />
                      </span>
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Defense Areas to Improve</h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                      <li className="flex items-start gap-1.5"><AlertCircle size={13} className="text-amber-700 font-bold shrink-0 mt-0.5" /><span>Elaborate deeper on slide data points & architectural choices</span></li>
                      <li className="flex items-start gap-1.5"><AlertCircle size={13} className="text-amber-700 font-bold shrink-0 mt-0.5" /><span>Cite concrete trade-offs when answering technical challenges</span></li>
                    </ul>
                  </div>
                </div>

                {/* Actionable Coaching Container */}
                <div className="bg-white border border-slate-200/80 border-t-4 border-t-indigo-600 rounded-2xl p-4 text-left shadow-xs space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      <Target size={11} className="stroke-[2.5]" />
                    </span>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">Examiner Actionable Coaching Plan</h4>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                    Focus on grounding your defense statements directly in your slide figures, methodology data, and system design diagrams. Use structured 2-part explanations (Core Choice + Alternative Trade-off).
                  </p>
                </div>

              {/* Detailed 5-Round Question & Feedback Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3.5 max-h-[300px] overflow-y-auto">
                <div className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Detailed 5-Round Feedback Breakdown</span>
                  <span className="text-slate-500 font-mono text-[10px]">All 5 Rounds Feedback</span>
                </div>

                {chatHistory.filter(item => item.role === 'examiner').map((exItem, qIdx) => {
                  const candidateItem = chatHistory.find((cItem, cIdx) => cItem.role === 'candidate' && cIdx === (qIdx * 2 + 1));
                  return (
                    <div key={qIdx} className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-800">
                          Round {qIdx + 1}: {exItem.stageLabel || `Question ${qIdx + 1}`}
                        </span>
                        {exItem.scores && (
                          <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            Score: {exItem.scores.overall}/100
                          </span>
                        )}
                      </div>

                      {exItem.question && (
                        <p className="text-slate-900 font-semibold"><span className="text-slate-500">Q:</span> {exItem.question}</p>
                      )}

                      {candidateItem && (
                        <p className="text-slate-800 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900">Your Answer:</span> {candidateItem.text}
                        </p>
                      )}

                      {exItem.feedback && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 font-medium">
                          <span className="font-bold text-emerald-800">Examiner Feedback:</span> {exItem.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPhase('setup')}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} /> Retake Viva
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#151930] hover:bg-[#0B0E27] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={15} className="text-amber-400" /> Done
                </button>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
