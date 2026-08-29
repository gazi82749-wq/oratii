'use client';
import { useState } from 'react';

// AI Improvement Roadmap panel for results pages (Module 7)
export default function ImprovementRoadmap({ plans, onGeneratePlan, isLoading }) {
  const [activeDuration, setActiveDuration] = useState(7);

  const durations = [
    { days: 7, label: '7-Day Plan' },
    { days: 14, label: '14-Day Plan' },
    { days: 30, label: '30-Day Plan' }
  ];

  const currentPlan = plans?.[activeDuration] || null;

  return (
    <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-[#151930] uppercase tracking-wider">AI Improvement Roadmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">Personalized plan based on your session results</p>
        </div>
        <span className="text-xl">ðŸ—ºï¸</span>
      </div>

      {/* Duration Tabs */}
      <div className="flex gap-2 mb-5">
        {durations.map(d => (
          <button
            key={d.days}
            onClick={() => setActiveDuration(d.days)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeDuration === d.days
                ? 'roadmap-tab-active'
                : 'bg-indigo-100 text-slate-500 hover:bg-indigo-200'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Plan Content */}
      {currentPlan ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {currentPlan.map((dayPlan, idx) => (
            <div key={idx} className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white text-xs font-black flex items-center justify-center">
                  {dayPlan.day}
                </span>
                <span className="text-xs font-black text-[#151930] uppercase tracking-wide">Day {dayPlan.day}</span>
                {dayPlan.xpReward && (
                  <span className="ml-auto text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">+{dayPlan.xpReward} XP</span>
                )}
              </div>
              <ul className="space-y-1.5">
                {dayPlan.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded border border-indigo-300 flex-shrink-0 mt-0.5 flex items-center justify-center text-[8px]">
                      {task.completed ? 'âœ“' : ''}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <span className="text-3xl block mb-3">ðŸŽ¯</span>
          <p className="text-xs font-bold text-slate-600 mb-1">No plan generated yet</p>
          <p className="text-xs text-slate-400 mb-4">Generate a personalized improvement roadmap based on your results</p>
          <button
            onClick={() => onGeneratePlan?.(activeDuration)}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              isLoading
                ? 'bg-indigo-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#151930] text-white hover:bg-slate-800 active:scale-[0.99] shadow-md'
            }`}
          >
            {isLoading ? 'Generating...' : `Generate ${activeDuration}-Day Plan`}
          </button>
        </div>
      )}
    </div>
  );
}
