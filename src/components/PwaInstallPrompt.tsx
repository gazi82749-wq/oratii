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

    const checkInstalled = async () => {
      let installed =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      if (!installed && 'getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          if (relatedApps && relatedApps.length > 0) {
            installed = true;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setIsStandalone(installed);
      return installed;
    };
    
    checkInstalled();

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIos(isIosDevice);

    // Detect mobile devices (Android, iOS, etc)
    const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    // Clear legacy localStorage lock so prompt is never permanently blocked
    localStorage.removeItem('oratii_pwa_prompt_dismissed');

    const isSessionDismissed = sessionStorage.getItem('oratii_pwa_prompt_dismissed_session') === 'true';

    // 1. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // DO NOT show the popup on mobile devices based on user request
      if (!isSessionDismissed && !isMobileDevice) {
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



    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenCustomInstall);
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
        <div className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
          <div className="bg-white/95 text-slate-900 p-4 sm:p-5 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-white/60 backdrop-blur-2xl relative overflow-hidden ring-1 ring-slate-900/5">
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
              title="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3.5 pr-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#1B2140] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-[0_8px_16px_-6px_rgba(27,33,64,0.5)] border border-slate-700/50">
                O
              </div>
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">Add to Home Screen</h4>
                  <span className="bg-indigo-100 text-indigo-700 font-bold uppercase px-2 py-0.5 rounded-full text-[9px] tracking-wider">
                    App
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Install Oratii for a faster, full-screen mobile experience (0 MB).
                </p>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 relative z-10">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                Verified
              </span>
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="px-5 py-2.5 bg-[#1B2140] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} className={installing ? "animate-bounce" : ""} /> 
                {installing ? 'Installing...' : 'Install App'}
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
