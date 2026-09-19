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
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <Logo className="text-white text-3xl" />
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-medium">
              The AI-powered speech, presentation & job interview coach. Analyze vocal pacing, filler words, live presentations, and mock interviews in real-time.
            </p>
          </div>
          
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/speech-coach" className="hover:text-amber-400 transition-colors">Speech Coach</Link></li>
              <li><Link href="/interview" className="hover:text-amber-400 transition-colors">AI Job Interview Studio</Link></li>
              <li><Link href="/presentation" className="hover:text-amber-400 transition-colors">Presentation Practice</Link></li>
              <li><Link href="/challenge" className="hover:text-amber-400 transition-colors">20-Day Speech Challenge</Link></li>
              <li><Link href="/reports" className="hover:text-amber-400 transition-colors">Reports & Analytics</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/signup?role=trainer" className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1.5"><GraduationCap size={15} /> For Institutes & Trainers</Link></li>
              <li><Link href="/feedback" className="hover:text-amber-400 transition-colors">Feedback & Support</Link></li>
              <li><Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-400">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/security" className="hover:text-amber-400 transition-colors">Security & Ethics</Link></li>
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
