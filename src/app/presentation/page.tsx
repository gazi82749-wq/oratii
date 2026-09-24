'use client';

import { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { saveSession } from '../../lib/storage';
import XPToast from '../../components/XPToast';
import { playSound } from '../../lib/playSound';
import { convertPresentation } from '../../lib/presentationConverter';
import TrialSignupPrompt from '../../components/TrialSignupPrompt';
import PresentationPractice from '../../components/PresentationPractice';
import GuestAuthModal from '../../components/GuestAuthModal';
import { supabase } from '../../lib/supabaseClient';
import { Video, AlertCircle, FileText, X, CheckCircle2 } from 'lucide-react';

function PresentationPracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});
  const [extractedSlideTexts, setExtractedSlideTexts] = useState<string[]>([]);
  const [isPresentationReady, setIsPresentationReady] = useState(false);
  
  const [xpEvents, setXpEvents] = useState([]);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);

  // Auto-activate practice mode if ?mode=practice query param is present
  useEffect(() => {
    if (searchParams?.get('mode') === 'practice') {
      setIsPracticeMode(true);
    }
  }, [searchParams]);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('oratii_presentation_practice_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.fileName) setFile({ name: parsed.fileName } as any);
        if (parsed.slideImages) {
          setSlideImages(parsed.slideImages);
          setIsPresentationReady(true);
        }
        if (parsed.extractedSlideTexts) setExtractedSlideTexts(parsed.extractedSlideTexts);
      }
    } catch (e) {
      console.error('Failed to restore presentation state', e);
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (!isPresentationReady && !file) return;
    try {
      const stateToSave = {
        fileName: file ? file.name : null,
        extractedSlideTexts,
        ...(Object.keys(slideImages).length > 0 && { slideImages })
      };
      sessionStorage.setItem('oratii_presentation_practice_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not save slideImages to sessionStorage (QuotaExceeded): Keeping in memory.');
    }
  }, [file, isPresentationReady, slideImages, extractedSlideTexts]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsPresentationReady(false);
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

  const processPresentation = async () => {
    playSound('click');
    if (!file) return;

    setIsLoading(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();

    const authHeaders: Record<string, string> = {};
    if (session?.access_token) {
      authHeaders['Authorization'] = `Bearer ${session.access_token}`;
    }
    if (session?.user?.id) {
      authHeaders['x-user-id'] = session.user.id;
    }

    const textExtractionPromise = (async () => {
      try {
        const initRes = await fetch('/api/presentations/upload-init', {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size })
        }).then(r => r.json());

        if (initRes.error) return { status: 'error', error: initRes.error };

        await fetch(initRes.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        const processRes = await fetch('/api/presentations/process', {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: initRes.path, presentationId: initRes.presentationId })
        }).then(r => r.json());

        if (processRes.error) return { status: 'error', error: processRes.error };

        if (processRes.status === 'completed' && processRes.slideTextContent) {
          return { 
            status: 'success', 
            slideTextContent: processRes.slideTextContent, 
            fileBase64: processRes.fileBase64, 
            isPdf: processRes.isPdf 
          };
        }
        
        return { status: 'error', error: 'Processing failed silently.' };
      } catch (e: any) {
        return { status: 'error', error: e.message } as any;
      }
    })() as Promise<any>;

    // 2. Client-side image rendering (PDF.js)
    const imageRenderingPromise = file.type?.startsWith('video/')
      ? Promise.resolve(null)
      : convertPresentation(file).catch(err => {
          console.warn("Client image extraction notice in processPresentation:", err);
          return null;
        });

    Promise.all([textExtractionPromise, imageRenderingPromise])
      .then(([textData, convertedSlides]) => {
        let finalTexts: string[] = [];
        
        if (convertedSlides && Array.isArray(convertedSlides)) {
          const imagesMap: Record<number, string> = {};
          convertedSlides.forEach((s: any) => { 
            imagesMap[s.slideNumber] = s.image; 
            finalTexts.push(s.text); // Client fallback text
          });
          setSlideImages(prev => ({ ...prev, ...imagesMap }));
        }
        
        // Override with server extracted text if successful (better for notes)
        if (textData?.status === 'success' && textData.slideTextContent) {
           finalTexts = textData.slideTextContent;
        } else if (textData?.authRequired) {
           setIsGuestAuthModalOpen(true);
           setIsLoading(false);
           return;
        } else if (textData?.error) {
           console.warn("Server text extraction notice:", textData.error);
        }

        if (finalTexts.length > 0) {
          setExtractedSlideTexts(finalTexts);
        }

        setIsPresentationReady(true);
      })
      .catch(err => {
        console.error('Presentation processing error:', err);
        setError('Error processing presentation. Please ensure it is a valid PPT or PDF file.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleTryAgain = () => {
    setIsPresentationReady(false);
    setFile(null);
    setError(null);
    setSlideImages({});
    setExtractedSlideTexts([]);
    sessionStorage.removeItem('oratii_presentation_practice_state');
  };

  return (
    <>
      {/* Fullscreen Practice Mode Overlay */}
      {isPracticeMode && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] overflow-hidden w-screen h-screen">
          <PresentationPractice 
            fileName={file?.name || 'Presentation Deck'}
            slideImages={slideImages}
            slideTextContent={extractedSlideTexts}
            onCancel={() => setIsPracticeMode(false)}
            onComplete={(analysisData: any) => {
              // 1. Close practice mode overlay
              setIsPracticeMode(false);
              
              // 2. Save session to local storage & Supabase DB via storage lib
              const sessionRecord = saveSession('presentation', {
                id: analysisData.id,
                fileName: file?.name || 'Presentation Deck',
                scores: analysisData.scores,
                telemetry: analysisData.telemetry,
                slideEventLog: analysisData.slideEventLog,
                verbatimSlideFlags: analysisData.verbatimSlideFlags,
                extemporeScore: analysisData.extemporeScore,
                elapsedSeconds: analysisData.elapsedSeconds
              });

              // 3. Standard Navigation to the dedicated reports URL!
              router.push(`/reports/${sessionRecord.id}`);
            }}
          />
        </div>,
        document.body
      )}

    <div className="w-full flex flex-col gap-8 animate-fade-in text-slate-900 relative">
      <div className="mb-4 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> Presentation Module
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-2.5">
          <Video size={28} className="text-[#F2A93B]" /> Presentation Practice
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-normal max-w-xl">
          Upload your PowerPoint (PPTX) or PDF deck. Present your slides while our AI analyzes your speech clarity, pacing, and body language.
        </p>
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
          <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse" />
              <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-100">Processing Presentation</h3>
              <p className="text-sm font-bold text-indigo-300 animate-pulse tracking-wide uppercase">Extracting slides and preparing AI telemetry...</p>
            </div>
          </div>
        ) : isPresentationReady ? (
          <div className="w-full max-w-xl mx-auto relative z-10 flex flex-col items-center animate-fade-in">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={40} />
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 text-center">Presentation Ready</h2>
             <p className="text-slate-600 font-medium mb-8 text-center px-4">
                &quot;{file?.name}&quot; has been processed and is ready for practice.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => setIsPracticeMode(true)}
                  className="flex-1 py-4 px-6 rounded-xl text-base font-black bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#151930] shadow-xl shadow-amber-500/20 transition-all text-center cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Video size={20} /> Start Presentation Practice →
                </button>
             </div>
             
             <button onClick={handleTryAgain} className="mt-6 text-sm text-slate-500 font-bold hover:text-slate-800 transition-colors cursor-pointer">
                Upload a different file
             </button>
          </div>
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
              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <FileText size={30} />
              </div>
              <p className="text-xl font-extrabold text-white text-center mb-2 group-hover:-translate-y-0.5 transition-transform">
                {file ? file.name : 'Drag & drop your presentation deck'}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400">or click to browse PowerPoint or PDF</p>
            </div>

            {file && (
              <div className="mt-8 border-t border-dashed border-slate-200 pt-6 flex justify-center">
                <button 
                  onClick={processPresentation}
                  className="w-full py-4 px-6 rounded-xl text-base font-extrabold bg-[#151930] hover:bg-[#0B0E27] text-white shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  Process Presentation
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <XPToast events={xpEvents} onComplete={() => setXpEvents([])} />
      <TrialSignupPrompt isOpen={showTrialPrompt} onClose={() => setShowTrialPrompt(false)} />
      <GuestAuthModal isOpen={isGuestAuthModalOpen} onClose={() => setIsGuestAuthModalOpen(false)} featureName="Presentation Practice" />
    </div>
    </>
  );
}

export default function PresentationPracticePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading Presentation Practice...</p>
      </div>
    }>
      <PresentationPracticeContent />
    </Suspense>
  );
}

