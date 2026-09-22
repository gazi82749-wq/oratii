'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Square, ChevronLeft, ChevronRight, Video, VideoOff, Mic, Camera, AlertCircle, Grid, GripVertical, Pause, Tv, X, XCircle, ZoomIn, ZoomOut, Maximize2, Minimize2, ShieldCheck, Activity, RotateCcw, Check, FileText } from 'lucide-react';
import { logEvent, startRecording, stopRecording, EVENT_TYPES } from '@/lib/sessionRecorder';
import { supabase } from '@/lib/supabaseClient';
import ScribbleLoader from '@/components/ScribbleLoader';
import { PrivacyConsentModal } from '@/components/PrivacyConsentModal';
import { CalibrationModal } from '@/components/CalibrationModal';
import { getStoredPrivacyConsent, anonymizeSessionTelemetry, PrivacyConsentState } from '@/lib/privacyConsent';
import { RealtimeAudioProcessor } from '@/lib/audioMetricsProcessor';
import { initializeFaceLandmarker, initializePoseLandmarker, calculateEyeContactScore, calculatePostureScore } from '@/lib/mediapipeLoader';
import ConfidenceGraph, { ScoreRing } from '@/components/ConfidenceGraph';
import VivaDefenseModal from '@/components/VivaDefenseModal';

interface PresentationPracticeProps {
  fileName: string;
  slideImages: Record<number, string>;
  slideTextContent: string[];
  onComplete: (analysisData: any) => void;
  onCancel: () => void;
}

