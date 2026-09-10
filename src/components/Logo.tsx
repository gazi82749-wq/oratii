import React from 'react';

export const Logo = ({ className = "text-2xl text-slate-900" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-[0.3em] ${className}`}>
      {/* Icon Only SVG - perfectly scaled via em */}
      <svg className="w-auto shrink-0" style={{ height: '1.8em' }} viewBox="20 40 220 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F2A93B"/>
            <stop offset="100%" stopColor="#2FBF9F"/>
          </linearGradient>
          <clipPath id="badgeClip">
            <rect x="30" y="50" width="200" height="200" rx="52"/>
          </clipPath>
        </defs>

        <g>
          <path d="M 55 235 L 55 275 L 95 240 Z" fill="#1B2140"/>
          <rect x="30" y="50" width="200" height="200" rx="52" fill="#1B2140"/>
          <g clipPath="url(#badgeClip)">
            <path d="M 178 50 L 230 50 L 230 102 Z" fill="#FFFFFF" opacity="0.10"/>
          </g>
          <g>
            <rect x="66"  y="145" width="16" height="60"  rx="8" fill="url(#waveGrad)"/>
            <rect x="92"  y="115" width="16" height="120" rx="8" fill="url(#waveGrad)"/>
            <rect x="118" y="95"  width="16" height="160" rx="8" fill="url(#waveGrad)"/>
            <rect x="144" y="125" width="16" height="100" rx="8" fill="url(#waveGrad)"/>
            <rect x="170" y="150" width="16" height="50"  rx="8" fill="url(#waveGrad)"/>
          </g>
        </g>
      </svg>

      {/* HTML Typography for perfect crispness */}
      <div className="flex flex-col justify-center">
        <span className="font-black tracking-tighter leading-none" style={{ fontSize: '1.25em' }}>
          Orat<span className="text-[#F2A93B]">ii</span>
        </span>
        <span className="font-bold tracking-[0.2em] text-slate-500 mt-[0.1em] whitespace-nowrap" style={{ fontSize: '0.35em' }}>
          SAY IT WELL. SHOW IT WELL.
        </span>
      </div>
    </div>
  );
};
