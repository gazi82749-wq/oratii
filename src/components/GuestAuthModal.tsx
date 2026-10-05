'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Sparkles, Lock, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function GuestAuthModal({ isOpen, onClose, featureName = 'this feature' }: GuestAuthModalProps) {
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
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full relative animate-scale-up text-slate-900 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Lock Graphic Badge */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-50">
              <Lock size={28} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-900 font-black text-[10px]">
              +10
            </div>
          </div>
        </div>

        {/* Modal Title & Desc */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles size={12} className="text-indigo-600 animate-pulse" />
            <span>Create Free Account</span>
          </div>

          <h3 className="text-2xl font-black text-slate-950 tracking-tight">
            Claim 10 Free Welcome Credits
          </h3>

          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Sign up in 10 seconds to unlock <span className="font-bold text-slate-800">{featureName}</span> and receive 10 free AI analysis credits automatically.
          </p>
        </div>

        {/* Perks Checklist */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span>10 Free Credits credited immediately</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span>Access AI Speech Coach &amp; Mock Interview Studio</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/signup"
            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
          >
            <span>Sign Up Free (Get 10 Credits)</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/login"
            className="w-full py-3 px-6 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl text-center transition-all"
          >
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
