'use client';
import { BADGES } from '../lib/constants';

// Achievement badges grid display (Module 9)
export default function BadgeGrid({ unlockedBadges = [], compact = false }) {
  const allBadges = BADGES.map(b => ({
    ...b,
    unlocked: unlockedBadges.includes(b.id)
  }));

  if (compact) {
    // Show only unlocked badges in a row
    const unlocked = allBadges.filter(b => b.unlocked);
    return (
      <div className="flex flex-wrap gap-1.5">
        {unlocked.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No badges yet</span>
        ) : (
          unlocked.map(badge => (
            <span
              key={badge.id}
              className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-sm badge-unlocked"
              title={`${badge.name}: ${badge.description}`}
            >
              {badge.icon}
            </span>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-[#151930] uppercase tracking-wider">Achievement Badges</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {unlockedBadges.length} / {BADGES.length} unlocked
          </p>
        </div>
        <span className="text-xl">ðŸ…</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
        {allBadges.map(badge => (
          <div
            key={badge.id}
            className={`group relative flex flex-col items-center p-3 rounded-2xl border transition-all ${
              badge.unlocked
                ? 'bg-indigo-50 border-indigo-200 badge-unlocked'
                : 'bg-indigo-50/50 border-indigo-100 badge-locked'
            }`}
          >
            <span className="text-2xl mb-1.5">{badge.icon}</span>
            <p className="text-[9px] font-bold text-center text-slate-600 leading-tight">{badge.name}</p>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-40">
              <div className="bg-[#151930] text-white text-xs p-2.5 rounded-xl shadow-lg text-center">
                <p className="font-bold mb-0.5">{badge.name}</p>
                <p className="text-slate-400">{badge.description}</p>
                {badge.unlocked && <p className="text-emerald-400 mt-1 font-bold">âœ“ Unlocked</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
