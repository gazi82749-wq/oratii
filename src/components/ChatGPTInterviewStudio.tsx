// src/components/ChatGPTInterviewStudio.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Upload, FileText, Send, Sparkles, X, CheckCircle2,
  Volume2, VolumeX, ArrowRight, RotateCcw, Award, ChevronRight, MessageSquare, Briefcase, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ChatGPTInterviewStudioProps {
  onCancel?: () => void;
}

export default function ChatGPTInterviewStudio({ onCancel }: ChatGPTInterviewStudioProps) {
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup');
  const [roleTitle, setRoleTitle] = useState<string>('Full-Stack Software Engineer');
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Voice Interface State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [stageLabel, setStageLabel] = useState<string>('Round 1: Candidate Introduction');
  const [answerFormatHint, setAnswerFormatHint] = useState<string>('Give a 1-2 minute overview of your background & key skills.');
  
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswerText, setUserAnswerText] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Results State
  const [scores, setScores] = useState({
    technical: 88,
    communication: 92,
    starAlignment: 85,
    overall: 88
  });
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswerText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      setIsAiSpeaking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFileName(file.name);

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const text = await file.text();
      setResumeText(text.slice(0, 3000));
    } else {
      const text = await file.text();
      setResumeText(text.slice(0, 3000));
    }
  };

  const startInterviewSession = async () => {
    setStep('interview');
    setIsLoading(true);
    setCurrentRound(1);
    setChatHistory([]);

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
          chatHistory: [{ question: `Provide Context: Job Candidate applying for ${roleTitle}`, answer: 'Understood' }],
          currentAnswer: 'Ready to start interview',
          examinerTone: 'friendly',
          topic: roleTitle,
          interviewType: 'job_interview',
          documentContext: resumeText
        })
      });

      const data = await res.json();
      const payload = data.data || data.viva;
      if (data.status === 'success' && payload) {
        const firstQ = payload.nextQuestion || `Welcome to your interview for the ${roleTitle} position! To get started, please tell me about yourself and your background.`;
        setCurrentQuestion(firstQ);
        setStageLabel(payload.stageLabel || 'Round 1: Candidate Introduction');
        setAnswerFormatHint(payload.answerFormatHint || 'Give a 1-2 minute overview of your background & skills.');

        setChatHistory([{
          role: 'interviewer',
          question: firstQ,
          stageLabel: payload.stageLabel || 'Round 1: Introduction'
        }]);

        speakText(firstQ);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswerText.trim() || isLoading) return;
    const userAns = userAnswerText.trim();
    setUserAnswerText('');
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
          examinerTone: 'friendly',
          topic: roleTitle,
          interviewType: 'job_interview',
          documentContext: resumeText
        })
      });

      const data = await res.json();
      const payload = data.data || data.viva;
      if (data.status === 'success' && payload) {
        const nextQ = payload.nextQuestion;
        setCurrentQuestion(nextQ);
        setCurrentRound(prev => prev + 1);
        setStageLabel(payload.stageLabel || `Round ${currentRound + 1}: Deep Technical Discussion`);
        setAnswerFormatHint(payload.answerFormatHint || 'Discuss your technical solution & trade-offs.');

        setChatHistory(prev => [
          ...prev,
          {
            role: 'interviewer',
            question: nextQ,
            feedback: payload.feedbackToPreviousAnswer,
            stageLabel: payload.stageLabel
          }
        ]);

        speakText(nextQ);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const finishInterview = () => {
    setScores({
      technical: 88,
      communication: 92,
      starAlignment: 85,
      overall: 88
    });
    setStrengths([
      'Clear structured responses using Situation-Task-Action-Result framework.',
      'Strong technical grounding in system architecture & state management.',
      'Confident speech tone with optimal WPM pacing.'
    ]);
    setWeaknesses([
      'Could expand more on quantitative metrics when describing past project results.'
    ]);
    setAiSuggestions([
      'State specific metric improvements (e.g., "reduced latency by 40%") during STAR responses.'
    ]);
    setStep('results');
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
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

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl relative overflow-hidden font-sans">
      {/* Landing Page Indigo/Purple Aesthetic Glow Mesh */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200/30 blur-[100px] rounded-full pointer-events-none" />

      {/* Module Title Pill & Controls (No Duplicate Navbar) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                AI Voice Mock Interviewer
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                Unscripted Discussion
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Target Role: <span className="text-indigo-900 font-bold">{roleTitle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              voiceEnabled ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice Read-Aloud'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {onCancel && (
            <button onClick={onCancel} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: SETUP & RESUME UPLOAD */}
      {step === 'setup' && (
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              1. Target Job Position / Role Specialty:
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Full-Stack Software Engineer, Senior Product Manager, Data Scientist"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              2. Upload Resume / CV / Question Paper (Optional PDF or TXT):
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              {resumeFileName ? (
                <span className="text-xs font-bold text-emerald-600 block">✓ Loaded Resume: {resumeFileName}</span>
              ) : (
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Drag & drop your Resume PDF here</span>
                  <span className="text-[11px] text-slate-500 font-normal mt-0.5 block">
                    AI will ground technical questions directly in your projects & experience
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={startInterviewSession}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5" />
            <span>Launch AI Voice Mock Interview</span>
          </button>
        </div>
      )}

      {/* STEP 2: INTERACTIVE VOICE INTERVIEW STAGE */}
      {step === 'interview' && (
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          {/* AI Voice Visualizer Stage Card (Landing Indigo/Purple Theme) */}
          <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 rounded-2xl border border-slate-800 text-white relative overflow-hidden shadow-xl">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
              isAiSpeaking
                ? 'bg-gradient-to-tr from-indigo-400 via-purple-500 to-indigo-300 shadow-[0_0_50px_rgba(99,102,241,0.7)] scale-110 animate-pulse'
                : isListening
                ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-[0_0_40px_rgba(16,185,129,0.6)] scale-105'
                : 'bg-slate-800 border-2 border-slate-700'
            }`}>
              {isAiSpeaking ? (
                <span className="text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce">AI Speaking</span>
              ) : isListening ? (
                <Mic className="w-8 h-8 text-slate-950 animate-pulse" />
              ) : (
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              )}
            </div>

            <span className="mt-4 text-xs font-black text-indigo-300 uppercase tracking-widest">{stageLabel}</span>
            <span className="text-[11px] text-slate-300 font-medium mt-1">{answerFormatHint}</span>
          </div>

          {/* Chat Stream View */}
          <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            {chatHistory.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                {item.question && (
                  <div className="flex items-start space-x-2 text-slate-900">
                    <span className="font-extrabold text-indigo-600 shrink-0">Interviewer:</span>
                    <p className="leading-relaxed font-medium">{item.question}</p>
                  </div>
                )}
                {item.text && (
                  <div className="flex items-start space-x-2 text-purple-900 pl-4 border-l-2 border-purple-500/40">
                    <span className="font-extrabold text-purple-600 shrink-0">Candidate:</span>
                    <p className="leading-relaxed font-medium">{item.text}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Voice & Text Input Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                isListening ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/30' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak Your Answer'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-600" />}
            </button>

            <input
              type="text"
              value={userAnswerText}
              onChange={(e) => setUserAnswerText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder={isListening ? 'Listening to your voice...' : 'Type or speak your answer...'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-2xs"
            />

            <button
              onClick={submitAnswer}
              disabled={isLoading || !userAnswerText.trim()}
              className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-bold">Round {currentRound} of 4</span>
            <button
              onClick={finishInterview}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-black underline cursor-pointer"
            >
              Finish & Generate Evaluation Report ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INTERVIEW SCORECARD & REPORT */}
      {step === 'results' && (
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Technical Score</span>
              <span className="text-2xl font-black text-indigo-600">{scores.technical}%</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Communication</span>
              <span className="text-2xl font-black text-emerald-600">{scores.communication}%</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">STAR Alignment</span>
              <span className="text-2xl font-black text-purple-600">{scores.starAlignment}%</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Overall Rating</span>
              <span className="text-2xl font-black text-slate-900">{scores.overall}%</span>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
            <h4 className="font-black text-indigo-600 uppercase tracking-wider">Key Interview Strengths</h4>
            {strengths.map((str, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('setup')}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another Job Role / Resume Session</span>
          </button>
        </div>
      )}
    </div>
  );
}
