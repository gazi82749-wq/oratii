'use client';

import { useState, useEffect } from 'react';
import { Bot, Mic, FileText, Video, Save, RotateCcw, AlertTriangle, Cpu, Zap, Activity, CheckCircle2, ShieldAlert, MonitorPlay, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const defaultPrompts = {
  speech: `You are an elite Executive Speech Coach. Analyze the timed transcript, pacing (WPM), and filler word density. Provide an objective, constructive qualitative evaluation without sugarcoating. Calculate an honest toneScore (0-100), identify genuine weaknesses and strengths, provide actionable coaching exercises, and output timestamped feedback markers.`,
  ppt: `You are a professional presentation analyst. Evaluate the uploaded PowerPoint presentation for content quality, visual design, slide structure, and engagement potential. Provide scores from 0-100 for content, delivery readiness, and engagement.`,
  viva: `You are a knowledgeable examiner conducting a viva voce examination. Ask relevant, progressively challenging questions about the given subject. Evaluate the student's answers for correctness, depth, and clarity.`,
  interview: `You are a strict, professional hiring manager conducting a technical or behavioral interview. Ask targeted questions, evaluate responses strictly, and provide actionable feedback on candidate performance.`,
  presentationMode: `You are a live presentation evaluator. Observe the real-time transcript and delivery. Provide immediate, concise feedback on clarity, engagement, and structure.`,
  bodyLanguage: `You are an expert non-verbal communication coach. Analyze the user's posture, eye contact, and gestures. Provide specific advice to improve stage presence and confidence.`
};

interface AIModelUsage {
  id: string;
  name: string;
  provider: string;
  dailyUsed: number;
  dailyLimit: number;
  rpmLimit: number;
  status: 'healthy' | 'warning' | 'exhausted';
  tier: string;
}

export default function AISettingsPage() {
  const [speechPrompt, setSpeechPrompt] = useState(defaultPrompts.speech);
  const [pptPrompt, setPptPrompt] = useState(defaultPrompts.ppt);
  const [vivaPrompt, setVivaPrompt] = useState(defaultPrompts.viva);
  const [interviewPrompt, setInterviewPrompt] = useState(defaultPrompts.interview);
  const [presentationPrompt, setPresentationPrompt] = useState(defaultPrompts.presentationMode);
  const [bodyLanguagePrompt, setBodyLanguagePrompt] = useState(defaultPrompts.bodyLanguage);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(80); // Alert when usage >= 80%

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('ai_settings').select('*');
      if (!error && data && data.length > 0) {
        data.forEach(setting => {
          if (setting.feature_key === 'speech_coach') setSpeechPrompt(setting.prompt_text);
          else if (setting.feature_key === 'ppt_analyzer') setPptPrompt(setting.prompt_text);
          else if (setting.feature_key === 'viva_voce') setVivaPrompt(setting.prompt_text);
          else if (setting.feature_key === 'interview_evaluator') setInterviewPrompt(setting.prompt_text);
          else if (setting.feature_key === 'presentation_mode') setPresentationPrompt(setting.prompt_text);
          else if (setting.feature_key === 'body_language') setBodyLanguagePrompt(setting.prompt_text);
        });
      }
    }
    fetchSettings();
  }, []);

  const [aiModels, setAiModels] = useState<AIModelUsage[]>([
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google AI', dailyUsed: 0, dailyLimit: 500, rpmLimit: 15, status: 'healthy', tier: 'Primary Multimodal' },
    { id: 'cerebras-llama3.3', name: 'Cerebras Llama-3.3 (70B)', provider: 'Cerebras Ultra-Fast', dailyUsed: 0, dailyLimit: 1000, rpmLimit: 30, status: 'healthy', tier: 'Waterfall 1st Priority' },
    { id: 'groq-llama3.3', name: 'Groq Llama-3.3 (70B)', provider: 'Groq Cloud', dailyUsed: 0, dailyLimit: 1000, rpmLimit: 30, status: 'healthy', tier: 'Waterfall 2nd Priority' },
    { id: 'gpt-4o', name: 'GPT-4o / 4o Mini', provider: 'OpenAI', dailyUsed: 0, dailyLimit: 500, rpmLimit: 50, status: 'healthy', tier: 'Backup Reasoning' },
    { id: 'openrouter-free', name: 'OpenRouter Free Net', provider: 'OpenRouter', dailyUsed: 0, dailyLimit: 200, rpmLimit: 10, status: 'healthy', tier: 'Ultimate Safety Net' },
  ]);

  useEffect(() => {
    async function loadRealCounts() {
      // Calculate today's start ISO timestamp
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const isoToday = todayStart.toISOString();

      // Query real activity created today from Admin Sessions API
      let sessionCounts: Record<string, number> = {};

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/sessions?type=all', {
          headers: {
            'authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const json = await res.json();
        if (json && json.sessions) {
          json.sessions.forEach((s: any) => {
            if (new Date(s.createdAt) >= todayStart) {
              const st = s.sessionType || 'other';
              sessionCounts[st] = (sessionCounts[st] || 0) + 1;
            }
          });
        }
      } catch (err) {
        console.error('Failed to load session counts in ai-settings:', err);
      }

      const realPptCount = sessionCounts['ppt'] || sessionCounts['presentation'] || 0;
      const speechCount = sessionCounts['speech'] || 0;
      const interviewCount = sessionCounts['interview'] || 0;
      const vivaCount = sessionCounts['viva'] || 0;
      const presentationCount = sessionCounts['presentation'] || 0;
      const bodyLanguageCount = sessionCounts['body_language'] || 0;

      setAiModels((prev) =>
        prev.map((m) => {
          let used = 0;
          if (m.id === 'gemini-2.5-flash') used = (realPptCount * 2) + presentationCount + bodyLanguageCount;
          if (m.id === 'cerebras-llama3.3') used = (vivaCount * 2) + interviewCount;
          if (m.id === 'groq-llama3.3') used = speechCount;

          const percentage = m.dailyLimit > 0 ? Math.round((used / m.dailyLimit) * 100) : 0;
          let status: 'healthy' | 'warning' | 'exhausted' = 'healthy';
          if (percentage >= 95) status = 'exhausted';
          else if (percentage >= warningThreshold) status = 'warning';

          return { ...m, dailyUsed: used, status };
        })
      );
    }
    loadRealCounts();
  }, [warningThreshold]);

  const endingSoonModels = aiModels.filter((m) => {
    const pct = (m.dailyUsed / m.dailyLimit) * 100;
    return pct >= warningThreshold;
  });

  const handleUpdateLimit = (id: string, newLimit: number) => {
    setAiModels((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const limit = Math.max(1, newLimit);
          const pct = (m.dailyUsed / limit) * 100;
          let status: 'healthy' | 'warning' | 'exhausted' = 'healthy';
          if (pct >= 95) status = 'exhausted';
          else if (pct >= warningThreshold) status = 'warning';
          return { ...m, dailyLimit: limit, status };
        }
        return m;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Prepare the rows to upsert
    const updates = [
      { feature_key: 'speech_coach', prompt_text: speechPrompt },
      { feature_key: 'ppt_analyzer', prompt_text: pptPrompt },
      { feature_key: 'viva_voce', prompt_text: vivaPrompt },
      { feature_key: 'interview_evaluator', prompt_text: interviewPrompt },
      { feature_key: 'presentation_mode', prompt_text: presentationPrompt },
      { feature_key: 'body_language', prompt_text: bodyLanguagePrompt }
    ];

    const { error } = await supabase
      .from('ai_settings')
      .upsert(updates, { onConflict: 'feature_key' });

    setIsSaving(false);
    
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      console.error("Failed to save AI settings:", error);
      alert("Failed to save settings. Make sure the database migration was run.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Settings & Model Usage Limits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure system prompts, AI models, and real-time usage limit alerts.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1B2140] hover:shadow-glow text-white disabled:opacity-50'
          }`}
        >
          <Save size={14} /> {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* 🚨 AI Model Usage Limit Ending Soon Alert Banner */}
      {endingSoonModels.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
                ⚠️ Usage Limit Warning: {endingSoonModels.length} AI Model{endingSoonModels.length > 1 ? 's' : ''} Ending Soon!
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                The daily usage limits for the following AI models are reaching capacity. Automatic fallback waterfall will trigger if depleted.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {endingSoonModels.map((m) => {
              const pct = Math.round((m.dailyUsed / m.dailyLimit) * 100);
              return (
                <div key={m.id} className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                    <span className="text-slate-500">{m.dailyUsed} / {m.dailyLimit} Requests ({pct}%)</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md font-bold uppercase text-[10px] ${
                    pct >= 95 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white'
                  }`}>
                    {pct >= 95 ? 'Exhausted' : 'Ending Soon'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📊 Live AI Models Usage Limit Tracker Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu size={18} className="text-[#F2A93B]" /> Live AI Model Usage & Rate Limits
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Alert Threshold:</span>
            <select
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value={70}>Alert at 70%</option>
              <option value={80}>Alert at 80%</option>
              <option value={90}>Alert at 90%</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aiModels.map((m) => {
            const pct = Math.min(100, Math.round((m.dailyUsed / m.dailyLimit) * 100));
            const isWarning = pct >= warningThreshold && pct < 95;
            const isExhausted = pct >= 95;

            return (
              <div
                key={m.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border p-5 transition-all space-y-4 ${
                  isExhausted
                    ? 'border-red-400 dark:border-red-500/50 shadow-md'
                    : isWarning
                    ? 'border-amber-400 dark:border-amber-500/50 shadow-md'
                    : 'border-indigo-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{m.provider}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{m.tier}</span>
                  </div>
                  {isExhausted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold">
                      <ShieldAlert size={12} /> Limit Ended
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 rounded-lg text-xs font-bold animate-pulse">
                      <AlertTriangle size={12} /> Ending Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                      <CheckCircle2 size={12} /> Healthy
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Daily Requests</span>
                    <span className="font-mono text-slate-900 dark:text-white">{m.dailyUsed} / {m.dailyLimit} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-indigo-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isExhausted ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Daily Limit Configurator Input */}
                <div className="pt-2 border-t border-indigo-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Max Daily Limit:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={m.dailyLimit}
                      onChange={(e) => handleUpdateLimit(m.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-md text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-400">reqs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Prompts */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot size={18} className="text-[#F2A93B]" /> System Prompts Configuration
          </h2>
        </div>

        {/* Speech Coach Prompt */}
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5" style={{'--stripe-color':'#3b82f6','--stripe-color-to':'#60a5fa'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Mic size={14} className="text-blue-500" /> Speech Coach Prompt
            </label>
            <button onClick={() => setSpeechPrompt(defaultPrompts.speech)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <textarea
            value={speechPrompt}
            onChange={(e) => setSpeechPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* PPT Coach Prompt */}
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5" style={{'--stripe-color':'#fa7c42','--stripe-color-to':'#818cf8'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={14} className="text-[#F2A93B]" /> PPT Coach Prompt
            </label>
            <button onClick={() => setPptPrompt(defaultPrompts.ppt)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <textarea
            value={pptPrompt}
            onChange={(e) => setPptPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Viva AI Prompt */}
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5" style={{'--stripe-color':'#06b6d4','--stripe-color-to':'#22d3ee'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Video size={14} className="text-cyan-500" /> Viva AI Prompt
            </label>
            <button onClick={() => setVivaPrompt(defaultPrompts.viva)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <textarea
            value={vivaPrompt}
            onChange={(e) => setVivaPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Interview Evaluator Prompt */}
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5" style={{'--stripe-color':'#8b5cf6','--stripe-color-to':'#a78bfa'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={14} className="text-purple-500" /> Interview Evaluator Prompt
            </label>
            <button onClick={() => setInterviewPrompt(defaultPrompts.interview)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <textarea
            value={interviewPrompt}
            onChange={(e) => setInterviewPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Presentation Mode Prompt */}
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5" style={{'--stripe-color':'#10b981','--stripe-color-to':'#34d399'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MonitorPlay size={14} className="text-emerald-500" /> Presentation Mode Prompt
            </label>
            <button onClick={() => setPresentationPrompt(defaultPrompts.presentationMode)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <textarea
            value={presentationPrompt}
            onChange={(e) => setPresentationPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Body Language Prompt */}
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5" style={{'--stripe-color':'#f43f5e','--stripe-color-to':'#fb7185'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck size={14} className="text-rose-500" /> Body Language & Posture Prompt
            </label>
            <button onClick={() => setBodyLanguagePrompt(defaultPrompts.bodyLanguage)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <textarea
            value={bodyLanguagePrompt}
            onChange={(e) => setBodyLanguagePrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* Model Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5">Default Model & Token Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Default Model</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold">
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
              <option value="cerebras-llama3.3">Cerebras Llama-3.3 (70B)</option>
              <option value="groq-llama3.3">Groq Llama-3.3 (70B)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Creativity Temperature ({temperature})</label>
            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="mt-3 w-full accent-indigo-900" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Tokens Output</label>
            <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="mt-1 w-full px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono" />
          </div>
        </div>
      </div>
    </div>
  );
}
