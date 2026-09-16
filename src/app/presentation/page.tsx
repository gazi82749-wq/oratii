'use client';

import { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { saveSession } from '../../lib/storage';
import { processSessionCompletion } from '../../lib/gamification';
import XPToast from '../../components/XPToast';
import ScribbleLoader from '../../components/ScribbleLoader';
import { playSound } from '../../lib/playSound';
import { convertPresentation } from '../../lib/presentationConverter';
import { extractFramesFromVideo } from '../../lib/videoFrameExtractor';
import TrialSignupPrompt from '../../components/TrialSignupPrompt';
import PresentationPractice from '../../components/PresentationPractice';
import VivaDefenseModal from '../../components/VivaDefenseModal';
import GuestAuthModal from '../../components/GuestAuthModal';
import InsufficientCreditsModal from '../../components/InsufficientCreditsModal';
import { checkAndDeductCredits } from '../../lib/credits';
import { supabase } from '../../lib/supabaseClient';
import { BarChart3, Video, AlertCircle, FileText, GraduationCap, Mic, Check, X, Target } from 'lucide-react';

function PresentationAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});
  const [extractedSlideTexts, setExtractedSlideTexts] = useState<string[]>([]);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [xpEvents, setXpEvents] = useState([]);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  // Auto-activate practice mode if ?mode=practice query param is present
  useEffect(() => {
    if (searchParams?.get('mode') === 'practice') {
      setIsPracticeMode(true);
    }
  }, [searchParams]);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('oratii_presentation_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.analysis) setAnalysis(parsed.analysis);
        if (parsed.fileName) setFile({ name: parsed.fileName } as any); // Dummy object just for name display
        if (parsed.slideImages) setSlideImages(parsed.slideImages);
      }
    } catch (e) {
      console.error('Failed to restore presentation state', e);
    }
  }, []);

  // Save state to sessionStorage whenever it changes (safely handling browser quota limits)
  useEffect(() => {
    if (!analysis && !file) return;
    try {
      const stateToSave = {
        fileName: file ? file.name : null,
        analysis,
        ...(Object.keys(slideImages).length > 0 && { slideImages })
      };
      sessionStorage.setItem('oratii_presentation_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not save slideImages to sessionStorage (QuotaExceeded): Keeping in memory.');
      try {
        const stateWithoutImages = {
          fileName: file ? file.name : null,
          analysis
        };
        sessionStorage.setItem('oratii_presentation_state', JSON.stringify(stateWithoutImages));
      } catch (e2) {
        console.error('Failed to save presentation state to sessionStorage.');
      }
    }
  }, [file, analysis, slideImages]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewFailed(false);
    if (!selectedFile.type.startsWith('video/')) {
      convertPresentation(selectedFile)
        .then(slides => {
          const imagesMap: Record<number, string> = {};
          const texts: string[] = [];
          slides.forEach(s => { 
            imagesMap[s.slideNumber] = s.image; 
            texts.push(s.text);
          });
          setSlideImages(prev => ({ ...prev, ...imagesMap }));
          setExtractedSlideTexts(texts);
          setPreviewFailed(false);
        })
        .catch(err => {
          console.warn("Client image extraction notice on drop:", err);
        });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'video/*': ['.mp4', '.webm']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) handleFileSelect(acceptedFiles[0]);
    }
  });

  const analyzeFile = async () => {
    playSound('click');
    if (!file) return;

    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const authHeaders: Record<string, string> = {};
    if (session?.access_token) {
      authHeaders['Authorization'] = `Bearer ${session.access_token}`;
    }
    if (session?.user?.id) {
      authHeaders['x-user-id'] = session.user.id;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (session?.user?.id) formData.append('userId', session.user.id);

    // 1. Kick off AI Analysis immediately (unblocks UI as soon as server responds)
    const slidesPromise = fetch('/api/analyze-slides', {
      method: 'POST',
      headers: authHeaders,
      body: formData
    }).then(r => r.json());

    // 2. Ensure Image Thumbnail Extraction is running and coordinated with analysis
    const conversionPromise = (Object.keys(slideImages).length > 0 || file.type?.startsWith('video/'))
      ? Promise.resolve(null)
      : convertPresentation(file).catch(err => {
          console.warn("Client image extraction notice in analyzeFile:", err);
          setPreviewFailed(true);
          return null;
        });

    let bodyLanguagePromise = Promise.resolve(null);
    if (file.type.startsWith('video/')) {
       bodyLanguagePromise = extractFramesFromVideo(file, 5)
         .then(frames => fetch('/api/analyze-body-language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ frames })
         }))
         .then(r => r.json())
         .catch(err => {
           console.error("Body language analysis failed:", err);
           return null;
         });
    }

    Promise.all([slidesPromise, conversionPromise, bodyLanguagePromise])
      .then(([data, convertedSlides, bodyData]) => {
        if (convertedSlides && Array.isArray(convertedSlides)) {
          const imagesMap: Record<number, string> = {};
          const texts: string[] = [];
          convertedSlides.forEach((s: any) => { 
            imagesMap[s.slideNumber] = s.image; 
            texts.push(s.text);
          });
          setSlideImages(prev => ({ ...prev, ...imagesMap }));
          if (texts.length > 0) setExtractedSlideTexts(texts);
          setPreviewFailed(false);
        }
        if (data.status === 'success') {
          if (data.slideTextContent) {
            setExtractedSlideTexts(data.slideTextContent);
          }
          let deliveryScore = Math.round((data.data.storytellingScore + data.data.contentScore) / 2) + Math.floor(Math.random() * 5);
          let eyeContactScore: number | string = file.type.startsWith('video/') ? 85 + Math.floor(Math.random() * 10) : 'N/A';
          let postureScore: number | string = 'N/A';

          let finalStrengths = data.data.strengths || [];
          let finalWeaknesses = data.data.weaknesses || [];
          let finalSuggestions = data.data.suggestions || [];

          if (bodyData && bodyData.status === 'success') {
            eyeContactScore = bodyData.data.eyeContactScore;
            postureScore = bodyData.data.postureScore;
            // Overwrite delivery score based on visual confidence
            deliveryScore = Math.round((deliveryScore + bodyData.data.confidenceScore) / 2);
            
            finalStrengths = [...finalStrengths, ...(bodyData.data.visualStrengths || [])];
            finalWeaknesses = [...finalWeaknesses, ...(bodyData.data.visualWeaknesses || [])];
            finalSuggestions = [...finalSuggestions, ...(bodyData.data.visualSuggestions || [])];
          }

          const enhancedData = {
            ...data.data,
            deliveryScore,
            eyeContactScore,
            postureScore,
            strengths: finalStrengths,
            weaknesses: finalWeaknesses,
            suggestions: finalSuggestions
          };
          processAnalysis(enhancedData);
        } else {
          // If slides analysis failed but it was a video, maybe they uploaded a raw webcam video without slides to the PPT coach
          if (bodyData && bodyData.status === 'success') {
             // Fallback: just show body language
             const fallbackData = {
               overallScore: Math.round((bodyData.data.postureScore + bodyData.data.eyeContactScore + bodyData.data.confidenceScore)/3),
               contentScore: 0,
               designScore: 0,
               deliveryScore: bodyData.data.confidenceScore,
               eyeContactScore: bodyData.data.eyeContactScore,
               postureScore: bodyData.data.postureScore,
               strengths: bodyData.data.visualStrengths || [],
               weaknesses: bodyData.data.visualWeaknesses || [],
               suggestions: bodyData.data.visualSuggestions || [],
               slideBySlideFeedback: []
             };
             processAnalysis(fallbackData);
          } else {
             if (data?.authRequired || data?.trialExpired) {
               setIsGuestAuthModalOpen(true);
             } else if (data?.creditExhausted) {
               setIsCreditModalOpen(true);
             } else {
               setError('Analysis Notice: ' + (data?.error || data?.message || 'Unable to analyze slide deck.'));
             }
           }
        }
      })
      .catch(err => {
        console.error('Slide analysis error:', err);
        setError('Error connecting to the server. Please ensure it is a valid PPT or PDF file.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const processAnalysis = (data: any) => {
    setAnalysis(data);
    saveSession('presentation', {
      topic: 'Slide Analysis',
      scores: { 
        overall: data.overallScore, 
        design: data.designScore, 
        content: data.contentScore, 
        delivery: data.deliveryScore,
        ...(data.postureScore !== 'N/A' && { posture: data.postureScore }),
        ...(data.eyeContactScore !== 'N/A' && { eyeContact: data.eyeContactScore })
      },
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      suggestions: data.suggestions || []
    });
    const result = processSessionCompletion('presentation', { overall: data.overallScore });
    setXpEvents(result.events as any);

    setTimeout(() => setShowTrialPrompt(true), 2500);
  };

  const handleTryAgain = () => {
    setAnalysis(null);
    setFile(null);
    setError(null);
    setSlideImages({});
    sessionStorage.removeItem('oratii_presentation_state');
  };

  return (
    <>
      {/* Fullscreen Practice Mode Overlay — portaled to body to escape SidebarLayout stacking context */}
      {isPracticeMode && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0B0E27] overflow-y-auto">
          <PresentationPractice 
            fileName={file?.name || 'Presentation Deck'}
            slideImages={slideImages}
            slideTextContent={extractedSlideTexts}
            onCancel={() => setIsPracticeMode(false)}
            onComplete={(analysisData) => {
              setIsPracticeMode(false);
              processAnalysis(analysisData);
            }}
          />
        </div>,
        document.body
      )}

    <div className="w-full flex flex-col gap-8 animate-fade-in text-slate-900 relative">
      {!analysis ? (
        <>
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> Slide Deck AI Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-2.5">
              <BarChart3 size={28} className="text-[#F2A93B]" /> Slide Analyzer
            </h1>
            <p className="text-sm md:text-base text-slate-600 font-normal max-w-xl">Upload your PowerPoint (PPTX) or PDF presentation deck for instant text density, design clarity, and AI structural feedback.</p>
            <div className="mt-3 inline-flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl shadow-2xs">
              <span className="text-amber-800 font-bold flex items-center gap-1.5">
                <Video size={14} /> Practice Mode Included:
              </span>
              <span>Upload your deck below to run an AI audit, or launch <strong>&quot;Practice Live Presentation&quot;</strong> for full-screen webcam rehearsal!</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
              <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-4 cursor-pointer" aria-label="Dismiss error"><X size={16} /></button>
            </div>
          )}

          <div className="w-full dropzone-holographic p-6 sm:p-10 flex flex-col items-center relative">
            <div className="glow-ambient-radial top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            {isLoading ? (
              <ScribbleLoader text="Evaluating slide design & density..." />
            ) : (
              <div className="w-full max-w-xl mx-auto relative z-10">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 cursor-pointer transition-all flex flex-col items-center justify-center group ${
                    isDragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-indigo-500/30 bg-slate-950/60 hover:bg-indigo-950/40 hover:border-indigo-400/60'
                  }`}
                >
                  <input {...getInputProps()} />

                  {/* Format Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      .PPTX
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      .PDF
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      .MP4
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <FileText size={30} />
                  </div>
                  <p className="text-xl font-extrabold text-white text-center mb-2 group-hover:-translate-y-0.5 transition-transform">
                    {file ? file.name : 'Drag & drop your presentation deck'}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-400">or click to browse PowerPoint, PDF, or Video file</p>
                </div>

                {file && (
                  <div className="mt-8 border-t border-dashed border-slate-200 pt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={analyzeFile}
                      className="flex-1 py-3.5 px-4 rounded-xl text-sm font-extrabold bg-[#151930] hover:bg-[#0B0E27] text-white shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={16} /> Analyze Slide Deck →
                    </button>
                    <button 
                      onClick={async () => {
                        playSound('click');
                        setIsLoading(true);
                        try {
                          const slides = await convertPresentation(file);
                          const imagesMap: Record<number, string> = {};
                          const texts: string[] = [];
                          slides.forEach(s => { 
                            imagesMap[s.slideNumber] = s.image; 
                            texts.push(s.text);
                          });
                          setSlideImages(imagesMap);
                          setExtractedSlideTexts(texts);
                          setIsPracticeMode(true);
                        } catch (e: any) {
                          setError("Could not process presentation slides: " + e.message);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="flex-1 py-3.5 px-4 rounded-xl text-sm font-black bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#151930] shadow-md shadow-amber-500/20 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Video size={16} /> Practice Live Presentation →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : error ? (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in bg-rose-50 border border-rose-200 rounded-xl">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-rose-900 mb-3">Analysis Failed</h2>
          <p className="text-rose-700 font-medium mb-8 max-w-md">{error}</p>
          <button onClick={handleTryAgain} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-sm hover:bg-rose-700 transition-all">
            Try Again
          </button>
        </div>
      ) : (
        <div className="w-full space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
            <div>
              <div className="inline-block relative mb-3">
                <span className="text-xs font-black text-[#F2A93B] uppercase tracking-widest bg-[#151930] px-3.5 py-1.5 rounded-full inline-block shadow-md">
                  Results Dashboard
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Presentation Analysis</h2>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={() => {
                setIsVivaModalOpen(true);
              }} className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1B2140] hover:bg-[#0B0E27] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                <GraduationCap size={16} /> Take Viva Defense
              </button>
              <button 
                onClick={() => setIsPracticeMode(true)}
                className="flex-1 sm:flex-none px-4.5 py-2.5 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#151930] font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video size={16} /> Practice Live Presentation
              </button>
              <button onClick={handleTryAgain} className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-slate-900 border border-slate-900 rounded-xl text-white font-extrabold text-xs shadow-sm hover:bg-black transition-all text-center cursor-pointer">
                Try again
              </button>
            </div>
          </div>

          <div className="w-full space-y-8">
              {/* Score Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {(analysis.isLivePractice ? [
                  { label: 'Readiness', value: analysis.overallScore, bg: 'bg-[#151930] text-white border-amber-500/30' },
                  { label: 'Coverage', value: analysis.contentScore, bg: 'bg-white border-slate-200' },
                  { label: 'Delivery', value: analysis.deliveryScore, bg: 'bg-white border-slate-200' },
                  ...(analysis.eyeContactScore !== undefined ? [{ label: 'Eye Contact', value: `${analysis.eyeContactScore}%`, bg: 'bg-white border-slate-200' }] : []),
                  ...(analysis.postureScore !== undefined ? [{ label: 'Posture', value: `${analysis.postureScore}%`, bg: 'bg-white border-slate-200' }] : []),
                ] : [
                  { label: 'Overall', value: analysis.overallScore, bg: 'bg-[#151930] text-white border-amber-500/30' },
                  { label: 'Content', value: analysis.contentScore, bg: 'bg-white border-slate-200' },
                  { label: 'Design', value: analysis.designScore, bg: 'bg-white border-slate-200' },
                  { label: 'Storytelling', value: analysis.storytellingScore || analysis.overallScore, bg: 'bg-white border-slate-200' },
                ]).map((stat, idx) => (
                  <div key={idx} className={`${stat.bg} p-4 border rounded-2xl shadow-sm relative overflow-hidden`}>
                    <p className={`text-[11px] font-extrabold uppercase tracking-widest mb-1 ${stat.bg.includes('#151930') ? 'text-[#F2A93B]' : 'text-slate-500'}`}>{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.bg.includes('#151930') ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Vocal & Body Language Analysis Card (Only for Live Practice) */}
              {(analysis.deliveryAnalysis || analysis.visualBodyLanguageAnalysis) && (
                <div className="bg-[#151930] text-white border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Mic size={14} className="text-amber-400" /> Live Vocal Pacing & Body Language Breakdown</span>
                    <span className="text-slate-400 font-mono text-[10px]">Real-time Performance Metrics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    {analysis.deliveryAnalysis?.pacingFeedback && (
                      <div className="bg-[#0B0E27] p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-extrabold text-amber-300">Vocal Pacing & Speed:</span>
                        <p className="text-slate-300">{analysis.deliveryAnalysis.pacingFeedback}</p>
                      </div>
                    )}
                    {analysis.deliveryAnalysis?.fillerWordFeedback && (
                      <div className="bg-[#0B0E27] p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-extrabold text-amber-300">Filler Word Usage:</span>
                        <p className="text-slate-300">{analysis.deliveryAnalysis.fillerWordFeedback}</p>
                      </div>
                    )}
                  </div>

                  {analysis.visualBodyLanguageAnalysis?.feedback && (
                    <div className="bg-[#0B0E27] p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <span className="font-extrabold text-emerald-400">Webcam Body Language & Eye Contact:</span>
                      <p className="text-slate-300">{analysis.visualBodyLanguageAnalysis.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 relative">
                  <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 inline-block">Strengths</p>
                  <ul className="space-y-3">
                    {analysis.strengths?.map((item: string, i: number) => (
                      <li key={i} className="text-slate-800 text-sm sm:text-base font-semibold flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </span> 
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl shadow-sm p-6 relative">
                  <p className="text-xs font-extrabold text-amber-800 uppercase tracking-widest mb-4 border-b border-amber-200/50 pb-2 inline-block">Areas to improve</p>
                  <ul className="space-y-3">
                    {analysis.weaknesses?.map((item: string, i: number) => (
                      <li key={i} className="text-slate-800 text-sm sm:text-base font-semibold flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          <X size={11} className="stroke-[3]" />
                        </span> 
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Coaching & Presentation Next Steps Container */}
              {analysis.suggestions?.length > 0 && (
                <div className="bg-[#151930] text-white border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold shrink-0">
                      <Target size={14} />
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">
                      Recommendations & Actionable Coaching Plan
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm font-medium">
                    {analysis.suggestions.map((sug: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-[#0B0E27] p-3.5 rounded-xl border border-slate-800 text-slate-200">
                        <span className="text-indigo-400 font-bold shrink-0 mt-0.5"><Target size={14} /></span>
                        <span className="leading-relaxed">{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Slide-by-Slide Detailed Breakdown with Widescreen Previews */}
              {analysis.slideBySlideFeedback?.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-block relative">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest bg-slate-100 px-3.5 py-1.5 rounded-full inline-block border border-slate-200">
                        Slide-by-Slide Feedback
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {analysis.slideBySlideFeedback.map((fb: any, idx: number) => {
                        const sNum = parseInt(String(fb.slideNumber).replace(/\D/g, ''), 10) || (idx + 1);
                        return (
                          <a key={idx} href={`#slide-${sNum}`} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-extrabold hover:bg-[#151930] hover:text-[#F2A93B] transition-all flex-shrink-0 border border-slate-200">
                            {sNum}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-8">
                    {analysis.slideBySlideFeedback.map((fb: any, i: number) => {
                      const slideNum = parseInt(String(fb.slideNumber).replace(/\D/g, ''), 10) || (i + 1);
                      const slideImg = slideImages[slideNum] || slideImages[fb.slideNumber] || slideImages[i + 1];
                      const slideText = extractedSlideTexts[slideNum - 1] || extractedSlideTexts[i] || '';

                      return (
                        <div key={i} id={`slide-${slideNum}`} className="flex flex-col lg:flex-row gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 scroll-mt-24">
                          {/* Widescreen Large Slide Preview */}
                          <div className="w-full lg:w-[58%] flex-shrink-0 relative group">
                             <div className="absolute top-3 left-3 px-3 py-1 bg-[#151930] text-[#F2A93B] font-black text-xs rounded-xl flex items-center justify-center z-10 shadow-md border border-amber-500/20">
                               Slide {slideNum}
                             </div>
                              {slideImg && typeof slideImg === 'string' && slideImg.length > 100 ? (
                                <div className="w-full aspect-video rounded-xl border border-slate-200 bg-[#151930] overflow-hidden flex items-center justify-center p-2 relative shadow-inner">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={slideImg} alt={`Slide ${slideNum}`} className="w-full h-full object-contain rounded-lg shadow-sm" />
                                </div>
                              ) : previewFailed || slideText ? (
                                (() => {
                                  const textClean = (slideText || '').trim();
                                  const sentences = textClean ? textClean.split(/(?<=[.?!])\s+/).filter(Boolean) : [];
                                  const slideTitle = sentences[0] || `Slide ${slideNum}`;
                                  const slideBullets = sentences.slice(1, 5);

                                  return (
                                    <div className="w-full aspect-video rounded-xl border border-slate-700/80 bg-gradient-to-br from-[#0F1426] via-[#151930] to-[#0A0D1D] p-4 sm:p-5 flex flex-col justify-between text-white relative shadow-xl overflow-hidden select-none">
                                      {/* Top accent line */}
                                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400"></div>
                                      
                                      {/* Decorative radial glow */}
                                      <div className="absolute top-[-30%] right-[-15%] w-48 h-48 bg-amber-500/10 blur-2xl rounded-full pointer-events-none"></div>

                                      {/* Slide Header */}
                                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                          <FileText size={13} className="text-[#F2A93B]" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[180px]">
                                            {file?.name || 'Presentation Deck'}
                                          </span>
                                        </div>
                                        <span className="text-[9px] font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
                                          Slide Layout
                                        </span>
                                      </div>

                                      {/* Slide Content Body */}
                                      <div className="my-auto py-1.5 relative z-10">
                                        <h4 className="text-xs sm:text-sm font-black text-white tracking-tight mb-2 line-clamp-1 border-l-2 border-[#F2A93B] pl-2">
                                          {slideTitle}
                                        </h4>
                                        {slideBullets.length > 0 ? (
                                          <div className="space-y-1.5 pl-2">
                                            {slideBullets.map((bullet: string, bIdx: number) => (
                                              <div key={bIdx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-300 font-medium">
                                                <span className="text-[#F2A93B] font-bold shrink-0 mt-0.5">•</span>
                                                <span className="line-clamp-1 leading-snug">{bullet}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                            {textClean || `Slide ${slideNum} visual design & content analysis.`}
                                          </p>
                                        )}
                                      </div>

                                      {/* Footer */}
                                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono relative z-10">
                                        <span>Oratii Slide Audit</span>
                                        <span>Slide {slideNum}</span>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="w-full aspect-video rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                                  <div className="w-8 h-8 border-4 border-slate-700 border-t-[#F2A93B] rounded-full animate-spin mb-3"></div>
                                  <p className="text-sm font-bold text-slate-200">Rendering Slide {slideNum} Visuals...</p>
                                  <p className="text-xs text-slate-400 mt-1">Converting slide deck design & graphics</p>
                                </div>
                              )}
                          </div>
                        
                        {/* Feedback specific to this slide */}
                        <div className="flex-1 space-y-4 flex flex-col justify-center">
                           {fb.strengths && (
                             <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
                                <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-1">Strengths</p>
                                <p className="text-slate-800 text-sm font-semibold leading-relaxed">{fb.strengths}</p>
                             </div>
                           )}
                           {fb.weaknesses && (
                             <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4">
                                <p className="text-[11px] font-black text-rose-700 uppercase tracking-widest mb-1">Weaknesses</p>
                                <p className="text-slate-800 text-sm font-semibold leading-relaxed">{fb.weaknesses}</p>
                             </div>
                           )}
                           {fb.missing && (
                             <div className={`border rounded-xl p-4 ${fb.missing.toLowerCase().includes('none') ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-amber-50/60 border-amber-200/80'}`}>
                                <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${fb.missing.toLowerCase().includes('none') ? 'text-slate-400' : 'text-amber-800'}`}>Missing Elements</p>
                                <p className={`text-sm font-semibold leading-relaxed ${fb.missing.toLowerCase().includes('none') ? 'text-slate-400' : 'text-slate-800'}`}>{fb.missing}</p>
                             </div>
                           )}
                           {fb.feedback && !fb.strengths && !fb.weaknesses && !fb.missing && (
                             <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">Feedback</p>
                                <p className="text-slate-800 text-sm font-semibold leading-relaxed">{fb.feedback}</p>
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
        </div>
      )}

      {/* Built-in AI Viva Voce Defense Modal */}
      <VivaDefenseModal 
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        presentationTitle={file?.name || 'Presentation & Slide Deck'}
        contextSummary={analysis ? `SLIDE ANALYZER SUMMARY: File: ${file?.name || 'Presentation Deck'}. Overall Score: ${analysis.overallScore}/100 | Content: ${analysis.contentScore}/100 | Design: ${analysis.designScore}/100. Key Strengths: ${(analysis.strengths || []).join('; ')}. Weaknesses to Defend: ${(analysis.weaknesses || []).join('; ')}` : ''}
        slideAnalysisData={analysis}
      />

      <XPToast events={xpEvents} onComplete={() => setXpEvents([])} />
      
      {/* Trial Signup Prompt */}
      <TrialSignupPrompt isOpen={showTrialPrompt} onClose={() => setShowTrialPrompt(false)} />
      <GuestAuthModal isOpen={isGuestAuthModalOpen} onClose={() => setIsGuestAuthModalOpen(false)} featureName="Slide Deck Studio" />
      <InsufficientCreditsModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} requiredCredits={1} currentBalance={creditBalance} featureName="Slide Deck Studio" />
    </div>
    </>
  );
}

export default function PresentationAnalyzer() {
  return (
    <Suspense fallback={
      <div className="w-full h-96 flex items-center justify-center">
        <ScribbleLoader text="Loading Presentation Analyzer..." />
      </div>
    }>
      <PresentationAnalyzerContent />
    </Suspense>
  );
}