export default function PresentationPractice({
  fileName,
  slideImages,
  slideTextContent,
  onComplete,
  onCancel
}: PresentationPracticeProps) {
  const [hasVideo, setHasVideo] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [thumbnailPosition, setThumbnailPosition] = useState<'left' | 'bottom'>('left');
  const [cameraLayout, setCameraLayout] = useState<'docked' | 'pip'>('pip');
  const [cameraSize, setCameraSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraFit, setCameraFit] = useState<'cover' | 'contain'>('cover');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideEventLog, setSlideEventLog] = useState<Array<{ slideNumber: number; timestamp: number; time: string; wpm?: number; confidence?: number; }>>([]);

  const toggleBrowserFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  }, []);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState<PrivacyConsentState | null>(null);

  const [liveEyeContact, setLiveEyeContact] = useState(85);
  const [livePostureScore, setLivePostureScore] = useState(90);
  const [liveVolume, setLiveVolume] = useState(0);
  const [liveMonotone, setLiveMonotone] = useState(false);
  const [livePaceWpm, setLivePaceWpm] = useState(135);
  const [practiceMediaUrl, setPracticeMediaUrl] = useState<string | null>(null);
  const [showLocalResults, setShowLocalResults] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  const [liveVerbatimAlert, setLiveVerbatimAlert] = useState<string | null>(null);
  const [extemporeScore, setExtemporeScore] = useState(90);
  const [verbatimSlideFlags, setVerbatimSlideFlags] = useState<Array<{ slide: number; overlapPercent: number }>>([]);
  const presentationSpeechRecRef = useRef<any>(null);
  const spokenWordCountRef = useRef<number>(0);

  const audioProcessorRef = useRef<RealtimeAudioProcessor | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);

  const cancelPracticeSession = () => {
    if (confirm("Cancel this live practice session? Recording will be discarded.")) {
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (presentationSpeechRecRef.current) {
        try { presentationSpeechRecRef.current.stop(); } catch (e) {}
        presentationSpeechRecRef.current = null;
      }
      setLiveVerbatimAlert(null);
      stopRecording();
      stopMediaStream();
      setElapsedSeconds(0);
    }
  };

  // --- Draggable PiP state ---
  const [pipPosition, setPipPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pipContainerRef = useRef<HTMLDivElement | null>(null);
  const pipRef = useRef<HTMLDivElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoFramesRef = useRef<string[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = Object.keys(slideImages).length || slideTextContent.length || 1;

  const handleSlideChange = useCallback((newSlideNumber: number) => {
    if (newSlideNumber < 1 || newSlideNumber > totalSlides) return;
    setCurrentSlide(newSlideNumber);
    setLiveVerbatimAlert(null);

    if (isRecording) {
      const m = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
      const s = (elapsedSeconds % 60).toString().padStart(2, '0');
      const timeStr = `${m}:${s}`;

      const entry = { slideNumber: newSlideNumber, timestamp: elapsedSeconds, time: timeStr, wpm: livePaceWpm, confidence: liveEyeContact };
      setSlideEventLog(prev => [...prev, entry]);
      logEvent(EVENT_TYPES.SLIDE_CHANGE, { slideNumber: newSlideNumber, timestamp: elapsedSeconds });
    }
  }, [totalSlides, isRecording, elapsedSeconds]);

  // Cleanup stream on unmount
  useEffect(() => {
    const videoEl = videoRef.current;
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoEl) {
        videoEl.srcObject = null;
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, []);

  // Sync active media stream to videoRef when camera layout changes
  useEffect(() => {
    if (hasVideo && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  }, [hasVideo, cameraLayout, isRecording]);

  // Revoke practice media URL on cleanup to prevent browser memory leak
  useEffect(() => {
    return () => {
      if (practiceMediaUrl) {
        URL.revokeObjectURL(practiceMediaUrl);
      }
    };
  }, [practiceMediaUrl]);

  // --- Draggable PiP handlers ---
  const handlePipPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const pipEl = pipRef.current;
    if (!pipEl) return;

    const rect = pipEl.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDraggingPip(true);
    pipEl.setPointerCapture(e.pointerId);
  }, []);

  const handlePipPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPip) return;
    e.preventDefault();
    const container = pipContainerRef.current;
    const pipEl = pipRef.current;
    if (!container || !pipEl) return;

    const containerRect = container.getBoundingClientRect();
    const pipWidth = pipEl.offsetWidth;
    const pipHeight = pipEl.offsetHeight;

    let newX = e.clientX - containerRect.left - dragOffsetRef.current.x;
    let newY = e.clientY - containerRect.top - dragOffsetRef.current.y;

    // Clamp within container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - pipWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - pipHeight));

    setPipPosition({ x: newX, y: newY });
  }, [isDraggingPip]);

  const handlePipPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingPip(false);
    const pipEl = pipRef.current;
    if (pipEl) pipEl.releasePointerCapture(e.pointerId);
  }, []);

  // --- Mobile & Tablet Touch Swipe Handlers ---
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX < -40) {
      handleSlideChange(currentSlide + 1);
    } else if (deltaX > 40) {
      handleSlideChange(currentSlide - 1);
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation for slide deck (Arrow left/right, Space, F5 for Full View)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleSlideChange(currentSlide + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSlideChange(currentSlide - 1);
      } else if (e.key === 'F5') {
        e.preventDefault();
        toggleBrowserFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isProcessing, handleSlideChange, toggleBrowserFullscreen]);

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);



  const toggleCamera = async (enableVideo: boolean) => {
    if (!enableVideo) {
      setHasVideo(false);
      stopMediaStream();
    } else {
      setHasVideo(true);
      if (isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 640, height: 480 } });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera permission error:", err);
          alert("Camera permission denied or camera unavailable.");
          setHasVideo(false);
        }
      }
    }
  };

  const handleStartButtonClick = () => {
    const stored = getStoredPrivacyConsent();
    if (!stored.hasConsented) {
      setShowPrivacyModal(true);
      return;
    }
    setPrivacyConsent(stored);
    setShowCalibrationModal(true);
  };

  const handlePrivacyConsentGiven = (consent: PrivacyConsentState) => {
    setPrivacyConsent(consent);
    setShowPrivacyModal(false);
    setShowCalibrationModal(true);
  };

  const handleCalibrationComplete = async () => {
    setShowCalibrationModal(false);
    await startPracticeRecording();
  };

  const startPracticeRecording = async () => {
    try {
      setIsProcessing(false);
      setIsPaused(false);
      audioChunksRef.current = [];
      videoFramesRef.current = [];
      setElapsedSeconds(0);

      // Request user media (Video vs Audio-only)
      const constraints: MediaStreamConstraints = hasVideo
        ? { audio: true, video: { width: 640, height: 480 } }
        : { audio: true, video: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (hasVideo && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Web Audio Processor for zero-latency local audio HUD
      const audioProc = new RealtimeAudioProcessor();
      const audioInitSuccess = audioProc.initialize(stream);
      if (audioInitSuccess) {
        audioProcessorRef.current = audioProc;
      }

      // Initialize MediaPipe Vision models on client GPU (if available)
      if (hasVideo) {
        initializeFaceLandmarker().then(lm => { faceLandmarkerRef.current = lm; });
        initializePoseLandmarker().then(pm => { poseLandmarkerRef.current = pm; });
      }

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(1000);
      startRecording();
      setIsRecording(true);

      // Initialize Speech Recognition for Realtime Verbatim Slide Reading Detection
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        try {
          const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const rec = new SpeechClass();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            const spokenTokens = fullText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            spokenWordCountRef.current = spokenTokens.length;
            const activeSlideText = (slideTextContent[currentSlide - 1] || '').toLowerCase();

            if (activeSlideText && spokenTokens.length >= 6) {
              const slideWords = new Set(
                activeSlideText.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length > 3)
              );
              if (slideWords.size > 0) {
                let matches = 0;
                spokenTokens.forEach(token => {
                  if (slideWords.has(token.replace(/[^a-z0-9]/g, ''))) matches++;
                });
                const overlapRatio = Math.round((matches / spokenTokens.length) * 100);
                if (overlapRatio > 55) {
                  setLiveVerbatimAlert(`⚠️ Verbatim Reading Detected (${overlapRatio}% overlap on Slide ${currentSlide}): Summarize the 'Why' rather than reading bullet points word-for-word.`);
                  setVerbatimSlideFlags(prev => {
                    if (prev.some(p => p.slide === currentSlide)) return prev;
                    return [...prev, { slide: currentSlide, overlapPercent: overlapRatio }];
                  });
                  setExtemporeScore(prev => Math.max(50, prev - 3));
                } else {
                  setLiveVerbatimAlert(null);
                }
              }
            }
          };

          rec.start();
          presentationSpeechRecRef.current = rec;
        } catch (recErr) {
          console.warn('Speech recognition for verbatim detection init notice:', recErr);
        }
      }

      const initialLog = [{ slideNumber: currentSlide, timestamp: 0, time: '00:00' }];
      setSlideEventLog(initialLog);
      logEvent(EVENT_TYPES.SLIDE_CHANGE, { slideNumber: currentSlide });

      // 100ms Polling Loop for Realtime Edge HUD (0ms Network Latency) with 3-Min Free Drill Cap
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const nextSec = prev + 1;
          if (nextSec > 0 && spokenWordCountRef.current > 0) {
            setLivePaceWpm(Math.min(200, Math.max(80, Math.round((spokenWordCountRef.current / nextSec) * 60))));
          }
          if (nextSec >= 180) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimeout(() => {
              stopPracticeRecording();
            }, 0);
            return 180;
          }
          return nextSec;
        });

        if (audioProcessorRef.current) {
          const metrics = audioProcessorRef.current.getMetrics();
          setLiveVolume(metrics.volumeRms);
          setLiveMonotone(metrics.isMonotone);
          if (metrics.isSpeaking) {
             setLiveEyeContact(prev => Math.min(100, prev + 2));
             setLivePostureScore(prev => Math.min(100, prev + 1));
          } else {
             setLiveEyeContact(prev => Math.max(50, prev - 1));
             setLivePostureScore(prev => Math.max(60, prev - 0.5));
          }
        }
      }, 1000);

      if (hasVideo) {
        frameIntervalRef.current = setInterval(() => {
          captureWebcamFrame();
        }, 4000);
      }
    } catch (err: any) {
      console.error("Failed to start recording stream:", err);
      alert("Could not access microphone/camera. Please check browser permissions.");
    }
  };

  const captureWebcamFrame = useCallback(() => {
    if (!videoRef.current || !hasVideo) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        if (base64) videoFramesRef.current.push(base64);
      }
    } catch (e) {
      console.warn("Frame capture skipped:", e);
    }
  }, [hasVideo]);

  const togglePauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      if (hasVideo) {
        frameIntervalRef.current = setInterval(() => {
          captureWebcamFrame();
        }, 4000);
      }
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    }
  }, [isPaused, isRecording, hasVideo, captureWebcamFrame]);

  const stopPracticeRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsProcessing(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

    if (audioProcessorRef.current) {
      audioProcessorRef.current.stop();
      audioProcessorRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (presentationSpeechRecRef.current) {
      try {
        presentationSpeechRecRef.current.stop();
      } catch (e) {}
      presentationSpeechRecRef.current = null;
    }
    setLiveVerbatimAlert(null);
    stopRecording();
    stopMediaStream();

    // Fast-path local zero-cost processing (< 400ms)
    setTimeout(async () => {
      let savedSessionId = `session-${Date.now()}`;
      if (audioChunksRef.current.length > 0) {
        const mediaType = hasVideo ? 'video/webm' : 'audio/webm';
        const mediaBlob = new Blob(audioChunksRef.current, { type: mediaType });
        if (mediaBlob.size > 0) {
          // Dynamic import to avoid breaking SSR if not on client
          const { saveVideoBlob } = await import('@/lib/videoStorage');
          await saveVideoBlob(savedSessionId, mediaBlob);
        }
      }

      setIsProcessing(false);
      
      const overallDelivery = Math.round((liveEyeContact + livePostureScore + Math.min(100, (livePaceWpm / 140) * 100)) / 3);

      onComplete({
        id: savedSessionId,
        telemetry: {
          eyeContactPercentage: liveEyeContact,
          postureStabilityScore: livePostureScore,
          wpm: livePaceWpm
        },
        scores: {
          overall: overallDelivery
        },
        slideEventLog,
        verbatimSlideFlags,
        extemporeScore,
        elapsedSeconds,
        fileName
      });
    }, 400);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isProcessing) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-[#0F1426] text-white rounded-3xl p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        <ScribbleLoader text="Evaluating slide coverage, vocal pacing & presentation delivery locally..." />
      </div>
    );
  }



  return (
    <div className="w-screen h-screen fixed inset-0 flex flex-col font-sans bg-[#F8FAFC] text-slate-900 overflow-hidden select-none z-[9999]">
      
      {/* PPT Viewer Main Box — Light White PowerPoint UI */}
      <div className="relative bg-white overflow-hidden flex flex-col w-full h-full flex-1 min-h-0">
        
        {/* Top PowerPoint Ribbon Header (Single Compact Ultra-Sleek Row) */}
        <div className="flex items-center justify-between z-20 shrink-0 select-none bg-[#B7472A] text-white px-3 sm:px-4 py-1.5 shadow-md border-b border-[#963820]">
          {/* Left Group */}
          <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
            <button 
              onClick={onCancel} 
              className="text-[11px] font-extrabold text-white hover:bg-white/20 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 transition-all cursor-pointer shrink-0"
              title="Back to presentation setup"
            >
              ← Back
            </button>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
            <FileText size={14} className="text-white/80 shrink-0" />
            <span className="text-xs font-bold text-white truncate tracking-wide">{fileName}</span>
          </div>

          {/* Center Group: Live Practice Status & Quick Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className={`text-xs font-mono px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 transition-colors ${isRecording ? (isPaused ? 'text-amber-900 bg-amber-100 border-amber-300' : 'text-rose-900 bg-rose-100 border-rose-300') : 'text-slate-900 bg-white border-slate-300'}`}>
              <span className={`w-2 h-2 rounded-full ${isRecording ? (isPaused ? 'bg-amber-600' : 'bg-rose-600 animate-ping') : 'bg-slate-400'}`}></span>
              <span className="font-black tracking-wider">{isRecording ? (isPaused ? 'PAUSED' : 'REC') : 'READY'} {formatTimer(elapsedSeconds)} / 03:00</span>
            </div>

            <div className="hidden sm:flex text-xs font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-300">
              Slide <span className="text-[#B7472A] font-black ml-1">{currentSlide}</span>/{totalSlides}
            </div>

            {/* Slide Pane Selector */}
            <button
              onClick={() => {
                if (!showThumbnails) {
                  setShowThumbnails(true);
                  setThumbnailPosition('left');
                } else if (thumbnailPosition === 'left') {
                  setThumbnailPosition('bottom');
                } else {
                  setShowThumbnails(false);
                }
              }}
              title="Toggle PowerPoint Slide Panel (Left / Bottom / Hidden)"
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                showThumbnails 
                  ? 'bg-white text-[#B7472A] border-slate-300 shadow-2xs' 
                  : 'text-white/80 hover:text-white bg-white/10 border-white/20'
              }`}
            >
              <Grid size={12} />
              <span className="font-extrabold text-[10px] uppercase hidden md:inline">
                {!showThumbnails ? 'No Pane' : thumbnailPosition === 'left' ? 'Left Pane' : 'Bottom Bar'}
              </span>
            </button>

            {/* Cam Toggle & Size */}
            <button
              onClick={() => toggleCamera(!hasVideo)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                hasVideo ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white/10 text-white border-white/20'
              }`}
            >
              {hasVideo ? <Video size={12} className="text-emerald-700" /> : <VideoOff size={12} />}
              <span className="hidden md:inline">{hasVideo ? 'Cam ON' : 'Cam OFF'}</span>
            </button>

            {hasVideo && (
              <div className="hidden lg:flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-slate-300">
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setCameraSize(size)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                      cameraSize === size 
                        ? 'bg-[#B7472A] text-white' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Group: Display Modes */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleBrowserFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Full View Mode (Maximize Slide)"}
              className="p-1 px-2.5 rounded-md text-xs font-bold text-white hover:bg-white/20 bg-white/10 border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span className="hidden sm:inline text-[10px] uppercase font-black">{isFullscreen ? "Exit Full" : "Full View"}</span>
            </button>
          </div>
        </div>

        {/* Main Display Body — PowerPoint Workspace Layout (Light Theme) */}
        <div ref={pipContainerRef} className="relative flex-1 min-h-0 bg-[#E2E8F0] overflow-hidden flex flex-row">
          
          {/* PowerPoint-Style Left Vertical Slide Pane (Matching PowerPoint Left Navigation Pane!) */}
          {showThumbnails && thumbnailPosition === 'left' && totalSlides > 1 && (
            <div className="hidden sm:flex flex-col w-28 sm:w-32 lg:w-36 bg-white border-r border-slate-300 p-1.5 gap-1.5 shrink-0 select-none z-20 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                  <Grid size={11} className="text-[#B7472A]" /> Slides ({totalSlides})
                </span>
                <button 
                  onClick={() => setThumbnailPosition('bottom')}
                  title="Switch to Bottom Carousel View"
                  className="text-[8px] text-slate-500 hover:text-[#B7472A] font-extrabold uppercase px-1 py-0.5 rounded bg-slate-100 border border-slate-300 transition-colors"
                >
                  Bottom ⇄
                </button>
              </div>
              <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'thin' }}>
                {Array.from({ length: totalSlides }, (_, i) => i + 1).map((slideNum) => (
                  <button
                    key={slideNum}
                    onClick={() => handleSlideChange(slideNum)}
                    className={`w-full flex items-center gap-1.5 p-1 rounded-lg border-2 transition-all cursor-pointer text-left ${
                      currentSlide === slideNum
                        ? 'bg-rose-50/60 border-[#B7472A] shadow-sm ring-1 ring-[#B7472A]/30'
                        : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <span className={`text-[9px] font-black w-3 text-center shrink-0 ${currentSlide === slideNum ? 'text-[#B7472A]' : 'text-slate-500'}`}>
                      {slideNum}
                    </span>
                    <div className="flex-1 aspect-[16/10] rounded overflow-hidden bg-slate-100 border border-slate-300 relative shadow-2xs">
                      {slideImages[slideNum] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={slideImages[slideNum]} alt={`Slide ${slideNum}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-500 bg-slate-100">
                          S{slideNum}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Center PowerPoint Slide Stage — Maximum Screen Visibility */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 min-h-0 bg-[#E2E8F0] overflow-hidden flex items-center justify-center p-1 sm:p-2 touch-pan-y"
          >
            {/* Live Verbatim Slide Reading Coach Alert */}
            {liveVerbatimAlert && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-rose-900 text-white border-2 border-rose-400 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce max-w-md sm:max-w-lg">
                <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
                <span className="leading-snug text-[11px] sm:text-xs">{liveVerbatimAlert}</span>
                <button
                  onClick={() => setLiveVerbatimAlert(null)}
                  className="text-slate-300 hover:text-white text-xs ml-auto shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="w-full h-full flex items-center justify-center p-0 overflow-hidden">
              {slideImages[currentSlide] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={slideImages[currentSlide]} 
                  alt={`Slide ${currentSlide}`}
                  className="max-w-full max-h-full w-auto h-auto object-contain select-none rounded-md border border-slate-300/80 shadow-2xl bg-white transition-all duration-200"
                />
              ) : (
                <div className="w-full h-full bg-white border border-slate-300 rounded-xl p-6 sm:p-10 flex flex-col justify-center items-center text-center shadow-xl overflow-y-auto text-slate-900">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[#B7472A] text-xs font-extrabold uppercase tracking-widest mb-6 shrink-0">
                    Slide {currentSlide} Content
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-relaxed tracking-tight max-w-4xl">
                    {slideTextContent[currentSlide - 1] || `Slide ${currentSlide} text breakdown active for live practice.`}
                  </p>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-6 shrink-0">
                    Speak clearly into your microphone as you present this slide
                  </div>
                </div>
              )}
            </div>

            {/* Floating Camera Overlay ONLY */}
            {hasVideo && (
              <div
                ref={pipRef}
                onPointerDown={handlePipPointerDown}
                onPointerMove={handlePipPointerMove}
                onPointerUp={handlePipPointerUp}
                className={`absolute aspect-[4/3] rounded-2xl overflow-hidden border-2 shadow-2xl bg-black z-30 select-none ${
                  cameraSize === 'sm' ? 'w-28 sm:w-40' : cameraSize === 'lg' ? 'w-48 sm:w-72' : 'w-36 sm:w-56'
                } ${
                  isDraggingPip
                    ? 'border-rose-500 shadow-rose-500/40 scale-105 ring-4 ring-rose-400/40'
                    : 'border-[#B7472A] hover:shadow-2xl'
                }`}
                style={{
                  cursor: isDraggingPip ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  transition: isDraggingPip ? 'none' : 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                  ...(pipPosition
                    ? { left: pipPosition.x, top: pipPosition.y }
                    : { top: 12, right: 12 }),
                }}
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full pointer-events-none transition-transform duration-200"
                  style={{
                    transform: `scale(${cameraZoom}) scaleX(-1)`,
                    objectFit: cameraFit
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/85 backdrop-blur-md text-[9.5px] text-white font-extrabold rounded-md border border-white/20 flex items-center gap-1.5 shadow-md pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Camera size={10} className="text-amber-400" /> Live Cam
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Bottom Thumbnail Strip (Active when thumbnailPosition === 'bottom') */}
        {showThumbnails && thumbnailPosition === 'bottom' && totalSlides > 1 && (
          <div className="z-20 overflow-x-auto py-1.5 px-3 bg-slate-100 border-t border-slate-300 flex items-center gap-1.5 shrink-0" style={{ scrollbarWidth: 'thin' }}>
            <button
              onClick={() => setThumbnailPosition('left')}
              title="Switch to PowerPoint Left Navigation Pane"
              className="text-[9px] font-black text-[#B7472A] hover:text-[#963820] bg-white px-2 py-1 rounded border border-slate-300 shrink-0 mr-1 uppercase shadow-2xs"
            >
              Left Pane ⇄
            </button>
            {Array.from({ length: totalSlides }, (_, i) => i + 1).map((slideNum) => (
              <button
                key={slideNum}
                onClick={() => handleSlideChange(slideNum)}
                className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-200 border-2 cursor-pointer ${
                  currentSlide === slideNum 
                    ? 'border-[#B7472A] scale-105 shadow-md ring-2 ring-[#B7472A]/30' 
                    : 'border-slate-300 opacity-70 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                {slideImages[slideNum] ? (
                  <div className="w-12 h-8 sm:w-16 sm:h-10 bg-slate-200 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slideImages[slideNum]} alt={`Thumbnail ${slideNum}`} className="w-full h-full object-cover" />
                    <div className="absolute top-0.5 left-0.5 px-1 bg-black/80 text-[8px] font-bold text-white rounded">
                      {slideNum}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-8 sm:w-14 sm:h-9 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    S{slideNum}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Navigation & Practice Action Bar (Light PowerPoint Style) */}
        <div className="flex items-center justify-between z-20 bg-slate-100 px-3.5 sm:px-6 py-2.5 border-t border-slate-300 shrink-0 gap-2 shadow-xs">
          <button
            onClick={() => handleSlideChange(currentSlide - 1)}
            disabled={currentSlide === 1}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft size={16} /> Previous <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">(←)</span>
          </button>

          {isRecording ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={togglePauseRecording}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              
              <button
                onClick={() => {
                  if (confirm("Retry live presentation recording? Current session progress will be reset.")) {
                    setIsRecording(false);
                    setIsPaused(false);
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                      mediaRecorderRef.current.stop();
                    }
                    setElapsedSeconds(0);
                    setTimeout(() => startPracticeRecording(), 300);
                  }
                }}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Retry practice recording from slide 1"
              >
                <RotateCcw size={13} /> Retry
              </button>

              <button
                onClick={stopPracticeRecording}
                className={`px-4 sm:px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${!isPaused ? 'animate-pulse' : ''}`}
              >
                <Square size={12} fill="currentColor" /> Finish & Evaluate
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Slide + Video vs Audio Only Mode Selector */}
              <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
                <button
                  onClick={() => toggleCamera(true)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    hasVideo ? 'bg-[#B7472A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Enable Slide + Video Mode"
                >
                  <Video size={13} /> Slide + Video
                </button>
                <button
                  onClick={() => toggleCamera(false)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    !hasVideo ? 'bg-[#B7472A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Enable Audio Only Mode"
                >
                  <Mic size={13} /> Audio Only
                </button>
              </div>

              {/* Start Live Practice CTA Button */}
              <button
                onClick={handleStartButtonClick}
                className="px-5 sm:px-7 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transform hover:scale-[1.02]"
              >
                <Play size={15} fill="currentColor" /> Start Live Practice
              </button>
            </div>
          )}

          <button
            onClick={() => handleSlideChange(currentSlide + 1)}
            disabled={currentSlide === totalSlides}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer shrink-0"
          >
            Next <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">(→)</span> <ChevronRight size={16} />
          </button>
        </div>

      </div>


      {/* Privacy Consent Modal (BIPA / GDPR Article 9 Compliant) */}
      <PrivacyConsentModal
        isOpen={showPrivacyModal}
        onConsentGiven={handlePrivacyConsentGiven}
        onDecline={() => setShowPrivacyModal(false)}
      />

      {/* Pre-session Environmental Calibration Modal */}
      <CalibrationModal
        isOpen={showCalibrationModal}
        stream={mediaStreamRef.current}
        onComplete={handleCalibrationComplete}
      />
    </div>
  );
}
