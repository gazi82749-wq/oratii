'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Footer() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <footer className="w-full bg-[#0B0E1B] text-slate-300 relative pt-12 sm:pt-16 pb-24 sm:pb-12 px-4 sm:px-6 mt-auto border-t border-slate-800/80 overflow-hidden">
      {/* Top brand gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-[#F2A93B] to-amber-500 opacity-80"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-14">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <Logo className="text-white text-3xl" />
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-5 font-medium">
              The AI-powered speech, communication &amp; job interview coach. Analyze vocal pacing, filler words, daily speech habits, and mock interviews in real-time.
            </p>
            <div className="flex items-center gap-2.5 text-slate-400">
              <a
                href="https://x.com/GaziAbbas217059"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gazi Abbas on X"
                title="Gazi Abbas on X"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 flex items-center justify-center transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/gazi-abbas-3b611a324/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gazi Abbas on LinkedIn"
                title="Gazi Abbas on LinkedIn"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 flex items-center justify-center transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.95 0-1.72.77-1.72 1.72s.77 1.72 1.72 1.72 1.72-.77 1.72-1.72-.77-1.72-1.72-1.72m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
              </a>
              <a
                href="https://github.com/gazi82749-wq/oratii"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Oratii on GitHub"
                title="Oratii on GitHub"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 flex items-center justify-center transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/speech-coach" className="hover:text-amber-400 transition-colors">Speech Coach</Link></li>
              <li><Link href="/interview" className="hover:text-amber-400 transition-colors">Mock Interview Studio</Link></li>
              <li><Link href="/challenge" className="hover:text-amber-400 transition-colors">Daily Challenge</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing Plans</Link></li>
              {user ? (
                <>
                  <li><Link href="/dashboard" rel="nofollow" className="hover:text-amber-400 transition-colors">My Dashboard</Link></li>
                  <li><Link href="/reports" rel="nofollow" className="hover:text-amber-400 transition-colors">Session Reports</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/signup" className="hover:text-amber-400 transition-colors">Get Started Free</Link></li>
                  <li><Link href="/login" className="hover:text-amber-400 transition-colors">Account Login</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/research" className="hover:text-amber-400 transition-colors">Research &amp; Benchmarks</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
              <li>
                <Link href="/#trainer-portal" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-[#F2A93B]" /> For Institutes &amp; Trainers
                </Link>
              </li>
              <li><Link href="/feedback" className="hover:text-amber-400 transition-colors">Feedback &amp; Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Legal &amp; Privacy</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/security" className="hover:text-amber-400 transition-colors">Security &amp; Ethics</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800/80 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm font-medium text-slate-500">© 2026 Oratii Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All AI Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
