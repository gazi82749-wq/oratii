// src/components/PrivacyConsentModal.tsx
import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, CheckCircle, FileText } from 'lucide-react';
import { savePrivacyConsent, PrivacyConsentState } from '@/lib/privacyConsent';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onConsentGiven: (consent: PrivacyConsentState) => void;
  onDecline: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onConsentGiven,
  onDecline,
}) => {
  const [optOutCloud, setOptOutCloud] = useState(true);

  if (!isOpen) return null;

  const handleAccept = () => {
    const consent = savePrivacyConsent({
      hasConsented: true,
      allowLocalPlaybackOnly: true,
      optOutCloudArchiving: optOutCloud,
    });
    onConsentGiven(consent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Biometric Privacy & Legal Consent</h2>
            <p className="text-xs text-slate-400">Compliant with BIPA (740 ILCS 14/) & GDPR Article 9</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          Vocalize processes your camera and microphone data using <strong className="text-indigo-300">100% On-Device Edge AI</strong>.
          Your video frames and biometric facial coordinates are processed in local GPU memory and are <strong className="text-emerald-400">never uploaded or stored on any cloud server</strong>.
        </p>

        <div className="space-y-3 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-300 mb-5">
          <div className="flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Client-Side Only:</strong> Eye gaze, pose, and facial expressions are converted to anonymous numbers directly inside your browser.</span>
          </div>

          <div className="flex items-start space-x-2.5">
            <EyeOff className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Zero Video Cloud Exposure:</strong> Raw camera feeds never leave your device.</span>
          </div>

          <div className="flex items-start space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Zero Data Selling:</strong> No biometric identifiers or transcripts are retained for third-party AI training.</span>
          </div>
        </div>

        {/* Opt-out cloud toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl mb-6 border border-slate-700/50">
          <div className="pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Enforce Strict Local-Only Playback</span>
            <span className="text-[11px] text-slate-400 block">Discard raw audio/video blobs immediately after session exit</span>
          </div>
          <input
            type="checkbox"
            checked={optOutCloud}
            onChange={(e) => setOptOutCloud(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onDecline}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Decline & Exit
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>I Agree & Enable Practice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
