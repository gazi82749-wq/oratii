import React from 'react';
import { Flame, Construction } from 'lucide-react';

export default function AdminChallengePage() {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <Flame size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Daily Habit Admin</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8">
        The data dashboard for Daily Habits and Streaks is currently under construction. It will be available in a future update.
      </p>
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
        <Construction size={16} /> Coming Soon
      </div>
    </div>
  );
}
