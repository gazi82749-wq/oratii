'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Zap, Sparkles, ArrowRight, X, CreditCard, ShieldCheck } from 'lucide-react';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
  currentBalance?: number;
  featureName?: string;
}

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  requiredCredits = 1,
  currentBalance = 0,
  featureName = 'this feature',
}: InsufficientCreditsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-scale-up text-slate-900 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/25 ring-4 ring-amber-50">
            <Zap size={30} className="fill-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={12} />
            Trial Credit Limit Reached
          </span>
          <h3 className="text-2xl font-black text-slate-950 tracking-tight">
            You Need {requiredCredits} Credit{requiredCredits > 1 ? 's' : ''}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Your current balance is <span className="font-bold text-rose-600">{currentBalance} credits</span>. Upgrade to Pro or purchase a credit pack to continue using <span className="font-bold text-slate-800">{featureName}</span>.
          </p>
        </div>

        {/* Featured Credit Package Cards */}
        <div className="space-y-3 mb-6">
          <Link
            href="/pricing"
            className="block p-3.5 rounded-2xl border-2 border-indigo-500 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 hover:border-indigo-600 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  🔥 Best Value Pack
                </span>
                <div className="text-base font-black text-slate-900 mt-1">
                  50 Credits • ₹299
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Never expires • ₹5.98 / credit</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          <Link
            href="/pricing"
            className="block p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-black text-slate-900">
                  Pro Power Pack (180 Credits) • ₹799
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Includes 30 Bonus Credits</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                <CreditCard size={16} />
              </div>
            </div>
          </Link>
        </div>

        {/* Benefits list */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-600 space-y-1 mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Instant credit delivery on Razorpay payment</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Credits never expire</span>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href="/pricing"
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
        >
          <span>Get More Credits / Upgrade Pro</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>,
    document.body
  );
}
