'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Plus,
  Copy,
  Check,
  Share2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Building2,
  Mic,
  Briefcase,
  Tv,
  Award,
  RefreshCw,
  MessageCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  MapPin,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Footer from '@/components/Footer';

interface BatchItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  track: string;
  is_active: boolean;
  studentCount: number;
  submissionCount: number;
  created_at: string;
}

interface AcademyData {
  id: string;
  name: string;
  city?: string;
  commission_rate: number;
  total_earnings: number;
}

export default function TrainerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [academy, setAcademy] = useState<AcademyData | null>(null);
  const [batches, setBatches] = useState<BatchItem[]>([]);

  // Onboarding modal
  const [instituteName, setInstituteName] = useState('');
  const [instituteCity, setInstituteCity] = useState('');
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  // Create Batch modal
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [newBatchTrack, setNewBatchTrack] = useState('all');
  const [creatingBatch, setCreatingBatch] = useState(false);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchTrainerData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/trainer');
        return;
      }
      setUser(session.user);

      // 1. Fetch Academy Info
      const acadRes = await fetch('/api/trainer/academy', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const acadData = await acadRes.json();
      if (acadData.academy) {
        setAcademy(acadData.academy);
      }

      // 2. Fetch Batches
      const batchRes = await fetch('/api/trainer/batches', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const batchData = await batchRes.json();
      if (batchData.batches) {
        setBatches(batchData.batches);
      }
    } catch (err) {
      console.error('Failed to load trainer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegisterAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteName.trim()) return;

    setSubmittingOnboarding(true);
    setOnboardingError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/trainer');
        return;
      }

      const res = await fetch('/api/trainer/academy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: instituteName.trim(),
          city: instituteCity.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.academy) {
        setAcademy(data.academy);
        // Refresh batch data to load clean dashboard
        await fetchTrainerData();
      } else {
        setOnboardingError(data.error || 'Failed to save academy details. Please try again.');
      }
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setOnboardingError(err?.message || 'Connection error. Please try again.');
    } finally {
      setSubmittingOnboarding(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    setCreatingBatch(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/trainer/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: newBatchName.trim(),
          description: newBatchDesc.trim(),
          track: newBatchTrack,
        }),
      });

      if (res.ok) {
        setShowCreateBatch(false);
        setNewBatchName('');
        setNewBatchDesc('');
        fetchTrainerData();
      }
    } catch (err) {
      console.error('Create batch failed:', err);
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`Are you sure you want to remove batch "${batchName}"? This action cannot be undone.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/trainer/batches?batchId=${batchId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (res.ok) {
        fetchTrainerData();
      }
    } catch (err) {
      console.error('Delete batch failed:', err);
    }
  };

  const copyWhatsAppLink = (code: string, batchName: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oratii.app';
    const link = `${origin}/join/${code}`;
    const text = `📢 *${academy?.name || 'Our Academy'}* speaking practice batch is now live on Oratii AI!\n\n👉 Join our official class here: ${link}\n\nJoin with your phone to start practicing your speaking drills!`;

    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Trainer Portal...</p>
        </div>
      </div>
    );
  }

  // ─── Case 1: First-Time Trainer Onboarding ───
  if (!academy) {
    return (
      <div className="min-h-[88vh] bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 shadow-xl border border-indigo-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Register Your Institute / Academy</h1>
              <p className="text-xs text-slate-500 font-medium">Free AI Speech & Placement Lab for your batches</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>What you get as a verified partner (₹0 Cost):</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Automatic grading for all speech, interview & viva homework</li>
              <li>Your Institute’s name co-branded on student PDF scorecards</li>
              <li>1-Click WhatsApp Class Leaderboards</li>
              <li>Partner revenue share program when students buy top-up packs</li>
            </ul>
          </div>

          {onboardingError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <p className="font-medium">{onboardingError}</p>
            </div>
          )}

          <form onSubmit={handleRegisterAcademy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Institute / Academy Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Spoken English Academy"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City / Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hyderabad, Ameerpet"
                value={instituteCity}
                onChange={(e) => setInstituteCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={submittingOnboarding}
              className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {submittingOnboarding ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Creating Academy Profile...
                </>
              ) : (
                <>
                  Launch Trainer Portal (₹0 Free)
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalStudents = batches.reduce((acc, b) => acc + (b.studentCount || 0), 0);
  const totalSubmissions = batches.reduce((acc, b) => acc + (b.submissionCount || 0), 0);

  // ─── Case 2: Registered Trainer Dashboard ───
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between w-full">
      <div className="p-6 sm:p-8 space-y-8 font-sans max-w-7xl mx-auto w-full flex-1">
      {/* Top Banner */}
      <div className="bg-[#0F1426] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F2A93B]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-[#F2A93B] shadow-sm">
            <Building2 size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{academy.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Partner Academy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-[#F2A93B]" /> {academy.city || 'India'}</span>
              <span className="text-slate-500">•</span>
              <span>20% Student Top-Up Commission Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowCreateBatch(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F2A93B] hover:bg-[#e0992b] text-[#0F1426] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} />
            Create New Batch
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Batches</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{batches.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drills Completed</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earnings / Credits</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">₹{academy.total_earnings || 0}</p>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Your Batches & Classrooms</h2>
            <p className="text-xs text-slate-500 font-medium">
              Share the 6-character WhatsApp link with your batch to track their speaking homework.
            </p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No batches created yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Create your first batch (e.g. &quot;IELTS Morning Batch&quot; or &quot;Placement Prep 2026&quot;) to generate your unique WhatsApp invite link.
              </p>
            </div>
            <button
              onClick={() => setShowCreateBatch(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 transition-all"
            >
              <Plus size={16} />
              Create Your First Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => {
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const joinUrl = `${origin}/join/${batch.code}`;
              const isCopied = copiedCode === batch.code;

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                          Code: {batch.code}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">{batch.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDeleteBatch(batch.id, batch.name)}
                          title="Remove Batch"
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="p-2 rounded-xl bg-slate-50 text-slate-500">
                          {batch.track === 'speech' ? (
                            <Mic size={18} className="text-rose-500" />
                          ) : batch.track === 'interview' ? (
                            <Briefcase size={18} className="text-amber-600" />
                          ) : (
                            <Tv size={18} className="text-indigo-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {batch.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {batch.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-600" />
                        {batch.studentCount} Students
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-600" />
                        {batch.submissionCount} Submissions
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => copyWhatsAppLink(batch.code, batch.name)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200/60"
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          WhatsApp Link Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={14} className="text-emerald-600" />
                          Share WhatsApp Link
                        </>
                      )}
                    </button>

                    <Link
                      href={`/trainer/batches/${batch.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-100"
                    >
                      Open Student Gradebook
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal: Create Batch ─── */}
      {showCreateBatch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Create New Class Batch</h3>
                <p className="text-xs text-slate-500 font-medium">Generates a unique 6-character WhatsApp join link</p>
              </div>
              <button
                onClick={() => setShowCreateBatch(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IELTS Morning Batch 1"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Track
                </label>
                <select
                  value={newBatchTrack}
                  onChange={(e) => setNewBatchTrack(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="all">All Active Tracks (Speech & Interview)</option>
                  <option value="speech">Speech Delivery & Fluency Track</option>
                  <option value="interview">Campus Placement & Mock Interview Track</option>
                  <option value="presentation_viva" disabled className="text-slate-400 opacity-50 blur-[0.5px] cursor-not-allowed">Presentation Practice & Viva Track (Soon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Timings (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri 8:00 AM - 9:30 AM"
                  value={newBatchDesc}
                  onChange={(e) => setNewBatchDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateBatch(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBatch}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {creatingBatch ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}
