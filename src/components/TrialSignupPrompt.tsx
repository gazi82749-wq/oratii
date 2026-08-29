'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { X, Sparkles } from 'lucide-react';

export default function TrialSignupPrompt({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) {
          setIsAnonymous(true);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen || !isAnonymous) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-indigo-200 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-fade-up">
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-slate-500 hover:bg-indigo-200 hover:text-slate-900 transition-colors"
          >
            <X size={16} />
          </button>
          
          <div className="w-12 h-12 bg-indigo-200 text-[#1B2140] rounded-full flex items-center justify-center text-xl mb-6">
            <Sparkles size={24} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            You just got a free taste of Oratii.
          </h2>
          <p className="text-slate-600 text-base mb-8 leading-relaxed">
            Create a free account to save this and keep practicing.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link href="/signup" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-center hover:bg-black transition-all shadow-sm">
              Sign up free
            </Link>
            <Link href="/login" className="w-full py-3 bg-white border border-indigo-200 text-slate-900 font-bold rounded-xl text-center hover:bg-indigo-50 transition-all shadow-sm">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
