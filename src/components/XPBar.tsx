'use client';
import { GAMIFICATION_LEVELS } from '../lib/constants';

// Animated XP progress bar (Module 9)
export default function XPBar({ xp, level, progress, compact = false }) {
  const levelInfo = GAMIFICATION_LEVELS.find(l => l.level === level) || GAMIFICATION_LEVELS[0];
  const nextLevelInfo = GAMIFICATION_LEVELS.find(l => l.level === level + 1);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{levelInfo.icon}</span>
        <div className="flex-1">
          <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`
              }}
            />
          </div>
        </div>
        <span className="text-[9px] font-bold text-slate-400">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{levelInfo.icon}</span>
          <div>
            <p className="text-xs font-black text-[#151930] uppercase tracking-wider">{levelInfo.name}</p>
            <p className="text-xs text-slate-400">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-[#151930]">{xp} XP</p>
          {nextLevelInfo && (
            <p className="text-[9px] text-slate-400">{nextLevelInfo.xpRequired - xp} XP to Level {level + 1}</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}cc)`
          }}
        >
          {progress > 15 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/90">{progress}%</span>
          )}
        </div>
      </div>

      {nextLevelInfo && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-slate-400 font-bold">{levelInfo.name}</span>
          <span className="text-[9px] text-slate-400 font-bold">{nextLevelInfo.name}</span>
        </div>
      )}
    </div>
  );
}
