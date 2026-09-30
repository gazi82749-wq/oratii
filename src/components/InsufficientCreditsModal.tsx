'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Zap, Sparkles, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { CREDIT_PACKAGES } from '@/lib/credits';
import { initializePayment } from '@/lib/razorpay';

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
  const [buyingPlanId, setBuyingPlanId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
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

  const handleBuy = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    setBuyingPlanId(pkg.id);
    try {
      await initializePayment(pkg.id, pkg.name, pkg.price, () => {
        onClose();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      });
    } catch (err) {
      console.error('Payment launch error:', err);
    } finally {
      setBuyingPlanId(null);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-scale-up text-slate-900 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Header Graphic */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 ring-4 ring-amber-50">
              <Zap size={30} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white font-black text-[10px]">
              0
            </div>
          </div>
        </div>

        {/* Modal Heading */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={12} className="text-rose-500 animate-pulse" />
            <span>5 Credits Finished • Top-Up Required</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Purchase Practice Credits
          </h3>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
            Your 10 free credits are finished ({currentBalance} remaining, {requiredCredits} required for <span className="font-bold text-slate-800">{featureName}</span>). Purchase credits below to continue!
          </p>
        </div>

        {/* Packages Grid */}
        <div className="space-y-3 mb-6">
          {CREDIT_PACKAGES.filter((p) => p.id !== 'free').map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                pkg.popular
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">{pkg.name}</h4>
                  {pkg.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{pkg.credits} AI Speech &amp; Viva Drills</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">₹{pkg.price}</span>
                </div>
                <button
                  onClick={() => handleBuy(pkg)}
                  disabled={buyingPlanId === pkg.id}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {buyingPlanId === pkg.id ? (
                    'Processing...'
                  ) : (
                    <>
                      Buy Now
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Perks Checklist */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 mb-5 space-y-1.5 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
            <span>Instant Razorpay top-up (UPI, GPay, Cards, NetBanking)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
            <span>Credits never expire &amp; roll over automatically</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Link
            href="/pricing"
            onClick={onClose}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View Full Pricing &amp; Plans <ArrowRight size={12} />
          </Link>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
