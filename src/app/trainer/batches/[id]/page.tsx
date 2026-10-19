'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Share2,
  Check,
  Plus,
  Trophy,
  BookOpen,
  Mic,
  Briefcase,
  Tv,
  Calendar,
  Clock,
  Award,
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StudentMetric {
  id: string;
  email: string;
  name: string;
  totalSessions: number;
  avgScore: number;
  avgWpm: number;
  totalFillers: number;
  cefrBand: string;
  lastActive: string | null;
}

interface AssignmentItem {
  id: string;
  title: string;
  track: string;
  instructions?: string;
  target_wpm: number;
  max_fillers: number;
  due_date?: string;
  created_at: string;
}

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [gradebook, setGradebook] = useState<StudentMetric[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Active tab: 'gradebook' | 'assignments' | 'submissions'
  const [activeTab, setActiveTab] = useState<'gradebook' | 'assignments' | 'submissions'>('gradebook');

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLeaderboard, setCopiedLeaderboard] = useState(false);

  // New assignment modal
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignTrack, setAssignTrack] = useState('speech');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignTargetWpm, setAssignTargetWpm] = useState(140);
  const [assignMaxFillers, setAssignMaxFillers] = useState(2);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchBatchDetail = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/trainer/batches/${batchId}`);
        return;
      }

      const res = await fetch(`/api/trainer/batches/${batchId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBatch(data.batch);
        setGradebook(data.gradebook || []);
        setAssignments(data.assignments || []);
        setSubmissions(data.recentSubmissions || []);
      } else {
        router.push('/trainer');
      }
    } catch (err) {
      console.error('Failed to load batch detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  useEffect(() => {
    if (showNewAssignment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showNewAssignment]);

  const copyWhatsAppLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oratii.in';
    const link = `${origin}/join/${batch?.code}`;
    const text = `📢 *${batch?.academies?.name || 'Academy'}* Speaking Lab:\n\nJoin our official batch *${batch?.name}* on Oratii AI:\n👉 ${link}\n\nPractice your speaking drills before the next class!`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyWhatsAppLeaderboard = () => {
    if (gradebook.length === 0) return;

    // Sort by avgScore descending
    const sorted = [...gradebook].sort((a, b) => b.avgScore - a.avgScore);
    const top3 = sorted.slice(0, 5);

    let text = `🏆 *${batch?.name} — Daily Speaking Leaderboard*\n`;
    text += `📍 *${batch?.academies?.name || 'Oratii Academy'}*\n\n`;

    top3.forEach((s, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐';
      text += `${medal} *${s.name}*: Score ${s.avgScore}% (${s.cefrBand}) · ${s.avgWpm} WPM · ${s.totalSessions} sessions\n`;
    });

    const activeCount = gradebook.filter((s) => s.totalSessions > 0).length;
    text += `\n📌 *${activeCount}/${gradebook.length} students completed their drills.* Keep practicing!\n`;
    text += `👉 Practice now: ${window.location.origin}/join/${batch?.code}`;

    navigator.clipboard.writeText(text);
    setCopiedLeaderboard(true);
    setTimeout(() => setCopiedLeaderboard(false), 2500);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    setSubmittingAssign(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/trainer/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          batchId,
          title: assignTitle.trim(),
          track: assignTrack,
          instructions: assignInstructions.trim(),
          targetWpm: assignTargetWpm,
          maxFillers: assignMaxFillers,
        }),
      });

      if (res.ok) {
        setShowNewAssignment(false);
        setAssignTitle('');
        setAssignInstructions('');
        fetchBatchDetail();
      }
    } catch (err) {
      console.error('Failed to create assignment:', err);
    } finally {
      setSubmittingAssign(false);
    }
  };

  if (loading || !batch) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Batch Gradebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 sm:p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to All Batches
        </Link>
        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black">
          Batch Code: {batch.code}
        </span>
      </div>

      {/* Batch Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{batch.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              {batch.track === 'speech' ? 'Speech Track' : batch.track === 'interview' ? 'Interview Track' : 'Presentation & Viva Track'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {batch.academies?.name || 'Academy'} · {batch.description || 'Continuous practice batch'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyWhatsAppLeaderboard}
            disabled={gradebook.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs transition-all disabled:opacity-50"
          >
            {copiedLeaderboard ? (
              <>
                <Check size={14} className="text-amber-700" />
                Leaderboard Copied!
              </>
            ) : (
              <>
                <Trophy size={14} className="text-amber-600" />
                Copy WhatsApp Leaderboard
              </>
            )}
          </button>

          <button
            onClick={copyWhatsAppLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all"
          >
            {copiedLink ? (
              <>
                <Check size={14} />
                WhatsApp Link Copied!
              </>
            ) : (
              <>
                <Share2 size={14} />
                Share WhatsApp Invite
              </>
            )}
          </button>

          <button
            onClick={() => setShowNewAssignment(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={14} className="text-[#F2A93B]" />
            Assign Drill
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('gradebook')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gradebook'
              ? 'bg-[#0F1426] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100/80'
          }`}
        >
          <BarChart3 size={14} /> Student Gradebook ({gradebook.length})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-[#0F1426] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100/80'
          }`}
        >
          <BookOpen size={14} /> Active Assignments ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#0F1426] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100/80'
          }`}
        >
          <FileText size={14} /> Submissions Stream ({submissions.length})
        </button>
      </div>

      {/* ─── TAB 1: Student Gradebook ─── */}
      {activeTab === 'gradebook' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {gradebook.length === 0 ? (
            <div className="text-center py-16 p-6 space-y-3">
              <Users size={36} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">No students enrolled yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Share your WhatsApp join link with your class so they can enroll and start practicing.
              </p>
              <button
                onClick={copyWhatsAppLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all"
              >
                <Share2 size={13} />
                Copy Class Invite Link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Student</th>
                    <th className="py-3.5 px-4 text-center">Sessions Done</th>
                    <th className="py-3.5 px-4 text-center">Avg WPM</th>
                    <th className="py-3.5 px-4 text-center">Total Fillers</th>
                    <th className="py-3.5 px-4 text-center">Overall Score</th>
                    <th className="py-3.5 px-4 text-center">CEFR / IELTS Band</th>
                    <th className="py-3.5 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {gradebook
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{s.name}</p>
                              <p className="text-[11px] text-slate-400">{s.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                          {s.totalSessions}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          {s.avgWpm > 0 ? (
                            <span className={s.avgWpm >= 120 && s.avgWpm <= 160 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                              {s.avgWpm} WPM
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          {s.totalSessions > 0 ? (
                            <span className={s.totalFillers <= 3 ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                              {s.totalFillers}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {s.avgScore > 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs">
                              {s.avgScore}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {s.totalSessions > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                              {s.cefrBand}
                            </span>
                          ) : (
                            <span className="text-slate-300">Pending</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          {s.lastActive ? (
                            new Date(s.lastActive).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          ) : (
                            <span className="text-slate-300">Never</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Batch Assignments ─── */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center space-y-3">
              <BookOpen size={32} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">No active drills assigned yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a speaking drill, mock interview, or slide defense task for this batch.
              </p>
              <button
                onClick={() => setShowNewAssignment(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                <Plus size={14} />
                Create First Drill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                        {a.track === 'speech' ? 'Speech Drill' : a.track === 'interview' ? 'Mock Interview' : 'Slide & Viva'}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-1">{a.title}</h3>
                    </div>
                  </div>

                  {a.instructions && (
                    <p className="text-xs text-slate-500 leading-relaxed">{a.instructions}</p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                    <span>Target: {a.target_wpm} WPM</span>
                    <span>•</span>
                    <span>Max Fillers: {a.max_fillers}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: Submissions Stream ─── */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-1">
              <p className="text-sm font-semibold">No homework submissions yet</p>
              <p className="text-xs">When students practice their drills, their scores will stream here live.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Session Completed</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                        Score: {sub.overall_score}%
                      </span>
                      {sub.cefr_band && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {sub.cefr_band}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pacing: {sub.wpm} WPM · Filler Words: {sub.filler_count} ·{' '}
                      {new Date(sub.submitted_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Modal: New Assignment ─── */}
      {showNewAssignment && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans"
          onClick={() => setShowNewAssignment(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up text-slate-900 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Assign New Practice Drill</h3>
                <p className="text-xs text-slate-500 font-medium">All students in this batch will receive this task</p>
              </div>
              <button
                onClick={() => setShowNewAssignment(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Drill Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2-Minute Self Introduction (IELTS Part 1)"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Module Track *
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: Speech Coach */}
                  <button
                    type="button"
                    onClick={() => setAssignTrack('speech')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      assignTrack === 'speech'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Mic size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Speech Coach (Fluency &amp; Pacing)</div>
                        <div className="text-[11px] text-slate-500 font-normal">Audio drills, filler detection &amp; WPM analysis</div>
                      </div>
                    </div>
                    {assignTrack === 'speech' && <Check size={16} className="text-indigo-600" />}
                  </button>

                  {/* Option 2: Mock Interview */}
                  <button
                    type="button"
                    onClick={() => setAssignTrack('interview')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      assignTrack === 'interview'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Mock Interview (STAR Method)</div>
                        <div className="text-[11px] text-slate-500 font-normal">Behavioral &amp; technical interview simulations</div>
                      </div>
                    </div>
                    {assignTrack === 'interview' && <Check size={16} className="text-indigo-600" />}
                  </button>

                  {/* Option 3: Presentation Practice & Viva Defense (SOON) */}
                  <div
                    aria-disabled="true"
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-100/60 text-slate-400 flex items-center justify-between opacity-50 blur-[0.4px] pointer-events-none cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                        <Tv size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          Presentation Practice &amp; Viva Defense
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">Slide telemetry &amp; committee pushback</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-500 px-2 py-0.5 rounded border border-slate-300">
                      SOON
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teacher Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Maintain 130-150 WPM. Avoid saying 'um' and 'matlab'."
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Target Pacing (WPM)
                  </label>
                  <input
                    type="number"
                    value={assignTargetWpm}
                    onChange={(e) => setAssignTargetWpm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Max Fillers Allowed
                  </label>
                  <input
                    type="number"
                    value={assignMaxFillers}
                    onChange={(e) => setAssignMaxFillers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewAssignment(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="w-1/2 py-2.5 rounded-xl bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {submittingAssign ? 'Assigning...' : 'Publish Drill'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
