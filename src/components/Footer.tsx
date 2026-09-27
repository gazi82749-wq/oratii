import Link from 'next/link';
import { Logo } from './Logo';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0E1B] text-slate-300 relative pt-12 sm:pt-16 pb-24 sm:pb-12 px-4 sm:px-6 mt-auto border-t border-slate-800/80 overflow-hidden">
      {/* Top brand gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-[#F2A93B] to-amber-500 opacity-80"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-14">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <Logo className="text-white text-3xl" />
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-medium">
              The AI-powered speech, communication &amp; job interview coach. Analyze vocal pacing, filler words, daily speech habits, and mock interviews in real-time.
            </p>
          </div>
          
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/speech-coach" className="hover:text-amber-400 transition-colors">Speech Coach</Link></li>
              <li><Link href="/interview" className="hover:text-amber-400 transition-colors">Mock Interview</Link></li>
              <li><Link href="/challenge" className="hover:text-amber-400 transition-colors">Daily Challenge</Link></li>
              <li><span className="opacity-50 blur-[0.3px] cursor-not-allowed pointer-events-none select-none text-slate-500 inline-flex items-center">Presentation Practice <span className="text-[9px] bg-slate-800 text-slate-500 px-1 py-0.5 rounded ml-1 border border-slate-800">SOON</span></span></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Free Tools &amp; Guides</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/tools/wpm-calculator" className="hover:text-amber-400 transition-colors">Speech WPM Calculator</Link></li>
              <li><Link href="/tools/filler-word-counter" className="hover:text-amber-400 transition-colors">Filler Word Counter</Link></li>
              <li><Link href="/for/software-engineers" className="hover:text-amber-400 transition-colors">Software Engineer Practice</Link></li>
              <li><Link href="/for/ielts-speaking" className="hover:text-amber-400 transition-colors">IELTS Speaking Practice</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/signup?role=trainer" className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1.5"><GraduationCap size={15} /> For Institutes &amp; Trainers</Link></li>
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
