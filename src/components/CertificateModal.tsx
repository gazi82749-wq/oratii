import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Share2, Award, Sparkles, Printer, CheckCircle2, ShieldCheck, Cpu, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  userName: string;
  dayNumber?: number;
  completedDate?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  badgeName,
  badgeIcon,
  badgeDescription,
  userName,
  dayNumber,
  completedDate,
}: CertificateModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const dateStr = completedDate 
    ? new Date(completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const certId = `ORATII-MODERN-${(dayNumber || 1).toString().padStart(2, '0')}-${(userName || 'USER').substring(0, 3).toUpperCase()}-2026`;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 font-sans">
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-[#060814]/90 backdrop-blur-lg print:hidden" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-[#0B0E27] rounded-3xl shadow-2xl flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:bg-white certificate-container z-10 overflow-hidden animate-scale-up border border-slate-800">
        
        {/* Top Control Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 print:hidden bg-[#0A0D20] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-[#F2A93B] to-amber-500 text-[#0B0E27] flex items-center justify-center font-black text-sm shadow-md">
              ✨
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-2 tracking-tight">
                Modern Verified Credential
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ID: {certId}
                </span>
              </h2>
              <p className="text-[11px] font-medium text-slate-400">Official Oratii AI Digital Certificate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 via-[#F2A93B] to-amber-500 hover:from-amber-300 text-[#0B0E27] rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate View Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:overflow-visible print:p-0 bg-[#060814] print:bg-white custom-scrollbar">
          
          {/* Ultra-Modern Dark Glassmorphic Certificate Sheet */}
          <div className="certificate-content relative w-full aspect-[1.414/1] max-w-[1020px] mx-auto bg-gradient-to-br from-[#0D1130] via-[#0B0E27] to-[#151935] border border-slate-800 rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col justify-between shadow-[0_0_60px_-15px_rgba(242,169,59,0.2)] print:shadow-none print:border-none print:aspect-auto print:h-screen print:w-full text-white overflow-hidden">
            
            {/* Glowing Top-Right Radial Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Accent Border Line */}
            <div className="absolute inset-0 rounded-3xl border border-amber-400/20 pointer-events-none" />

            {/* Top Modern Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-5 relative z-10">
              <div className="flex items-center gap-3">
                <Logo className="text-white text-2xl sm:text-3xl" />
                <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase hidden sm:inline">
                  AI Communication Platform
                </span>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151930] text-[#F2A93B] text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-500/30 shadow-sm">
                  <Cpu size={12} className="text-amber-400" /> AI Verified Credential
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Issued: {dateStr}</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="my-auto py-4 text-center space-y-5 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest mb-2">
                  <Sparkles size={12} /> Executive Mastery Credential
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                  Certificate of Mastery
                </h1>
              </div>

              {/* Recipient Line */}
              <div className="space-y-1 my-2">
                <p className="text-xs sm:text-sm font-semibold text-slate-400 italic">This official digital certificate is awarded to</p>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-amber-200 to-[#F2A93B] bg-clip-text text-transparent inline-block pb-1 px-4">
                  {userName || 'Oratii Scholar'}
                </h2>
              </div>

              {/* Program Wording */}
              <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  For successfully mastering <span className="font-extrabold text-amber-400">Day {dayNumber || 1}</span> of the intensive <span className="font-extrabold text-white">20-Day Public Speaking & Presentation Challenge</span>, achieving verified top-tier vocal clarity and speech performance.
                </p>

                {/* Bento Grid Verified Metrics Block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
                  <div className="bg-[#151930]/80 border border-slate-800 rounded-2xl p-3 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Module Badge</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{badgeIcon}</span>
                      <span className="text-xs font-black text-white truncate">{badgeName}</span>
                    </div>
                  </div>

                  <div className="bg-[#151930]/80 border border-slate-800 rounded-2xl p-3 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Vocal Performance</span>
                    <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> 94 / 100 Score
                    </div>
                  </div>

                  <div className="bg-[#151930]/80 border border-slate-800 rounded-2xl p-3 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Filler Word Control</span>
                    <div className="text-xs font-black text-amber-400">
                      Optimal (&lt; 2 / min)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer & Hologram Chip */}
            <div className="border-t border-slate-800/80 pt-4 flex items-end justify-between text-xs relative z-10">
              
              {/* Left Director Signature */}
              <div className="flex flex-col text-left space-y-1">
                <div className="font-mono font-bold text-slate-200 text-sm sm:text-base">
                  Dr. E. Vance, Ph.D.
                </div>
                <div className="w-36 sm:w-44 border-t border-slate-700 pt-1">
                  <p className="font-extrabold text-amber-400 text-[10px]">Head of AI Speech Lab</p>
                  <p className="text-[9px] text-slate-400 font-medium">Oratii Systems Inc.</p>
                </div>
              </div>

              {/* Center Holographic Verification Shield Badge */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-[#F2A93B] to-emerald-400 rounded-2xl rotate-3 shadow-lg opacity-80 animate-pulse" />
                  <div className="absolute inset-0.5 bg-[#0B0E27] rounded-2xl flex flex-col items-center justify-center text-white border border-amber-400/40">
                    <ShieldCheck size={20} className="text-[#F2A93B] mb-0.5" />
                    <span className="text-[7px] font-black tracking-widest text-slate-300 uppercase">SECURE</span>
                    <span className="text-[8px] font-black text-emerald-400">VERIFIED</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold mt-1">ID: {certId}</span>
              </div>

              {/* Right Verification Director Signature */}
              <div className="flex flex-col text-right space-y-1">
                <div className="font-mono font-bold text-slate-200 text-sm sm:text-base">
                  A. R. Sharma
                </div>
                <div className="w-36 sm:w-44 border-t border-slate-700 pt-1">
                  <p className="font-extrabold text-amber-400 text-[10px]">Director of Credentialing</p>
                  <p className="text-[9px] text-slate-400 font-medium">Oratii AI Verification Panel</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
