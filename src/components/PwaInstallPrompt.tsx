'use client';

import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, ShieldCheck, CheckCircle2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is already running in installed standalone app mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIos(isIosDevice);

    // Clear legacy localStorage lock so prompt is never permanently blocked
    localStorage.removeItem('oratii_pwa_prompt_dismissed');

    const isSessionDismissed = sessionStorage.getItem('oratii_pwa_prompt_dismissed_session') === 'true';

    // 1. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isSessionDismissed) {
        setShowPrompt(true);
      }
    };

    // 2. Listen for appinstalled event (fired when user completes installation to home screen)
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowPrompt(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Custom event listener triggered from navbar / mobile drawer
    const handleOpenCustomInstall = () => {
      setShowPrompt(true);
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (isIosDevice) {
        setShowGuideModal(true);
      } else {
        setShowGuideModal(true);
      }
    };
    window.addEventListener('open-pwa-install', handleOpenCustomInstall);

    // 4. Auto-show floating install prompt after 600ms if not in standalone & not session dismissed
    let timer: NodeJS.Timeout;
    let autoDismissTimer: NodeJS.Timeout;

    if (!isSessionDismissed) {
      timer = setTimeout(() => {
        setShowPrompt(true);

        // Auto-dismiss after 12 seconds if no action taken
        autoDismissTimer = setTimeout(() => {
          setShowPrompt(false);
        }, 12000);
      }, 600);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenCustomInstall);
      if (timer) clearTimeout(timer);
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setShowPrompt(false);
          setShowGuideModal(false);
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA prompt error:', err);
      } finally {
        setInstalling(false);
      }
    } else if (isIos) {
      setShowGuideModal(true);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('oratii_pwa_prompt_dismissed_session', 'true');
  };

  if (isStandalone || (!showPrompt && !showGuideModal)) {
    return null;
  }

  return (
    <>
      {/* ─── DIRECT 1-TAP MOBILE INSTALL BANNER ─── */}
      {showPrompt && !showGuideModal && (
        <div className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
          <div className="bg-[#151930] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-indigo-500/40 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 blur-2xl rounded-full pointer-events-none"></div>

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#151930] font-black text-lg flex items-center justify-center shrink-0 shadow-lg border border-amber-300">
                O
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-white">Add Oratii to Home Screen</h4>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Mobile App
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  1-Tap install to phone home screen. Zero storage (0 MB).
                </p>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                Verified App
              </span>
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[#151930] font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} /> {installing ? 'Installing...' : 'Install App Directly'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTALLATION MODAL ─── */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 print:hidden"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add to Phone Home Screen</h3>
                  <p className="text-[11px] text-slate-500 font-medium">100% Free • Safe Web App (0 MB)</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {deferredPrompt ? (
              /* Direct 1-Tap Native Install for Android/Chrome */
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-slate-600 font-medium">
                  Tap below to instantly add the Oratii app icon to your phone&apos;s home screen.
                </p>
                <button
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-[#151930] font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={18} /> {installing ? 'Installing...' : '1-Tap Install Now'}
                </button>
              </div>
            ) : isIos ? (
              /* iPhone / iPad Safari Step-by-Step */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p className="font-semibold text-slate-800">
                    Tap the <strong className="text-indigo-600">Share</strong> button <Share size={15} className="inline mx-1 text-indigo-600" /> in Safari&apos;s bottom toolbar.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p className="font-semibold text-slate-800">
                    Scroll down and tap <strong className="text-indigo-600">&quot;Add to Home Screen&quot;</strong> <PlusSquare size={15} className="inline mx-1 text-indigo-600" />.
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
              /* Android Chrome Direct Action */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                  <p className="font-semibold text-slate-800">
                    Chrome will prompt <strong className="text-indigo-600">&quot;Add Oratii to Home screen&quot;</strong> automatically.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-emerald-900 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>The app icon will appear directly on your phone home screen!</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" /> Google &amp; Apple Web Standard
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
