'use client';

import React from 'react';

export type BackgroundVariant = 
  | 'hero' 
  | 'speech' 
  | 'slides' 
  | 'viva' 
  | 'interview' 
  | 'cta' 
  | 'global'
  | 'narrative';

interface ModernBackgroundAnimationProps {
  variant?: BackgroundVariant;
  className?: string;
  children?: React.ReactNode;
}

export default function ModernBackgroundAnimation({
  variant = 'global',
  className = '',
  children,
}: ModernBackgroundAnimationProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Animation Canvas Layers */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        
        {/* HERO VARIANT */}
        {variant === 'hero' && (
          <>
            {/* Multi-layered Glowing Light Orbs */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-gradient-to-tr from-[#F2A93B]/20 via-amber-400/10 to-indigo-500/15 rounded-full blur-[140px] animate-float-blob-1" />
            <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-teal-400/15 rounded-full blur-[130px] animate-float-blob-2" />
            <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-indigo-500/12 rounded-full blur-[140px] animate-float-blob-3" />

            {/* Futuristic Tech Grid Lines Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]" 
              style={{
                backgroundImage: `radial-gradient(#0F1426 1px, transparent 1px), linear-gradient(to right, rgba(15,20,38,0.1) 1px, transparent 1px)`,
                backgroundSize: '32px 32px, 64px 64px'
              }}
            />

            {/* Glowing Scan Line Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F2A93B]/40 to-transparent animate-laser-scan-horizontal" />
          </>
        )}

        {/* NARRATIVE VARIANT */}
        {variant === 'narrative' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white" />
            <div 
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(#F2A93B 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px'
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[300px] bg-amber-300/10 rounded-full blur-[120px] animate-pulse-glow" />
          </>
        )}

        {/* SPEECH COACH VARIANT */}
        {variant === 'speech' && (
          <>
            <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#F2A93B]/15 rounded-full blur-[130px] animate-float-blob-1" />
            <div className="absolute -bottom-24 -right-24 w-[450px] h-[450px] bg-orange-400/10 rounded-full blur-[120px] animate-float-blob-2" />
            
            {/* Animated Soundwave Pattern */}
            <div className="absolute inset-x-0 top-0 bottom-0 opacity-[0.03] flex items-center justify-around overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#0F1426] rounded-full animate-waveform"
                  style={{
                    height: `${40 + (i % 5) * 30}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: `${1.2 + (i % 3) * 0.4}s`
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* SLIDE ANALYZER VARIANT */}
        {variant === 'slides' && (
          <>
            <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-teal-400/15 rounded-full blur-[140px] animate-float-blob-2" />
            <div className="absolute -bottom-24 -left-20 w-[450px] h-[450px] bg-sky-400/12 rounded-full blur-[130px] animate-float-blob-3" />

            {/* Modern Matrix Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(to right, #0F1426 1px, transparent 1px), linear-gradient(to bottom, #0F1426 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            {/* Laser scanning horizontal accent */}
            <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent animate-laser-scan-horizontal" />
          </>
        )}

        {/* VIVA DEFENSE VARIANT */}
        {variant === 'viva' && (
          <>
            <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-500/12 rounded-full blur-[140px] animate-float-blob-3" />
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#F2A93B]/15 rounded-full blur-[130px] animate-float-blob-1" />

            {/* Floating Subtle Circles */}
            <div className="absolute top-10 left-1/4 w-32 h-32 border border-purple-400/20 rounded-full animate-float-slow" />
            <div className="absolute bottom-12 right-1/4 w-48 h-48 border border-amber-400/20 rounded-full animate-float-slow-reverse" />
          </>
        )}

        {/* INTERVIEW STUDIO VARIANT */}
        {variant === 'interview' && (
          <>
            <div className="absolute -top-28 left-1/3 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] animate-float-blob-2" />
            <div className="absolute -bottom-28 -right-20 w-[450px] h-[450px] bg-emerald-400/12 rounded-full blur-[130px] animate-float-blob-1" />

            {/* Node Network Dots */}
            <div 
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `radial-gradient(#4F46E5 2px, transparent 2px)`,
                backgroundSize: '36px 36px'
              }}
            />
          </>
        )}

        {/* CTA VARIANT */}
        {variant === 'cta' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F1426] via-[#151930] to-[#0A0D1A]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#F2A93B]/25 via-amber-500/15 to-indigo-600/25 rounded-full blur-[160px] animate-pulse-glow" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-400/20 rounded-full blur-[100px] animate-float-blob-1" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-float-blob-2" />

            {/* Glowing Accent Shimmer Dots */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-[#F2A93B] animate-ping" />
              <div className="absolute top-1/3 right-20 w-3 h-3 rounded-full bg-amber-300 animate-pulse" />
              <div className="absolute bottom-16 left-1/4 w-2 h-2 rounded-full bg-indigo-300 animate-ping" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-20 right-1/3 w-2.5 h-2.5 rounded-full bg-[#F2A93B] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
          </>
        )}

        {/* GLOBAL / DEFAULT VARIANT */}
        {variant === 'global' && (
          <>
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-slate-200/40 dark:bg-slate-800/30 rounded-full blur-[140px] animate-float-blob-1" />
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#F2A93B]/10 rounded-full blur-[140px] animate-float-blob-2" />
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(#0F1426 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
          </>
        )}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
