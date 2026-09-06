'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Share2, Sparkles, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ReferralCard() {
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('https://oratii.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const referralLink = userId
    ? `${origin}/signup?ref=${userId.slice(0, 8)}`
    : `${origin}/signup`;

  const shareText = `Practice public speaking, audit slide decks, and ace technical job interviews with Oratii AI! Sign up using my link for 10 free trial credits: ${referralLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const shareWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareLinkedin = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      '_blank'
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-gradient-to-r from-[#151930] via-[#1B2140] to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-500/30 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column: Offer Details */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
            <Gift size={14} className="text-amber-400" />
            <span>Viral Referral Program</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Invite Friends & Earn +5 Free Credits!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Share your unique invite link with friends, classmates, or colleagues. Every user who registers gives both of you <strong className="text-amber-400">+5 Extra Trial Credits</strong> instantly!
          </p>
        </div>

        {/* Right Column: Interactive Link & One-Click Social Share */}
        <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
          
          {/* Copy Link Input Bar */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-indigo-500/40 p-1.5 rounded-2xl shadow-inner w-full lg:w-96">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent text-slate-200 text-xs font-mono font-bold px-3 outline-none flex-1 truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Link
                </>
              )}
            </button>
          </div>

          {/* Social Share Pills */}
          <div className="flex items-center gap-2 text-xs font-extrabold flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Share2 size={12} /> Share via:
            </span>

            <button
              onClick={shareWhatsapp}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareLinkedin}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>LinkedIn</span>
            </button>

            <button
              onClick={shareTwitter}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Twitter (X)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
