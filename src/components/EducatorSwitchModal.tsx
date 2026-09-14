'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface EducatorSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
}

export default function EducatorSwitchModal({ isOpen, onClose, userId }: EducatorSwitchModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchToEducator = async () => {
    setLoading(true);
    setError(null);

    try {
      if (userId) {
        // Upgrade profile role to 'trainer'
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'trainer',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.warn('Profile role upgrade notice:', updateError.message);
        }
      }

      onClose();
      window.location.href = '/trainer/onboarding';
    } catch (err: any) {
      setError(err?.message || 'Failed to switch account mode.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-indigo-100 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#151930] to-indigo-900 text-[#F2A93B] flex items-center justify-center shadow-md shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black uppercase tracking-wider mb-0.5">
              <Sparkles size={11} className="text-amber-500" /> Educator Studio
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Switch to Educator Mode</h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
          You are currently in Learner Mode. Would you like to activate your <strong>Educator / Institute Studio</strong> to manage student batches and auto-grade homework?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* Feature List */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 space-y-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Create 6-Digit WhatsApp Student Batch Codes
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Automated Speech & Viva Homework Grading
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Student Pacing & Filler Word Analytics
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-amber-500 shrink-0" /> 100% Free Partner Academy Access (₹0)
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={handleSwitchToEducator}
            disabled={loading}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Activating Educator Hub...
              </>
            ) : (
              <>
                Activate Educator Studio (₹0) <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
          >
            Stay as Learner
          </button>
        </div>
      </div>
    </div>
  );
}
