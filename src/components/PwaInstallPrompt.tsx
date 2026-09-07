'use client';

import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check standalone mode (if app is already installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIos(isIosDevice);

    // Check if dismissed recently (7 days)
    const dismissedTime = localStorage.getItem('oratii_pwa_prompt_dismissed');
    const isRecentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime, 10)) < 7 * 86400 * 1000;

    // 1. Capture Chromium install event if available
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Custom event listener so any button click (e.g. from navbar/menu) opens the prompt/guide immediately
    const handleOpenCustomInstall = () => {
      setShowPrompt(true);
      setShowIosGuide(true);
    };
    window.addEventListener('open-pwa-install', handleOpenCustomInstall);

    // 3. Automatically show bottom prompt on mobile/desktop after 1.5s if not standalone & not dismissed
    let timer: NodeJS.Timeout;
    if (!isStandaloneMode && !isRecentlyDismissed) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleOpenCustomInstall);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Open step-by-step installation guide modal
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('oratii_pwa_prompt_dismissed', Date.now().toString());
  };

  if (isStandalone || (!showPrompt && !showIosGuide)) {
    return null;
  }

  return (
    <>
      {/* ─── FLOATING PWA INSTALL BANNER (MOBILE & DESKTOP) ─── */}
      {showPrompt && !showIosGuide && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
          <div className="bg-[#151930] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-indigo-500/40 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 blur-2xl rounded-full pointer-events-none"></div>

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#151930] font-black text-lg flex items-center justify-center shrink-0 shadow-lg border border-amber-300">
                O
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-white">Add Oratii to Mobile</h4>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    0 MB • Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  Instant 1-tap app access. No Play Store or APK download needed.
                </p>
              </div>
            </div>

            {/* Bottom Row Actions */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                Google &amp; Apple Web Standard
              </span>
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[#151930] font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <Download size={14} /> Add Web App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP-BY-STEP INSTALLATION GUIDE MODAL ─── */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 print:hidden"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Install Oratii Web App</h3>
                  <p className="text-[11px] text-slate-500 font-medium">100% Safe • Zero phone storage (0 MB)</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {isIos ? (
              /* iPhone / iPad Safari Step-by-Step */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p className="font-semibold text-slate-800">
                    Tap the <strong className="text-indigo-600">Share</strong> button <Share size={14} className="inline mx-1 text-indigo-600" /> in Safari’s bottom toolbar.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p className="font-semibold text-slate-800">
                    Scroll down and tap <strong className="text-indigo-600">&quot;Add to Home Screen&quot;</strong> <PlusSquare size={14} className="inline mx-1 text-indigo-600" />.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <p className="font-semibold text-slate-800">
                    Tap <strong className="text-indigo-600">&quot;Add&quot;</strong> in top-right. Done!
                  </p>
                </div>
              </div>
            ) : (
              /* Android Chrome / Edge / Mobile Step-by-Step */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p className="font-semibold text-slate-800">
                    Tap the <strong>3 dots menu (⋮)</strong> in Chrome&apos;s top right corner.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p className="font-semibold text-slate-800">
                    Select <strong className="text-indigo-600">&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-emerald-900 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Oratii will appear on your phone home screen like a native mobile app!</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" /> Google &amp; Apple Web Standard
              </span>
              <button
                onClick={() => setShowIosGuide(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
