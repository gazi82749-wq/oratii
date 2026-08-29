'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { saveSession } from '../../lib/storage';
import { processSessionCompletion } from '../../lib/gamification';
import XPToast from '../../components/XPToast';
import { initializeGestureRecognizer } from '../../lib/mediapipeLoader';
import { convertPresentation } from '../../lib/presentationConverter';
import TrialSignupPrompt from '../../components/TrialSignupPrompt';
import { supabase } from '../../lib/supabaseClient';

export default function PPTCoach() {
  const router = useRouter();
  
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [combinedAnalysis, setCombinedAnalysis] = useState<any>(null);
  const [xpEvents, setXpEvents] = useState<any[]>([]);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);

  // Slide viewer state
  const [slideImages, setSlideImages] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesLoading, setSlidesLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resultVideoRef = useRef<HTMLVideoElement | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const gestureRecognizerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const gestureCountsRef = useRef({ openCount: 0, totalFrames: 0 });
  const [gestureStats, setGestureStats] = useState({ openCount: 0, totalFrames: 0 });
  const slideAnalysisPromiseRef = useRef<Promise<any> | null>(null);

  // Keyboard navigation for slides
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (step !== 2) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setCurrentSlide(prev => Math.min(prev + 1, slideImages.length - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setCurrentSlide(prev => Math.max(prev - 1, 0));
    }
  }, [step, slideImages.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        setSlideFile(acceptedFiles[0]);
        setStep(2);
        setCurrentSlide(0);
        initCamera();

        // Convert slides to images for the viewer
        setSlidesLoading(true);
        convertPresentation(acceptedFiles[0])
          .then(slides => {
            setSlideImages(slides);
            setSlidesLoading(false);
          })
          .catch(err => {
            console.error("Slide conversion failed:", err);
            setSlidesLoading(false);
          });

        // KICK OFF SLIDE ANALYSIS IN THE BACKGROUND IMMEDIATELY
        const slideFormData = new FormData();
        slideFormData.append('file', acceptedFiles[0]);
        slideAnalysisPromiseRef.current = (async () => {
          const { data: { session } } = await supabase.auth.getSession();
          const headers: Record<string, string> = {};
          if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
          const res = await fetch('/api/analyze-slides', { method: 'POST', headers, body: slideFormData });
          if (res.status === 401 && !session?.user) { router.push('/login'); return { status: 'error' }; }
          return res.json();
        })();
      }
    }
  });

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      if (!gestureRecognizerRef.current) {
        gestureRecognizerRef.current = await initializeGestureRecognizer();
      }
    } catch (error) {
      console.error("Error accessing media:", error);
      alert("Could not access microphone/camera. Please ensure permissions are granted.");
    }
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      initCamera();
      return;
    }
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
      setAudioBlob(blob);
      stream.getTracks().forEach(track => track.stop());
      analyzeSession(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);

    gestureCountsRef.current = { openCount: 0, totalFrames: 0 };
    setGestureStats({ openCount: 0, totalFrames: 0 });
    
    const trackGestures = () => {
      if (videoRef.current && gestureRecognizerRef.current && mediaRecorderRef.current?.state === 'recording') {
        let startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoRef.current.currentTime;
          const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, startTimeMs);
          
          gestureCountsRef.current.totalFrames += 1;
          
          if (results.gestures.length > 0) {
            const categoryName = results.gestures[0][0].categoryName;
            if (categoryName === "Open_Palm" || categoryName === "Thumb_Up" || categoryName === "Victory") {
              gestureCountsRef.current.openCount += 1;
            }
          }
        }
        animationFrameRef.current = requestAnimationFrame(trackGestures);
      }
    };
    
    setTimeout(trackGestures, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setGestureStats({ ...gestureCountsRef.current });
    }
  };

  const analyzeSession = async (mediaBlob: Blob) => {
    setIsLoading(true);
    setStep(3);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const speechFormData = new FormData();
      speechFormData.append('audio', mediaBlob);

      const speechPromise = fetch('/api/speech-analyzer', { method: 'POST', headers, body: speechFormData }).then(res => {
        if (res.status === 401 && !session?.user) { router.push('/login'); return { status: 'error' }; }
        return res.json();
      });

      let slideData;
      if (slideAnalysisPromiseRef.current) {
        slideData = await slideAnalysisPromiseRef.current;
      } else {
        const slideFormData = new FormData();
        if (slideFile) slideFormData.append('file', slideFile);
        const slideRes = await fetch('/api/analyze-slides', { method: 'POST', headers, body: slideFormData });
        slideData = await slideRes.json();
      }

      const speechData = await speechPromise;

      if ((slideData.error === "Trial Expired" || speechData.error === "Trial Expired") && !session?.user) {
        router.push('/login?message=trial_expired');
        return;
      }

      if (slideData.status === 'success' && speechData.status === 'success') {
        const wpm = speechData.analysis.wpm;
        const paceScore = wpm >= 120 && wpm <= 160 ? 100 : Math.max(0, 100 - Math.abs(140 - wpm));
        const totalWords = speechData.analysis.totalWords || 1;
        const fillerRate = (speechData.analysis.totalFillers / totalWords) * 100;
        const clarityScore = Math.max(0, 100 - (fillerRate * 5));
        const confidenceScore = Math.max(0, Math.round((paceScore + clarityScore) / 2) + Math.floor(Math.random() * 5));
        
        const slideOverall = slideData.data.overallScore || 0;
        const speechOverall = Math.round((paceScore + clarityScore + confidenceScore) / 3);
        
        let bodyLanguageScore = 100;
        if (gestureCountsRef.current.totalFrames > 0) {
          const openRate = gestureCountsRef.current.openCount / gestureCountsRef.current.totalFrames;
          bodyLanguageScore = Math.min(100, Math.round(50 + (openRate * 100)));
        }
        
        const unifiedOverall = Math.round((slideOverall + speechOverall + bodyLanguageScore) / 3);

        const finalAnalysis = {
          unifiedScore: unifiedOverall,
          slides: slideData.data,
          slideText: slideData.slideTextContent,
          bodyLanguageScore,
          speech: {
            ...speechData,
            scores: {
              overall: speechOverall,
              pace: Math.round(paceScore),
              clarity: Math.round(clarityScore),
              confidence: confidenceScore
            }
          }
        };

        setCombinedAnalysis(finalAnalysis);
        
        saveSession('ppt-coach', {
          topic: 'PPT Live Defense',
          scores: { overall: unifiedOverall, slides: slideOverall, speech: speechOverall },
          strengths: slideData.data.strengths || [],
          weaknesses: slideData.data.weaknesses || [],
          suggestions: slideData.data.suggestions || [],
          feedback: speechData.analysis?.tone?.feedback || '',
          transcript: speechData.transcript || ''
        });

        const result = processSessionCompletion('ppt-coach', { overall: unifiedOverall });
        setXpEvents(result.events);
        
        setTimeout(() => setShowTrialPrompt(true), 2500);

      } else {
        alert("Analysis failed. Please check the files and try again.");
        setStep(1);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server during analysis.');
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeViva = () => {
    if (!combinedAnalysis) return;
    
    let topicText = '';
    if (combinedAnalysis.slideText && combinedAnalysis.slideText.length > 0) {
      topicText = combinedAnalysis.slideText.join('\n');
      if (topicText.length > 5000) {
        topicText = topicText.substring(0, 5000) + '...';
      }
    } else {
       topicText = `Presentation on strengths: ${combinedAnalysis.slides.strengths?.join(', ')} and weaknesses: ${combinedAnalysis.slides.weaknesses?.join(', ')}`;
    }
    
    const stateToSave = {
      phase: 'setup', 
      mode: 'text', 
      topic: `Based on this presentation content, conduct a viva defense:\n\n${topicText}`,
      chatHistory: [],
      currentQuestion: '',
      scores: { confidence: 0, accuracy: 0, communication: 0, overall: 0 },
      questionsAnswered: 0,
      allScores: []
    };
    sessionStorage.setItem('Oratii_viva_state', JSON.stringify(stateToSave));
    sessionStorage.setItem('Oratii_viva_autostart', 'true');
    router.push('/viva');
  };

  const reset = () => {
    setSlideFile(null);
    setAudioBlob(null);
    setCombinedAnalysis(null);
    setSlideImages([]);
    setCurrentSlide(0);
    setStep(1);
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in text-slate-900">
      
      {/* Step 1: Upload */}
      {step === 1 && (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">PPT Coach (v2 Preview)</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Upload your deck, present it live, and receive unified feedback.</p>
          </div>

          <div className="border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col items-center bg-white">
            <div className="w-full max-w-lg mx-auto">
              <div
                {...getRootProps()}
                className={`border border-dashed rounded-lg p-12 cursor-pointer transition-colors flex flex-col items-center justify-center ${
                  isDragActive ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Drag & drop PPTX or PDF here
                </p>
                <p className="text-xs text-slate-500">or click to browse</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Present */}
      {step === 2 && (
        <div className="w-full flex flex-col gap-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Presentation</h1>
              <p className="text-sm text-slate-500">File: {slideFile?.name}</p>
            </div>
            <button onClick={reset} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm">Cancel</button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Slide Viewer */}
            <div className="flex-1 relative aspect-video bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="absolute top-4 right-4 z-20 bg-white/90 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm border border-slate-200 backdrop-blur-sm">
                {slideImages.length > 0 ? `${currentSlide + 1} / ${slideImages.length}` : '...'}
              </div>

              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm backdrop-blur-sm">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}

              <div className="flex-1 flex items-center justify-center bg-slate-50 relative">
                {slidesLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Converting slides...</p>
                  </div>
                ) : slideImages.length > 0 ? (
                  <img 
                    key={currentSlide}
                    src={slideImages[currentSlide]?.image} 
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-contain animate-fade-in"
                    draggable={false}
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-xl font-black text-slate-500">Slide preview not available</p>
                    <p className="text-sm font-bold text-slate-400 mt-2">Present using your original file</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Camera & Controls */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="aspect-video bg-slate-900 border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute top-3 right-3 z-10 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <p className="text-xs text-white font-bold flex items-center gap-1.5 uppercase tracking-widest">
                    {isRecording ? <><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>REC</> : 'Ready'}
                  </p>
                </div>
              </div>

              <div className="flex-1 border border-slate-200 bg-white shadow-sm rounded-xl p-6 flex flex-col items-center justify-center gap-6">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isRecording 
                      ? 'bg-rose-50 border-4 border-rose-200 scale-95' 
                      : 'bg-white border-4 border-slate-200 hover:scale-105'
                  }`}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                  ) : (
                    <div className="w-6 h-6 bg-rose-500 rounded-full"></div>
                  )}
                </button>
                <span className={`text-sm font-bold ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                  {isRecording ? 'Recording...' : 'Start Recording'}
                </span>

                <div className="flex items-center gap-4 w-full justify-between mt-2">
                  <button 
                    onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                    disabled={currentSlide === 0 || slideImages.length <= 1}
                    className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ← Prev
                  </button>
                  <button 
                    onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slideImages.length - 1))}
                    disabled={currentSlide === slideImages.length - 1 || slideImages.length <= 1}
                    className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && isLoading && (
        <div className="border border-slate-100 rounded-lg p-12 flex flex-col items-center my-10">
          <div className="w-10 h-10 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-slate-900">Processing analysis…</p>
          <p className="text-xs text-slate-500 mt-1">Evaluating slides and delivery.</p>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && !isLoading && combinedAnalysis && (
        <div className="w-full space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Results</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Unified Analysis</h2>
              <p className="text-sm text-slate-500 mt-1">Combined performance: slides + delivery</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={handleTakeViva} className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors shadow-sm flex items-center gap-2">
                🎓 Take Viva
              </button>
              <button onClick={reset} className="flex-1 sm:flex-none justify-center text-center px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                Present again
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
            <div className="bg-white p-4 sm:p-5">
              <p className="text-xs text-slate-500 mb-1.5">Overall</p>
              <p className="text-3xl font-semibold text-slate-900">{combinedAnalysis.unifiedScore}<span className="text-sm font-normal text-slate-300">/100</span></p>
            </div>
            <div className="bg-white p-4 sm:p-5">
              <p className="text-xs text-slate-500 mb-1.5">Speech</p>
              <p className="text-xl font-semibold text-slate-900">{combinedAnalysis.speech.scores.overall}</p>
              <p className="text-xs text-slate-500 mt-1">{combinedAnalysis.speech.analysis.wpm} WPM · {combinedAnalysis.speech.analysis.totalFillers} fillers</p>
              <p className="text-xs font-semibold text-indigo-600 mt-1">Tone: {combinedAnalysis.speech.analysis.tone?.tone}</p>
            </div>
            <div className="bg-white p-4 sm:p-5">
              <p className="text-xs text-slate-500 mb-1.5">Slides</p>
              <p className="text-xl font-semibold text-slate-900">{combinedAnalysis.slides.overallScore}</p>
              <p className="text-xs text-slate-500 mt-1">Design: {combinedAnalysis.slides.designScore} · Content: {combinedAnalysis.slides.contentScore}</p>
            </div>
            <div className="bg-white p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-100">
              <p className="text-xs text-slate-500 mb-1.5">Body Language</p>
              <p className="text-xl font-semibold text-slate-900">{combinedAnalysis.bodyLanguageScore}</p>
              <p className="text-xs text-slate-500 mt-1">
                Open Gestures: {gestureStats.totalFrames > 0 ? Math.round((gestureStats.openCount / gestureStats.totalFrames) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
              <video 
                ref={resultVideoRef}
                src={audioBlob ? URL.createObjectURL(audioBlob) : ''}
                controls
                className="w-full h-full max-h-[400px] object-cover"
              />
            </div>
            
            <div className="border border-slate-100 rounded-lg p-5 flex flex-col h-full max-h-[400px] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Time-Marked Feedback</p>
              
              {combinedAnalysis.speech.analysis.tone?.timeMarkers?.length > 0 ? (
                <div className="space-y-3">
                  {combinedAnalysis.speech.analysis.tone.timeMarkers.map((marker: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        if (resultVideoRef.current) {
                          resultVideoRef.current.currentTime = marker.time;
                          resultVideoRef.current.play();
                        }
                      }}
                      className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex gap-4 items-start"
                    >
                      <div className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${marker.type === 'strength' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {formatTime(marker.time)}
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${marker.type === 'strength' ? 'text-emerald-600' : 'text-rose-600'}`}>{marker.type}</p>
                        <p className="text-sm text-slate-700">{marker.feedback}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <p className="text-sm">No specific time markers generated for this session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <XPToast events={xpEvents} onComplete={() => setXpEvents([])} />
      <TrialSignupPrompt isOpen={showTrialPrompt} onClose={() => setShowTrialPrompt(false)} />
    </div>
  );
}
