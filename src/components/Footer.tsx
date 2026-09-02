import Link from 'next/link';
import { Logo } from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0D1020] text-slate-300 relative pt-12 sm:pt-16 pb-8 px-4 sm:px-6 mt-auto border-t border-indigo-900/40">
      {/* Top brand gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-[#F2A93B] to-purple-600 opacity-70"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-950/30 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 mb-10 sm:mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-5">
              <Logo className="text-white text-3xl" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6 font-medium">
              The AI-powered speech, presentation & job interview coach. Analyze vocal pacing, filler words, slide decks, and mock interviews in real-time.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/speech-coach" className="hover:text-[#F2A93B] transition-colors">Speech Coach</Link></li>
              <li><Link href="/interview" className="hover:text-[#F2A93B] transition-colors">AI Job Interview Studio</Link></li>
              <li><Link href="/presentation" className="hover:text-[#F2A93B] transition-colors">Slide Deck & Viva Studio</Link></li>
              <li><Link href="/challenge" className="hover:text-[#F2A93B] transition-colors">20-Day Speech Challenge</Link></li>
              <li><Link href="/reports" className="hover:text-[#F2A93B] transition-colors">Reports & Analytics</Link></li>
              <li><Link href="/pricing" className="hover:text-[#F2A93B] transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/about" className="hover:text-[#F2A93B] transition-colors">About Us</Link></li>
              <li><Link href="/feedback" className="hover:text-[#F2A93B] transition-colors">Feedback & Support</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#F2A93B] transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Legal & Privacy</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/privacy" className="hover:text-[#F2A93B] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#F2A93B] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#F2A93B] transition-colors">Security & Ethics</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">© 2026 Oratii Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All AI Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
