// src/components/CalibrationModal.tsx
import React, { useState, useEffect } from 'react';
import { Sliders, Mic, Sun, UserCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  onComplete: (calibrationData: { noiseFloor: number; lightingScore: number }) => void;
  stream: MediaStream | null;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onComplete,
  stream,
}) => {
  const [step, setStep] = useState<'mic' | 'light' | 'posture' | 'done'>('mic');
  const [progress, setProgress] = useState(0);
  const [noiseFloor, setNoiseFloor] = useState(12);
  const [lightingScore, setLightingScore] = useState(88);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    setStep('mic');

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setStep('done');
          return 100;
        }
        if (prev === 25) setStep('light');
        if (prev === 65) setStep('posture');
        return prev + 5;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Environmental Calibration</h3>
            <p className="text-xs text-slate-400">Calibrating your mic & room lighting for accurate scoring</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="space-y-4 mb-6">
          <div className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
            step === 'mic' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'
          }`}>
            <Mic className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-semibold block">1. Ambient Audio Calibration</span>
              <span>Measuring background room noise threshold...</span>
            </div>
            {progress > 30 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
          </div>

          <div className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
            step === 'light' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'
          }`}>
            <Sun className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-semibold block">2. Room Lighting Level</span>
              <span>Scanning camera contrast & exposure...</span>
            </div>
            {progress > 65 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : progress > 30 ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : null}
          </div>

          <div className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
            step === 'posture' || step === 'done' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'
          }`}>
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-semibold block">3. Seating Posture Zero-Point</span>
              <span>Setting shoulder & head alignment baseline...</span>
            </div>
            {step === 'done' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : progress > 65 ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : null}
          </div>
        </div>

        <button
          disabled={step !== 'done'}
          onClick={() => onComplete({ noiseFloor, lightingScore })}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 ${
            step === 'done'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>{step === 'done' ? 'Calibration Complete - Start Practice' : 'Calibrating...'}</span>
        </button>
      </div>
    </div>
  );
};
