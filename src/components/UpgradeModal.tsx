'use client';

import { X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-indigo-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-indigo-200 text-[#1B2140] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Upgrade Required</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            You’ve reached your usage limit for <span className="font-semibold text-slate-700">{featureName}</span> on the Free plan. Upgrade to a premium plan to unlock unlimited access.
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => {
                onClose();
                router.push('/pricing');
              }}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition-all"
            >
              View Pricing Plans
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-white text-slate-600 hover:bg-indigo-50 font-bold rounded-xl border border-indigo-200 transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
