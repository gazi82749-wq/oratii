'use client';
import { useState, useEffect } from 'react';
import { getGamificationSummary } from '../lib/gamification';

import { Flame, Hourglass } from 'lucide-react';

export default function StreakBadge() {
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [inDanger, setInDanger] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch streak from gamification engine
    try {
      const summary = getGamificationSummary();
      setStreak(summary.streak || 0);
      setInDanger(false); 
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!mounted || streak === 0) return null;

  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full shadow-sm transition-all cursor-default hover:shadow-md hover:bg-orange-100"
      title={inDanger ? "Your streak is about to end! Practice now!" : `${streak} Day Streak!`}
    >
      <span className={`text-orange-500 ${inDanger ? 'animate-pulse' : ''}`}>
        {inDanger ? <Hourglass size={16} /> : <Flame size={16} className="fill-orange-500" />}
      </span>
      <span className="font-semibold text-orange-700 tabular-nums text-sm">
        {streak}
      </span>
    </div>
  );
}
