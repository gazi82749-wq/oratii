'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getHistory, fetchCloudHistory } from '@/lib/storage';
import { getVideoBlob } from '@/lib/videoStorage';
import { Video, Camera, RotateCcw, Check, FileText } from 'lucide-react';
import ConfidenceGraph, { ScoreRing } from '@/components/ConfidenceGraph';
import VivaDefenseModal from '@/components/VivaDefenseModal';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  useEffect(() => {
    async function loadReport() {
      // 1. Try local history first
      const localHistory = getHistory();
      let found = localHistory.find((s: any) => s.id === id);

      // 2. If not found locally, fetch from Supabase
      if (!found) {
        const cloudHistory = await fetchCloudHistory('all');
        if (cloudHistory) {
          found = cloudHistory.find((s: any) => s.id === id);
        }
      }

      if (found) {
        setSessionData(found);
      }
      setLoading(false);
    }
    loadReport();
  }, [id]);

  useEffect(() => {
    // Attempt to load video blob from IndexedDB (local storage for videos)
    let activeUrl: string | null = null;
    getVideoBlob(id).then(blob => {
      if (blob) {
        activeUrl = URL.createObjectURL(blob);
        setVideoUrl(activeUrl);
      }
    });
    return () => {
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [id]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Return to Dashboard</button>
      </div>
    );
  }

  // Extract presentation / session specific data
  const {
    type = 'presentation',
    telemetry = {},
    slideEventLog = [],
    verbatimSlideFlags = [],
    extemporeScore = 100,
    elapsedSeconds = 0,
    fileName = 'Presentation Deck',
    topic = 'Viva Defense',
    roleTitle = 'Mock Interview',
    difficultyLevel = 'fresher',
    scores = {},
    strengths = [],
    weaknesses = [],
    suggestions = [],
    whatToCut = [],
    modelAnswer = '',
    transcript = '',
    chatHistory = [],
    wpm = 0,
    totalFillers = 0,
    topFillers = [],
    cefrBand = 'B2',
    cefrTitle = 'Vantage / Upper Intermediate',
    ieltsBand = '6.5 - 7.0',
    ieltsDescriptor = 'Good Operational User',
    duration = 0,
    paceData = []
  } = sessionData;

  const liveEyeContact = telemetry.eyeContactPercentage || 0;
  const livePostureScore = telemetry.postureStabilityScore || 0;
  const livePaceWpm = telemetry.wpm || wpm || 0;
  const overallDelivery = sessionData.scores?.overall || scores.overall || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 font-sans text-slate-900">
      <div className="w-full max-w-5xl mx-auto p-5 sm:p-8 bg-[#0F1426] text-white rounded-3xl border border-slate-800 shadow-2xl space-y-6 animate-fade-in">
        
        {/* Universal Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 
              {type === 'presentation' && '100% On-Device Edge Processing • Zero API Cost'}
              {type === 'speech' && 'Speech Clarity & Vocal Modulation Analysis'}
              {type === 'viva' && 'AI Academic Committee Defense Evaluation'}
              {type === 'interview' && 'Mock Interview & STAR Method Audit'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              {type === 'presentation' && <><Video size={26} className="text-amber-400" /> Live Practice Performance Results</>}
              {type === 'speech' && <><Video size={26} className="text-amber-400" /> Speech Coaching Analysis Report</>}
              {type === 'viva' && <><FileText size={26} className="text-indigo-400" /> Viva Voce Defense Report</>}
              {type === 'interview' && <><FileText size={26} className="text-emerald-400" /> Mock Interview Evaluation Report</>}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              {type === 'presentation' && <>Local video preview & AI delivery telemetry for <strong>{fileName}</strong></>}
              {type === 'speech' && <>Pacing, filler count, CEFR/IELTS benchmark & feedback for <strong>{fileName || 'Speech Session'}</strong></>}
              {type === 'viva' && <>Academic examiner committee Q&A evaluation for <strong>{topic}</strong></>}
              {type === 'interview' && <>STAR method evaluation & domain benchmarking for <strong>{roleTitle}</strong></>}
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer shrink-0"
          >
            ← Return to Dashboard
          </button>
        </div>

        {/* Video Preview (if recorded/uploaded for Presentation or Speech) */}
        {videoUrl && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span className="flex items-center gap-2 text-indigo-400 uppercase tracking-wider text-[11px] font-black">
                <Camera size={14} /> Recorded Video Preview (Processed Locally)
              </span>
              {elapsedSeconds > 0 && <span>Duration: {formatTimer(elapsedSeconds)}</span>}
            </div>
            <video controls src={videoUrl} className="w-full max-h-[360px] rounded-xl bg-black object-contain border border-slate-800/80 shadow-inner" />
          </div>
        )}

        {/* --- PRESENTATION MODULE SPECIFIC METRICS --- */}
        {type === 'presentation' && (
          <>
            {/* Circular Score Ring Gauge Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#151930] p-5 rounded-2xl border border-slate-800/80 shadow-md">
              <ScoreRing 
                value={overallDelivery} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#6c5ce7" 
                label="Delivery Grade" 
                unit="%" 
              />
              <ScoreRing 
                value={extemporeScore} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#10b981" 
                label="Extempore (Indep.)" 
                unit="%" 
              />
              <ScoreRing 
                value={Math.round(liveEyeContact)} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#00cec9" 
                label="Eye Contact" 
                unit="%" 
              />
              <ScoreRing 
                value={Math.round(livePostureScore)} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#fd79a8" 
                label="Posture Score" 
                unit="%" 
              />
              <ScoreRing 
                value={livePaceWpm} 
                max={200} 
                size={76} 
                strokeWidth={8} 
                color="#f2a93b" 
                label="Pacing Speed" 
                unit="WPM" 
              />
            </div>

            {/* Human Coach Verbatim Slide Reading Audit */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-3 text-left shadow-sm animate-fade-in ${
              verbatimSlideFlags.length === 0
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    verbatimSlideFlags.length === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {verbatimSlideFlags.length === 0 ? '✓' : '⚠️'}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      Verbatim Slide Reading Audit & Debrief
                    </h4>
                    <p className="text-[11px] text-slate-300 font-medium">
                      {verbatimSlideFlags.length === 0 
                        ? 'Elite Executive Delivery • Zero verbatim slide reading detected' 
                        : `Verbatim reading flagged on ${verbatimSlideFlags.length} slide(s)`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400">
                  {extemporeScore}% Independence
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-200">
                {verbatimSlideFlags.length === 0 ? (
                  'Outstanding delivery! You explained slide takeaways conversationally rather than reading bullets word-for-word. Real executive audiences value presenters who elaborate on the "Why" and maintain personal presence.'
                ) : (
                  `High word-for-word text overlap was detected on Slide(s): ${verbatimSlideFlags.map((f: any) => f.slide).join(', ')}. Remember: Audiences can read slides faster than you can speak. Use slides for diagrams, numbers, and anchors; use your voice to provide insights and context.`
                )}
              </p>
            </div>

            {/* Interactive Delivery & Pacing Wave Timeline */}
            <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Practice Delivery & Pacing Wave</span>
                  <p className="text-[11px] text-indigo-400 font-medium">Realtime edge telemetry recorded during live slide transitions</p>
                </div>
                <span className="text-xs font-bold text-slate-400">{slideEventLog.length} Slide Transitions</span>
              </div>
              <ConfidenceGraph 
                data={slideEventLog.length > 0 ? slideEventLog.map((log: any) => ({
                  timestamp: log.timestamp,
                  wpm: log.wpm || 135,
                  confidence: log.confidence || 85
                })) : [
                  { timestamp: 0, wpm: 120 },
                  { timestamp: 15, wpm: 138 },
                  { timestamp: 30, wpm: 142 },
                  { timestamp: 45, wpm: 130 }
                ]} 
                events={[]} 
                type="area" 
                dataKey="wpm" 
                label="Delivery Speed" 
                color="#6c5ce7" 
                height={170}
              />
            </div>

            {/* Slide Event & Timing Log Cards */}
            {slideEventLog.length > 0 && (
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <span>⏱️ Slide-by-Slide Timing Breakdown</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slideEventLog.map((log: any, idx: number) => (
                    <div key={idx} className="bg-[#0B0E27] border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-extrabold flex items-center justify-center text-[10px]">
                          S{log.slideNumber}
                        </span>
                        <span className="font-bold text-slate-200">Slide {log.slideNumber} Covered</span>
                      </div>
                      <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        ⏱ {log.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- SPEECH COACH SPECIFIC METRICS --- */}
        {type === 'speech' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#151930] p-5 rounded-2xl border border-slate-800/80 shadow-md">
              <ScoreRing 
                value={overallDelivery} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#6c5ce7" 
                label="Overall Score" 
                unit="%" 
              />
              <ScoreRing 
                value={livePaceWpm} 
                max={200} 
                size={76} 
                strokeWidth={8} 
                color="#f2a93b" 
                label="Speaking Pace" 
                unit="WPM" 
              />
              <ScoreRing 
                value={totalFillers} 
                max={20} 
                size={76} 
                strokeWidth={8} 
                color="#e17055" 
                label="Filler Words" 
                unit=" words" 
              />
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">CEFR / IELTS Band</span>
                <span className="text-xl font-black text-emerald-400">{cefrBand}</span>
                <span className="text-[11px] font-semibold text-slate-300">IELTS {ieltsBand}</span>
              </div>
            </div>

            {/* Academic CEFR / IELTS Descriptor Banner */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200 text-left space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <span>Academic Benchmark: CEFR {cefrBand} — {cefrTitle}</span>
                <span className="bg-indigo-900/60 px-2.5 py-0.5 rounded text-amber-400 font-mono">IELTS Band {ieltsBand}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {ieltsDescriptor}. Speech clarity, pacing ({livePaceWpm} WPM), and vocal fillers ({totalFillers} count) were analyzed against standardized rubrics.
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            {(strengths.length > 0 || weaknesses.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {strengths.length > 0 && (
                  <div className="bg-[#151930] border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✓ Key Speech Strengths</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                      {strengths.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div className="bg-[#151930] border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚠️ Delivery Areas for Improvement</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                      {weaknesses.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Transcript Box */}
            {transcript && (
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 text-left space-y-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Analyzed Audio Transcript</h4>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-h-48 overflow-y-auto">
                  {transcript}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- VIVA DEFENSE SPECIFIC METRICS --- */}
        {type === 'viva' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#151930] p-5 rounded-2xl border border-slate-800/80 shadow-md">
              <ScoreRing 
                value={overallDelivery} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#6c5ce7" 
                label="Overall Defense" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.accuracy || 84} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#10b981" 
                label="Domain Accuracy" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.reasoning || 82} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#00cec9" 
                label="Logic & Reasoning" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.clarity || scores.confidence || 85} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#f2a93b" 
                label="Clarity & Comms" 
                unit="%" 
              />
            </div>

            {/* Committee Examination Log */}
            {chatHistory.length > 0 && (
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 text-left space-y-4">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Examiner Committee Q&amp;A Log</h4>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {chatHistory.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2 text-xs">
                      {item.question && (
                        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">Examiner Question</span>
                          <p className="text-slate-200 font-bold">{item.question}</p>
                        </div>
                      )}
                      {item.text && (
                        <div className="bg-indigo-950/60 border border-indigo-900/60 p-3.5 rounded-xl ml-4">
                          <span className="text-[10px] font-black uppercase text-indigo-300 block mb-1">Your Candidate Answer</span>
                          <p className="text-slate-200 font-medium">{item.text}</p>
                        </div>
                      )}
                      {item.feedback && (
                        <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl ml-4 text-emerald-200 font-medium">
                          <span className="text-[10px] font-black uppercase text-emerald-400 block mb-0.5">Panel Evaluation</span>
                          <p>{item.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- MOCK INTERVIEW SPECIFIC METRICS --- */}
        {type === 'interview' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#151930] p-5 rounded-2xl border border-slate-800/80 shadow-md">
              <ScoreRing 
                value={overallDelivery} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#6c5ce7" 
                label="Overall Rating" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.technical || 85} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#10b981" 
                label="Technical Depth" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.communication || 88} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#00cec9" 
                label="Communication" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.starAlignment || 80} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#fd79a8" 
                label="STAR Method" 
                unit="%" 
              />
              <ScoreRing 
                value={scores.relevance || 90} 
                max={100} 
                size={76} 
                strokeWidth={8} 
                color="#f2a93b" 
                label="Role Relevance" 
                unit="%" 
              />
            </div>

            {/* Strengths & Weaknesses */}
            {(strengths.length > 0 || weaknesses.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {strengths.length > 0 && (
                  <div className="bg-[#151930] border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">✓ Interview Strengths</h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                      {strengths.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div className="bg-[#151930] border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">⚠️ Key Improvement Areas</h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                      {weaknesses.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Model Answer Benchmark */}
            {modelAnswer && (
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 text-left space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">AI Benchmark Answer (How an Elite Candidate Responds)</h4>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {modelAnswer}
                </div>
              </div>
            )}

            {/* Interview Q&A Transcript */}
            {chatHistory.length > 0 && (
              <div className="bg-[#151930] border border-slate-800 rounded-2xl p-5 text-left space-y-4">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Mock Interview Q&amp;A Transcript</h4>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {chatHistory.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2 text-xs">
                      {item.question && (
                        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-indigo-400 block mb-1">Interviewer Question</span>
                          <p className="text-slate-200 font-bold">{item.question}</p>
                        </div>
                      )}
                      {item.text && (
                        <div className="bg-indigo-950/60 border border-indigo-900/60 p-3.5 rounded-xl ml-4">
                          <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">Your Answer</span>
                          <p className="text-slate-200 font-medium">{item.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              if (type === 'presentation') router.push('/presentation?mode=practice');
              else if (type === 'speech') router.push('/speech-coach');
              else if (type === 'viva') router.push('/presentation');
              else router.push('/interview');
            }}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Re-Take Practice Session
          </button>
          <button
            onClick={() => setIsVivaModalOpen(true)}
            className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Take Viva Defense
          </button>
        </div>
      </div>

      <VivaDefenseModal 
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        presentationTitle={fileName || topic || roleTitle}
        contextSummary={'See full report for context.'}
      />
    </div>
  );
}

