'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { type Difficulty } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  hard: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newCategory, setNewCategory] = useState('System Design');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('medium');

  async function loadQuestions() {
    setLoading(true);
    const { data } = await supabase
      .from('viva_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const mapped = data.map((q: any) => ({
        id: q.id,
        question: q.question,
        subject: q.subject || 'Computer Science',
        category: q.category || 'General',
        difficulty: (q.difficulty || 'medium') as Difficulty,
        timesUsed: q.times_used || 0,
      }));
      setQuestions(mapped);
    } else {
      setQuestions([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    await supabase.from('viva_questions').insert([{
      question: newQuestion,
      subject: newSubject,
      category: newCategory,
      difficulty: newDifficulty,
      times_used: 0
    }]);
    setNewQuestion('');
    setShowAddModal(false);
    loadQuestions();
  };

  const handleDeleteQuestion = async (id: string) => {
    await supabase.from('viva_questions').delete().eq('id', id);
    loadQuestions();
  };

  const filtered = questions.filter((q) => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchSearch && matchDifficulty;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Viva AI — Question Bank</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage questions used in viva practice sessions.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-900 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search questions or subjects..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map((q) => (
          <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-[#F2A93B]/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <HelpCircle size={16} className="text-[#F2A93B] dark:text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 dark:text-white leading-relaxed">{q.question}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{q.subject}</span>
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{q.category}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${difficultyColors[q.difficulty]}`}>{q.difficulty}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 block sm:inline">Used {q.timesUsed} times</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-indigo-100 dark:border-slate-800 mt-2 sm:mt-0">
                <button className="w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-indigo-300 transition-colors">
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  title="Delete question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400 dark:text-slate-500">No questions found.</div>
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Question</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Question</label>
                <textarea
                  rows={3}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter the question..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. Data Structures"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. Algorithms"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                  className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAddQuestion} className="px-4 py-2 bg-indigo-900 hover:bg-indigo-900 text-white rounded-lg text-[13px] font-semibold transition-colors">Add Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
