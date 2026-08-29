'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, Mic, FileText, MessageSquare, CreditCard, ScrollText, Settings, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  category: 'Users' | 'Speech' | 'PPT' | 'Viva' | 'Billing' | 'System';
  href: string;
  description: string;
}

const SEARCH_ITEMS: SearchResult[] = [
  { id: '1', title: 'All Registered Users', category: 'Users', href: '/admin/users', description: 'Manage profiles, roles, and plan status' },
  { id: '2', title: 'Premium Pro Subscribers', category: 'Users', href: '/admin/users/premium', description: 'View Pro & Pack subscriber details' },
  { id: '3', title: 'Speech Analysis Reports', category: 'Speech', href: '/admin/speech', description: 'Vocal WPM, tone clarity, and filler counts' },
  { id: '4', title: 'Speech Analytics Dashboard', category: 'Speech', href: '/admin/speech/analytics', description: 'Aggregate speech performance metrics' },
  { id: '5', title: 'PPT Slide Deck Audits', category: 'PPT', href: '/admin/ppt', description: 'Slide layout, storytelling, and design ratings' },
  { id: '6', title: 'PPT Analytics Dashboard', category: 'PPT', href: '/admin/ppt/analytics', description: 'Deck breakdown and category insights' },
  { id: '7', title: 'Viva Defense Sessions', category: 'Viva', href: '/admin/viva', description: 'AI examiner Q&A sessions and scoring' },
  { id: '8', title: 'Viva Question Bank', category: 'Viva', href: '/admin/viva/questions', description: 'Academic and technical defense prompts' },
  { id: '9', title: 'Subscription Plans & Credits', category: 'Billing', href: '/admin/subscriptions', description: 'Manage packages (₹299 Value / ₹799 Pro)' },
  { id: '10', title: 'Razorpay Payment Logs', category: 'Billing', href: '/admin/subscriptions/payments', description: 'Transaction history and webhooks' },
  { id: '11', title: 'AI API Rate Limits & Keys', category: 'System', href: '/admin/ai-settings', description: 'Cerebras, Groq, Gemini & Deepgram settings' },
  { id: '12', title: 'System Activity Logs', category: 'System', href: '/admin/logs', description: 'Serverless runtime logs and error traces' },
];

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  const filtered = SEARCH_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]?.href || '/admin');
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Users': return <Users size={16} className="text-indigo-500" />;
      case 'Speech': return <Mic size={16} className="text-emerald-500" />;
      case 'PPT': return <FileText size={16} className="text-amber-500" />;
      case 'Viva': return <MessageSquare size={16} className="text-sky-500" />;
      case 'Billing': return <CreditCard size={16} className="text-purple-500" />;
      default: return <ScrollText size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search admin pages, users, reports..."
            className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50 dark:divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No admin results found matching &ldquo;<span className="font-semibold text-slate-600 dark:text-slate-300">{query}</span>&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{item.title}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className={`shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">↵</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">ESC</kbd> Close</span>
          </div>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">{filtered.length} Admin Results</span>
        </div>
      </div>
    </div>
  );
}
