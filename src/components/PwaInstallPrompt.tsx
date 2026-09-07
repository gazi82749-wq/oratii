'use client';

import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, ShieldCheck, Zap, Sparkles } from 'lucide-react';

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
    // Check if already installed as PWA (standalone mode)
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check if iOS
      const ua = window.navigator.userAgent;
      const isIosDevice = /iphone|ipad|ipod/i.test(ua);
      setIsIos(isIosDevice);

      // Check if previously dismissed recently
      const dismissedTime = localStorage.getItem('oratii_pwa_prompt_dismissed');
      const isRecentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime, 10)) < 7 * 86400 * 1000;

      // Handle beforeinstallprompt event (Android / Chrome / Edge)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        if (!isRecentlyDismissed && !isStandaloneMode) {
          // Show after 3 seconds on page load
          setTimeout(() => setShowPrompt(true), 3000);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Show iOS prompt if iOS and not standalone and not dismissed
      if (isIosDevice && !isStandaloneMode && !isRecentlyDismissed) {
        setTimeout(() => setShowPrompt(true), 4000);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted installation prompt');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback instruction popup for desktop/other browsers
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
      {/* ─── FLOATING PWA INSTALL BANNER (BOTTOM FIXED) ─── */}
      {showPrompt && !showIosGuide && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#151930] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-indigo-500/30 backdrop-blur-xl relative overflow-hidden">
            {/* Glow Sphere */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none"></div>

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#151930] font-black text-lg flex items-center justify-center shrink-0 shadow-lg border border-amber-300">
                O
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white">Add Oratii to Home Screen</h4>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    0 MB • Safe
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-snug">
                  Fast 1-tap access. Runs smoothly like a native app with zero phone storage space.
                </p>
              </div>
            </div>

            {/* Trust badge */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                Verified Web App • HTTPS Encrypted
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

      {/* ─── IOS / MANUAL SAFARI INSTRUCTIONS MODAL ─── */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
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
                  <h3 className="text-base font-extrabold text-slate-900">How to Install Oratii</h3>
                  <p className="text-[11px] text-slate-500 font-medium">100% Safe • No App Store or APK download</p>
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
              /* iOS Safari Instructions */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p className="font-semibold text-slate-800">
                    Tap the <strong className="text-indigo-600">Share</strong> icon <Share size={14} className="inline mx-1 text-indigo-600" /> in Safari’s bottom toolbar.
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
              /* Chrome / Android / Desktop fallback */
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
