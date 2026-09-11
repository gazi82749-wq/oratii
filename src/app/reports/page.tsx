'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHistory, fetchCloudHistory } from '../../lib/storage';
import { getVideoBlob } from '../../lib/videoStorage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Cloud, CloudOff, TrendingUp, FileText, Mic, BarChart3, GraduationCap, Briefcase, Scale, ClipboardList, Inbox, HardDrive, Share2, Check } from 'lucide-react';
import Footer from '@/components/Footer';

const VideoPlayer = ({ sessionId }: { sessionId: string }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;
    getVideoBlob(sessionId).then(blob => {
      if (blob) {
        activeUrl = URL.createObjectURL(blob);
        setVideoUrl(activeUrl);
      }
    });
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [sessionId]);

  if (!videoUrl) return null;

  return (
    <div className="mt-6 border-t border-indigo-200 pt-5 w-full print:hidden">
      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Session Recording</h4>
      <div className="w-full md:w-2/3 lg:w-1/2 aspect-video bg-indigo-100 border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
        <video src={videoUrl} controls className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default function Reports() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); 
  const [loaded, setLoaded] = useState(false);
  const [exportingSessionId, setExportingSessionId] = useState<string | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  const handleShare = (session: any) => {
    const score = session.scores?.overall ?? session.score ?? 85;
    const wpm = session.metrics?.wpm ?? 140;
    const fillers = session.metrics?.fillers ?? 2;
    const shareUrl = `${window.location.origin}/share/${session.id || 'demo'}?score=${score}&wpm=${wpm}&fillers=${fillers}&type=${session.type || 'speech'}&title=${encodeURIComponent(getModuleName(session.type) + ' Practice')}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      // Fetch from Supabase cloud first for authenticated users
      const cloudSessions = await fetchCloudHistory();
      if (cloudSessions && cloudSessions.length > 0) {
        setHistory(cloudSessions);
        setIsCloudSynced(true);
      } else {
        // Fallback to browser local storage
        const localData = getHistory();
        setHistory(localData);
        setIsCloudSynced(false);
      }
      setLoaded(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (exportingSessionId) {
      const generatePDF = async () => {
        try {
          const { jsPDF } = await import('jspdf');
          const html2canvas = (await import('html2canvas')).default;

          // Wait a moment for React to render the hidden template
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const element = document.getElementById('pdf-template-active');
          if (!element) return;
          
          const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            windowWidth: 800
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          let position = 0;
          let heightLeft = pdfHeight;
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
          }
          
          pdf.save(`Oratii-Analysis-${exportingSessionId}.pdf`);
        } catch (err) {
          console.error('Failed to export Detailed PDF:', err);
          alert('Error generating PDF. Please try again.');
        } finally {
          setExportingSessionId(null);
        }
      };
      
      generatePDF();
    }
  }, [exportingSessionId]);

  const filteredHistory = filter === 'all' ? history : history.filter(h => h.type === filter);

  const renderModuleIcon = (type: string) => {
    switch (type) {
      case 'speech': return <Mic size={24} className="text-emerald-600" />;
      case 'presentation': return <BarChart3 size={24} className="text-blue-600" />;
      case 'viva': return <GraduationCap size={24} className="text-rose-600" />;
      case 'interview': return <Briefcase size={24} className="text-amber-600" />;
      case 'jury': return <Scale size={24} className="text-orange-600" />;
      default: return <ClipboardList size={24} className="text-slate-600" />;
    }
  };

  const getModuleName = (type: string) => {
    switch (type) {
      case 'speech': return 'Speech Coach';
      case 'presentation': return 'Slide Analyzer';
      case 'viva': return 'AI Viva';
      case 'interview': return 'Interview Sim';
      case 'jury': return 'Jury Panel';
      default: return String(type).replace('-', ' ');
    }
  };

  const totalSessions = history.length;
  const moduleCounts = history.reduce((acc: any, curr: any) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const activeSession = history.find(h => h.id === exportingSessionId);

  // Prepare chart data (oldest to newest)
  const chartData = filteredHistory
    .slice()
    .reverse()
    .map((session, idx) => {
      const d = new Date(session.timestamp);
      const dateStr = isNaN(d.getTime()) 
        ? `Session ${idx + 1}` 
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const score = session.scores?.overall ?? session.score ?? 0;
      return {
        date: dateStr,
        fullDate: isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString(),
        score: Number(score),
        type: getModuleName(session.type)
      };
    });

  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent text-slate-900">
      <div className={`w-full max-w-5xl mx-auto flex-1 flex flex-col gap-8 text-slate-900 transition-opacity duration-500 pt-6 pb-16 px-4 sm:px-6 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Hidden Detailed PDF Template */}
      {activeSession && (
        <div className="absolute top-[-9999px] left-[-9999px] z-[-1]">
          <div id="pdf-template-active" className="w-[800px] bg-white p-12 text-slate-900 border border-slate-300 font-sans flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Oratii AI Executive Report</span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Detailed Analysis</h1>
              </div>
              <span className="text-xs font-bold text-slate-500">{new Date(activeSession.timestamp).toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-end bg-[#0F1426] text-white p-6 rounded-2xl">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{getModuleName(activeSession.type)}</p>
                <p className="text-lg font-bold mt-1 text-white">Topic: {activeSession.topic || 'Practice Session'}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(activeSession.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-[#F2A93B]">Overall Score</p>
                <p className="text-5xl font-extrabold text-white">{activeSession.scores?.overall || 0}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(activeSession.scores || {})
                .filter(([k, v]) => k !== 'overall' && v !== 'N/A' && v !== undefined && v !== null)
                .map(([key, val]) => (
                  <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{String(val)}</p>
                  </div>
                ))}
            </div>

            {/* AI Insights Section */}
            {(activeSession.strengths?.length > 0 || activeSession.weaknesses?.length > 0 || activeSession.feedback) && (
              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">AI Qualitative Insights</h2>
                
                <div className="grid grid-cols-2 gap-5">
                  {activeSession.strengths && activeSession.strengths.length > 0 && (
                    <div className="bg-emerald-50/60 p-5 border border-emerald-200 rounded-xl">
                      <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">Strengths</h3>
                      <ul className="list-disc pl-4 text-emerald-950 font-medium text-sm space-y-1.5">
                        {activeSession.strengths.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {activeSession.weaknesses && activeSession.weaknesses.length > 0 && (
                    <div className="bg-rose-50/60 p-5 border border-rose-200 rounded-xl">
                      <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3">Areas for Improvement</h3>
                      <ul className="list-disc pl-4 text-rose-950 font-medium text-sm space-y-1.5">
                        {activeSession.weaknesses.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {activeSession.suggestions && activeSession.suggestions.length > 0 && (
                  <div className="mt-5 bg-amber-50/60 p-5 border border-amber-200 rounded-xl">
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">Actionable Suggestions</h3>
                    <ul className="list-disc pl-4 text-amber-950 font-medium text-sm space-y-1.5">
                      {activeSession.suggestions.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {activeSession.feedback && (
                  <div className="mt-5 bg-slate-50 p-5 border border-slate-200 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Coach Feedback</h3>
                    <p className="text-slate-800 font-medium leading-relaxed text-sm">{activeSession.feedback}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Transcript Section */}
            {activeSession.transcript && (
              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-extrabold text-slate-900 mb-4">Full Transcription</h2>
                <div className="bg-slate-50 p-6 border border-slate-200 rounded-xl">
                  <p className="text-slate-700 font-normal leading-relaxed text-sm">{activeSession.transcript}</p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Reports &amp; Analytics
          </h1>
          <p className="text-slate-600 font-normal max-w-xl">Review your past session performance, track AI feedback trends, and generate executive PDF summaries.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isCloudSynced ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
                <Cloud className="w-3.5 h-3.5" /> Cloud Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 shadow-2xs">
                <CloudOff className="w-3.5 h-3.5" /> Local Storage
              </span>
            )}
          </div>

          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F1426] cursor-pointer transition-all text-xs uppercase"
          >
            <option value="all">ALL MODULES</option>
            <option value="speech">SPEECH COACH</option>
            <option value="presentation">SLIDE ANALYZER</option>
            <option value="viva">AI VIVA</option>
          </select>
        </div>
      </div>

      {/* Performance Trajectory Line Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                <TrendingUp className="w-5 h-5 text-[#0F1426]" />
                Performance Trajectory
              </h3>
              <p className="text-xs text-slate-500 font-medium">Overall score progression over time</p>
            </div>
          </div>

          <div className="w-full h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F1426" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0F1426" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0F1426] border border-slate-800 text-white text-xs p-3 rounded-xl shadow-xl">
                          <p className="font-medium text-slate-400">{data.fullDate}</p>
                          <p className="font-bold text-slate-400 mt-0.5">{data.type}</p>
                          <p className="text-base font-bold mt-1 text-[#F2A93B]">Score: {data.score}%</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0F1426" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#scoreGradient)" 
                  dot={{ r: 4, fill: '#0F1426', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#F2A93B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {totalSessions > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Practice</h4>
            <span className="text-4xl font-extrabold text-slate-900">{totalSessions}</span>
            <span className="text-xs font-medium text-slate-500 ml-2 uppercase">Sessions</span>
          </div>
          {Object.entries(moduleCounts).map(([type, count]) => (
            <div key={type} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{getModuleName(type)}</h4>
              <span className="text-3xl font-extrabold text-slate-900">{String(count)}</span>
              <span className="text-xs font-medium text-slate-500 ml-2 uppercase">Sessions</span>
            </div>
          ))}
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-16 text-center">
          <Inbox size={48} className="mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase">No History Found</h2>
          <p className="text-slate-500 font-medium">You haven’t completed any {filter !== 'all' ? filter : ''} sessions yet. Keep practicing!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Session Breakdown</h3>
            {/* Video Storage Cap Notice */}
            <div className="text-xs text-slate-600 font-medium bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <HardDrive size={14} className="text-slate-700 shrink-0" />
              <span>Recorded videos are saved locally via IndexedDB. Export to MP4 or clear browser data anytime to free space.</span>
            </div>
          </div>
          {filteredHistory.map((session, i) => (
            <div key={i} className={`bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-xs hover:shadow-md transition-all break-inside-avoid accent-stripe`} style={{'--color-brand-from': {'speech':'#10b981','presentation':'#3b82f6','viva':'#e11d48','interview':'#f59e0b','jury':'#fa7c42'}[session.type] || '#94a3b8', '--color-brand-to': {'speech':'#34d399','presentation':'#60a5fa','viva':'#fb7185','interview':'#fbbf24','jury':'#818cf8'}[session.type] || '#cbd5e1'} as React.CSSProperties}>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200/70 flex-shrink-0 shadow-xs">
                {renderModuleIcon(session.type)}
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 capitalize">{getModuleName(session.type)}</h3>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                      {new Date(session.timestamp).toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button 
                      onClick={() => handleShare(session)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs"
                    >
                      {copiedSessionId === session.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Link Copied (+5 Bonus)!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-indigo-600" />
                          <span>Share Score</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setExportingSessionId(session.id)}
                      disabled={exportingSessionId === session.id}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${exportingSessionId === session.id ? 'bg-slate-100 cursor-wait text-slate-400' : 'bg-[#0F1426] hover:bg-[#1A2035] text-white shadow-sm'}`}
                    >
                      <FileText className="w-4 h-4 text-[#F2A93B]" />
                      {exportingSessionId === session.id ? 'Generating...' : 'Export Detailed PDF'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {session.scores?.overall !== undefined && (
                    <div className="bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl shadow-2xs">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Score</span>
                      <span className="text-2xl font-extrabold text-slate-900">{session.scores.overall}%</span>
                    </div>
                  )}
                  {Object.entries(session.scores || {}).map(([key, val]) => {
                    if (key === 'overall' || val === 'N/A' || val === undefined || val === null) return null;
                    return (
                      <div key={key} className="bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl shadow-2xs">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</span>
                        <span className="text-xl font-bold text-slate-900">{String(val)}</span>
                      </div>
                    );
                  })}
                  {session.metrics?.wpm && (
                    <div className="bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl shadow-2xs">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pace</span>
                      <span className="text-xl font-bold text-slate-900">{session.metrics.wpm} WPM</span>
                    </div>
                  )}
                </div>

                {/* Qualitative AI Feedback Analysis */}
                {(session.strengths?.length > 0 || session.weaknesses?.length > 0 || session.feedback) && (
                  <div className="mt-6 border-t border-slate-100 pt-5 w-full">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">AI Analysis &amp; Insights</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {session.strengths && session.strengths.length > 0 && (
                        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-2">What you did well</span>
                          <ul className="list-disc pl-4 text-sm font-normal text-slate-700 space-y-1.5 marker:text-emerald-500">
                            {session.strengths.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {session.weaknesses && session.weaknesses.length > 0 && (
                        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-2">Areas for Improvement</span>
                          <ul className="list-disc pl-4 text-sm font-normal text-slate-700 space-y-1.5 marker:text-rose-500">
                            {session.weaknesses.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {session.suggestions && session.suggestions.length > 0 && (
                      <div className="mt-4 bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">Actionable Suggestions</span>
                        <ul className="list-disc pl-4 text-sm font-normal text-slate-700 space-y-1.5 marker:text-amber-500">
                          {session.suggestions.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                    )}

                    {session.feedback && (
                      <div className="mt-4 bg-slate-50 p-5 border border-slate-200 rounded-xl shadow-2xs">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Detailed Feedback</span>
                        <p className="text-sm font-normal text-slate-700 leading-relaxed">{session.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Render local video if it exists in IndexedDB */}
                {session.hasVideo && <VideoPlayer sessionId={session.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}
