import React from 'react';
import { BarChart3, Construction } from 'lucide-react';

export default function MockInterviewAnalyticsPage() {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
        <BarChart3 size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Mock Interview Analytics</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8">
        The data analytics dashboard for Mock Interviews is currently being compiled.
      </p>
      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
        <Construction size={16} /> Coming Soon
      </div>
    </div>
  );
}
