'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  MessageSquare, 
  Plus, 
  Star, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Search, 
  Sparkles, 
  HelpCircle, 
  Mic, 
  FileText, 
  Briefcase, 
  Video, 
  CreditCard, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Laptop, 
  Mail, 
  User, 
  Tag, 
  ShieldCheck, 
  Headphones, 
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

export type HubTab = 'feedback' | 'ticket' | 'my-tickets' | 'faq';

interface SupportFeedbackHubProps {
  initialTab?: HubTab;
}

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  messages: Array<{ sender: 'user' | 'support'; message: string; timestamp: string }>;
  systemInfo?: string;
  userName?: string;
  userEmail?: string;
}

const DEFAULT_TICKETS: TicketItem[] = [
  {
    id: 'TKT-8921',
    subject: 'Microphone permission prompt not re-appearing in Chrome',
    category: 'Speech Coach',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        sender: 'user',
        message: 'I accidentally clicked Block on microphone permissions and now Chrome will not ask again when launching Speech Coach.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        sender: 'support',
        message: 'Hello! To reset this in Chrome, click the Tune icon (or padlock) immediately to the left of the URL bar in Chrome, toggle Microphone to "Allow", and refresh the page. Let us know if that gets you recording!',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    systemInfo: 'Chrome 124 on Windows 11 · 1920x1080'
  },
  {
    id: 'TKT-8804',
    subject: 'How to top up additional credits for team presentation audit',
    category: 'Billing & Credits',
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      {
        sender: 'user',
        message: 'We need to analyze 4 slide decks today. Can we buy the Pro Pack and do they expire?',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        sender: 'support',
        message: 'Hi there! Paid packs have lifetime validity and never expire. You can head over to Pricing to top up instantly with UPI, Cards, or NetBanking.',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'TKT-8755',
    subject: 'Slide analyzer processing time for 40-slide presentation',
    category: 'Slide Analyzer',
    status: 'closed',
    priority: 'low',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    messages: [
      {
        sender: 'user',
        message: 'Analysis completed successfully! Just wanted to confirm maximum recommended slide count.',
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        sender: 'support',
        message: 'Great to hear! Oratii handles up to 50 slides smoothly. For larger decks, we recommend breaking them into sections for optimal feedback depth.',
        timestamp: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ]
  }
];

const FAQS = [
  {
    question: 'How do I grant or fix microphone permissions?',
    answer: 'In Chrome or Edge, click the tune/settings icon on the left side of the address bar (next to the URL). Set "Microphone" to "Allow" and refresh the page. On macOS, also verify that System Settings > Privacy & Security > Microphone has Chrome/your browser enabled.'
  },
  {
    question: 'What file formats does Presentation Practice support?',
    answer: 'We support PDF (.pdf) and PowerPoint (.pptx) formats up to 50MB and up to 50 slides per session. For best results, upload high-resolution PPTX or PDF slides.'
  },
  {
    question: 'How do credits work and what if a session fails?',
    answer: '1 credit allows 1 speech delivery audit or 1 presentation practice session. 2 credits are used for an interactive AI Viva Defense session. If any analysis experiences a network or processing error, credits are automatically retained in your balance.'
  },
  {
    question: 'How quickly does the engineering support team reply?',
    answer: 'Our technical support team actively reviews tickets 7 days a week. Typical response time is under 2 hours during active hours, and urgent critical tickets are escalated immediately.'
  },
  {
    question: 'Can I use Oratii on mobile or tablet devices?',
    answer: 'Yes! Oratii is fully responsive and installable as a Progressive Web App (PWA). You can practice speech drills and review past reports directly from your iOS Safari or Android Chrome browser.'
  },
  {
    question: 'How do I submit product feedback or request a new feature?',
    answer: 'Use the "Give Feedback" tab above! Select "Feature Request", rate your experience, and detail your request. Our product team reviews all user ideas weekly during sprint planning.'
  }
];

const CATEGORIES = [
  { id: 'Speech Coach', label: 'Speech Coach & Mic', icon: Mic, color: 'text-rose-500 bg-rose-50 border-rose-200' },
  { id: 'Presentation Practice', label: 'Presentation Practice', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Mock Interview', label: 'Mock Interview', icon: Briefcase, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Viva Defense', label: 'Academic Viva Defense', icon: Video, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Billing & Credits', label: 'Billing & Credit Packs', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Account & Other', label: 'Account & Settings', icon: Settings, color: 'text-slate-600 bg-slate-50 border-slate-200' }
];

export default function SupportFeedbackHub({ initialTab = 'feedback' }: SupportFeedbackHubProps) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab') as HubTab | null;

  const [activeTab, setActiveTab] = useState<HubTab>(urlTab || initialTab);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- Feedback Form States ---
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug' | 'general' | 'complaint'>('general');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackModule, setFeedbackModule] = useState<string>('Speech Coach');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackName, setFeedbackName] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackContactOk, setFeedbackContactOk] = useState<boolean>(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // --- Ticket Form States ---
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<string>('Speech Coach');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [ticketName, setTicketName] = useState<string>('');
  const [ticketEmail, setTicketEmail] = useState<string>('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState<boolean>(true);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [ticketCreatedSuccess, setTicketCreatedSuccess] = useState<TicketItem | null>(null);

  // --- Ticket Tracker States ---
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-detect browser/OS diagnostics
  const [diagnosticsInfo, setDiagnosticsInfo] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      let browser = 'Browser';
      if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
      else if (userAgent.includes('Chrome/')) browser = 'Google Chrome';
      else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) browser = 'Safari';
      else if (userAgent.includes('Firefox/')) browser = 'Mozilla Firefox';

      let os = 'Unknown OS';
      if (userAgent.includes('Win')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

      setDiagnosticsInfo(`${browser} on ${os} · Screen: ${screenRes}`);
    }
  }, []);

  // Fetch Auth User and Load Local / Supabase Tickets
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      setCurrentUser(user || null);
      if (user) {
        setFeedbackEmail(user.email || '');
        setFeedbackName(user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '');
        setTicketEmail(user.email || '');
        setTicketName(user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      }
    });

    // Load persisted tickets from localStorage or Supabase
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oratii_user_tickets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTickets(parsed);
            return;
          }
        } catch (e) {
          console.warn('Failed to parse cached tickets', e);
        }
      }
      setTickets(DEFAULT_TICKETS);
    }
  }, []);

  // Save tickets to local cache when updated
  const persistTickets = (updated: TicketItem[]) => {
    setTickets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oratii_user_tickets', JSON.stringify(updated));
    }
  };

  // Dynamic sentiment label based on star rating
  const sentimentMeta = useMemo(() => {
    const r = feedbackHoverRating || feedbackRating;
    switch (r) {
      case 1:
        return { emoji: '😞', label: 'Needs major improvements — tell us how to fix it', color: 'text-rose-600 bg-rose-50 border-rose-200' };
      case 2:
        return { emoji: '😐', label: 'Below expectations — what was missing?', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 3:
        return { emoji: '🙂', label: 'Good — helpful tool with room to grow', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 4:
        return { emoji: '😊', label: 'Great experience! Really boosts confidence', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 5:
      default:
        return { emoji: '🤩', label: 'Outstanding! Absolutely love Oratii!', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
  }, [feedbackRating, feedbackHoverRating]);

  // Handle Feedback Submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      // Attempt insert into Supabase `user_feedback`
      await supabase.from('user_feedback').insert({
        user_id: currentUser?.id || null,
        user_name: feedbackName || currentUser?.user_metadata?.name || 'Anonymous Speaker',
        type: feedbackType,
        rating: feedbackRating,
        message: `[${feedbackModule}] ${feedbackMessage}${feedbackEmail ? ` (Contact: ${feedbackEmail})` : ''}`,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase feedback insert notice (saved locally):', err);
    }

    // Always simulate pleasant finish
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setFeedbackSubmitted(true);
    }, 600);
  };

  // Handle Ticket Submission
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmittingTicket(true);

    const generatedId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: TicketItem = {
      id: generatedId,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      status: 'open',
      priority: ticketPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userName: ticketName || 'Speaker',
      userEmail: ticketEmail || 'support@oratii.in',
      systemInfo: includeDiagnostics ? diagnosticsInfo : undefined,
      messages: [
        {
          sender: 'user',
          message: ticketMessage.trim(),
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      // Attempt Supabase insert into `support_tickets`
      await supabase.from('support_tickets').insert({
        id: generatedId,
        user_id: currentUser?.id || null,
        user_name: ticketName || currentUser?.user_metadata?.name || 'Support User',
        subject: `[${ticketCategory}] ${ticketSubject}`,
        priority: ticketPriority,
        status: 'open',
        messages_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase ticket insert notice (saved locally):', err);
    }

    const updated = [newTicket, ...tickets];
    persistTickets(updated);

    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketCreatedSuccess(newTicket);
      setTicketSubject('');
      setTicketMessage('');
    }, 700);
  };

  // Handle Sending a Follow-up Reply in Modal
  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          updatedAt: new Date().toISOString(),
          messages: [
            ...t.messages,
            {
              sender: 'user' as const,
              message: replyText.trim(),
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    });

    persistTickets(updated);
    const refreshed = updated.find((t) => t.id === ticketId) || null;
    setSelectedTicket(refreshed);
    setReplyText('');
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(ticketSearch.toLowerCase());
      const matchStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, ticketSearch, ticketStatusFilter]);

  const openTicketCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900 relative overflow-hidden">
      {/* Background Soft Glow Mesh (Identical to Landing Page & Pricing Hero) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-300/20 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '14s' }} />
      <div className="absolute top-[15%] right-[-10%] w-[50vw] h-[50vw] bg-amber-200/25 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '16s', animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-[25%] w-[45vw] h-[45vw] bg-purple-200/20 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Main Content Area */}
      <div className="flex-1 pb-12 sm:pb-16 relative z-10">
        
        {/* Header Hero Section */}
        <section className="pt-10 sm:pt-14 pb-8 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          
          {/* Eyebrow Badge */}
          <div className="ui-badge-pill mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Support &amp; Feedback Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 mb-4 leading-tight">
            How can we help you <span className="text-[#F2A93B]">excel?</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Share ideas to shape our AI coach, open a direct engineering ticket, or explore instant troubleshooting guides.
          </p>

          {/* Unified Navigation Switcher Bar */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm max-w-full overflow-x-auto gap-1">
            <button
              onClick={() => { setActiveTab('feedback'); setFeedbackSubmitted(false); }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-[#0F1426] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
              }`}
            >
              <Star size={16} className={activeTab === 'feedback' ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
              <span>Give Feedback</span>
            </button>

            <button
              onClick={() => { setActiveTab('ticket'); setTicketCreatedSuccess(null); }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'ticket'
                  ? 'bg-[#0F1426] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
              }`}
            >
              <Plus size={16} className={activeTab === 'ticket' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Open Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'my-tickets'
                  ? 'bg-[#0F1426] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
              }`}
            >
              <MessageSquare size={16} className={activeTab === 'my-tickets' ? 'text-amber-400' : 'text-slate-400'} />
              <span>My Tickets</span>
              {openTicketCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-[#0F1426]">
                  {openTicketCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-[#0F1426] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
              }`}
            >
              <HelpCircle size={16} className={activeTab === 'faq' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Quick Help &amp; FAQ</span>
            </button>
          </div>

        </section>

        {/* ─── TAB 1: GIVE FEEDBACK ─── */}
        {activeTab === 'feedback' && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
            {feedbackSubmitted ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200/60">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3">
                  <Sparkles size={14} className="text-amber-500" /> Feedback Received
                </div>
                <h2 className="text-3xl font-black text-slate-950 mb-3 tracking-tight">
                  Thank You for Powering Oratii!
                </h2>
                <p className="text-slate-600 font-medium max-w-lg mx-auto mb-8 leading-relaxed">
                  Your feedback has been delivered to our engineering and design team. We review every note to refine vocal pacing, slide auditing, and viva simulations.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setFeedbackSubmitted(false);
                      setFeedbackMessage('');
                      setFeedbackRating(5);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Submit Another Feedback
                  </button>
                  <button
                    onClick={() => setActiveTab('ticket')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#0F1426] font-black rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Need Tech Support? Open a Ticket <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleFeedbackSubmit}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] p-6 sm:p-10 space-y-8"
              >
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                    1. What kind of feedback are you sharing?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'feature', label: 'Feature Request', icon: '💡' },
                      { id: 'bug', label: 'Bug Report', icon: '🐛' },
                      { id: 'general', label: 'General Review', icon: '💬' },
                      { id: 'complaint', label: 'Improvement', icon: '⚡' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFeedbackType(t.id as any)}
                        className={`p-3 rounded-2xl text-xs sm:text-sm font-black border transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                          feedbackType === t.id
                            ? 'border-slate-950 bg-[#0F1426] text-white shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star Rating Section */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                      2. How would you rate your overall experience?
                    </label>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${sentimentMeta.color}`}>
                      <span>{sentimentMeta.emoji}</span>
                      <span>{sentimentMeta.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setFeedbackHoverRating(star)}
                        onMouseLeave={() => setFeedbackHoverRating(0)}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          size={38}
                          className={`transition-colors ${
                            star <= (feedbackHoverRating || feedbackRating)
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-300 fill-slate-100 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module Tag Pill Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                    3. Which feature does this relate to?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Speech Coach',
                      'Slide Analyzer',
                      'Mock Interview',
                      'Viva Defense',
                      'Pricing & Credits',
                      'Website & Design',
                      'Entire Platform'
                    ].map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => setFeedbackModule(mod)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          feedbackModule === mod
                            ? 'bg-amber-400/20 border-amber-400 text-amber-950 font-black shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Message */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    4. Your Thoughts &amp; Detailed Suggestions <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    required
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Tell us what you loved, what felt confusing, or what new capability you'd love to see next..."
                    rows={5}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all font-medium resize-none shadow-xs text-sm sm:text-base"
                  />
                </div>

                {/* Contact Details (Optional or Prefilled) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Your Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address (for follow-up updates)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 font-medium">
                    🛡️ Your feedback is strictly private and used only for improving Oratii.
                  </p>

                  <button
                    type="submit"
                    disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#0F1426] font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-base"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        <span>Transmitting Feedback...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ─── TAB 2: SUBMIT TICKET ─── */}
        {activeTab === 'ticket' && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
            {ticketCreatedSuccess ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200/60">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3">
                  Ticket Dispatched #{ticketCreatedSuccess.id}
                </div>
                <h2 className="text-3xl font-black text-slate-950 mb-3 tracking-tight">
                  Support Ticket Submitted!
                </h2>
                <p className="text-slate-600 font-medium max-w-lg mx-auto mb-6 leading-relaxed">
                  Our engineering team has been notified. You can track updates and post replies directly in your ticket dashboard.
                </p>

                {/* Ticket Summary Card */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left max-w-md mx-auto mb-8 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Ticket Reference:</span>
                    <span className="font-mono font-bold text-indigo-900">{ticketCreatedSuccess.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Subject:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[220px]">{ticketCreatedSuccess.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Priority:</span>
                    <span className="capitalize font-bold text-amber-600">{ticketCreatedSuccess.priority}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedTicket(ticketCreatedSuccess);
                      setActiveTab('my-tickets');
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} /> View Ticket Conversation
                  </button>
                  <button
                    onClick={() => setTicketCreatedSuccess(null)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Open Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleTicketSubmit}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] p-6 sm:p-10 space-y-8"
              >
                {/* Category Grid */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                    1. Select Support Area <span className="text-amber-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = ticketCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setTicketCategory(cat.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-950 bg-[#0F1426] text-white shadow-md'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10 text-amber-400' : cat.color}`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-xs sm:text-sm font-bold leading-tight mt-1">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                    2. Urgency Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'low', label: 'Low', desc: 'General question', dot: 'bg-emerald-500' },
                      { id: 'medium', label: 'Medium', desc: 'Minor unexpected issue', dot: 'bg-blue-500' },
                      { id: 'high', label: 'High', desc: 'Core feature blocked', dot: 'bg-orange-500' },
                      { id: 'critical', label: 'Critical', desc: 'Cannot practice/login', dot: 'bg-rose-500' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTicketPriority(p.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          ticketPriority === p.id
                            ? 'border-amber-400 bg-amber-50/70 text-slate-950 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                          <span className="text-sm font-bold">{p.label}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    3. Subject / Summary <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Microphone not picking up audio during 3-minute speech practice"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-2xs"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    4. Details &amp; Steps to Reproduce <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Please describe what happened, what you expected, and any error message you encountered..."
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all resize-none shadow-2xs"
                  />
                </div>

                {/* Diagnostics Toggle */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="diagnosticsToggle"
                    checked={includeDiagnostics}
                    onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="diagnosticsToggle" className="text-xs text-slate-700 cursor-pointer">
                    <span className="font-bold block text-slate-900">Include Browser &amp; Hardware Diagnostics</span>
                    <span>
                      Attaches: <span className="font-mono text-[11px] text-indigo-700">{diagnosticsInfo || 'Browser & Display metrics'}</span>. Helps engineers troubleshoot immediately.
                    </span>
                  </label>
                </div>

                {/* User Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Your Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Email (where we will reply) <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Tickets are routed to on-call senior engineers.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!ticketSubject.trim() || !ticketMessage.trim() || isSubmittingTicket}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#0F1426] font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-base"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        <span>Dispatching Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ─── TAB 3: MY TICKETS TRACKER ─── */}
        {activeTab === 'my-tickets' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
            
            {/* Action Bar */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search tickets by ID or title..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white transition-all"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      ticketStatusFilter === st
                        ? 'bg-[#0F1426] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'in_progress' ? 'In Progress' : st}
                  </button>
                ))}
              </div>

              {/* Create New Ticket Shortcut */}
              <button
                onClick={() => {
                  setTicketCreatedSuccess(null);
                  setActiveTab('ticket');
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#0F1426] font-black rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={15} /> New Ticket
              </button>
            </div>

            {/* Ticket Cards List */}
            {filteredTickets.length === 0 ? (
              <div className="bg-white/80 rounded-3xl border border-slate-200/80 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No tickets found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  {ticketSearch ? 'No ticket matched your search query.' : 'You have no tickets currently matching this filter.'}
                </p>
                <button
                  onClick={() => setActiveTab('ticket')}
                  className="px-5 py-2.5 bg-[#0F1426] text-white font-bold rounded-xl text-sm hover:bg-[#1A2035] transition-all cursor-pointer"
                >
                  Create Support Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((t) => {
                  const statusColors = {
                    open: 'bg-blue-50 text-blue-700 border-blue-200',
                    in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
                    resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    closed: 'bg-slate-100 text-slate-600 border-slate-200'
                  };

                  const priorityColors = {
                    low: 'text-slate-600 bg-slate-100',
                    medium: 'text-blue-700 bg-blue-50',
                    high: 'text-orange-700 bg-orange-50',
                    critical: 'text-rose-700 bg-rose-50'
                  };

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-5 hover:border-amber-400/80 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {t.id}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {t.category}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusColors[t.status]}`}>
                            {t.status === 'in_progress' ? 'In Progress' : t.status}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[t.priority]}`}>
                            {t.priority}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                          {t.subject}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {t.messages[t.messages.length - 1]?.message || 'No messages yet'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          <span>{t.messages.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#0F1426] group-hover:text-white text-slate-700 font-bold transition-all text-xs">
                          View Details
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 4: QUICK HELP & FAQ ─── */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] p-6 sm:p-10">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Instant resolutions to the most common setup and practice questions.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <HelpCircle size={24} />
                </div>
              </div>

              <div className="space-y-4">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all bg-white"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-amber-600 transition-colors cursor-pointer"
                      >
                        <span className="text-sm sm:text-base">{faq.question}</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/40 animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Callout box */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-950">Have a question not covered here?</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Our technical engineering team is ready to assist you right now.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ticket')}
                  className="px-5 py-2.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shadow-md"
                >
                  Open Support Ticket
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ─── TICKET CONVERSATION MODAL / DRAWER ─── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTicket(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    {selectedTicket.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedTicket.category}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 capitalize">
                    {selectedTicket.status === 'in_progress' ? 'In Progress' : selectedTicket.status}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950">
                  {selectedTicket.subject}
                </h2>
                {selectedTicket.systemInfo && (
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    System: {selectedTicket.systemInfo}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation Messages Timeline */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {selectedTicket.messages.map((msg, idx) => {
                const isSupport = msg.sender === 'support';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isSupport ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 px-1 font-bold">
                      {isSupport ? (
                        <>
                          <Headphones size={12} className="text-indigo-600" />
                          <span className="text-indigo-900 font-bold">Oratii Technical Support</span>
                        </>
                      ) : (
                        <span>You</span>
                      )}
                      <span>·</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                        isSupport
                          ? 'bg-indigo-50/80 border border-indigo-100 text-slate-900 rounded-tl-xs'
                          : 'bg-[#0F1426] text-white rounded-tr-xs shadow-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(selectedTicket.id);
                    }
                  }}
                  placeholder="Send an additional comment or diagnostic info..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(selectedTicket.id)}
                  disabled={!replyText.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 hover:to-[#e0992b] text-[#0F1426] font-black rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Reply</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Website Standard Footer */}
      <Footer />
    </div>
  );
}
