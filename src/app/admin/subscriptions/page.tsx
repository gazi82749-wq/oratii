'use client';

import { useState, useEffect } from 'react';
import { Check, Edit, Trash2, Plus, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface PlanDefinition {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  userCount: number;
  isPopular?: boolean;
}

export default function SubscriptionsPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition | null>(null);
  const [userCounts, setUserCounts] = useState({ free: 0, pro: 0, enterprise: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlanCounts() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/users?limit=1000', {
          headers: {
            'authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const json = await res.json();
        if (json && json.users) {
          const counts = { free: 0, pro: 0, enterprise: 0 };
          json.users.forEach((u: any) => {
            const p = (u.current_plan || 'free').toLowerCase();
            if (p === 'pro') counts.pro++;
            else if (p === 'enterprise') counts.enterprise++;
            else counts.free++;
          });
          setUserCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load plan counts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlanCounts();
  }, []);

  const plans: PlanDefinition[] = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      currency: '₹',
      interval: 'month',
      features: [
        '3 AI Speech Analyses / day',
        'Basic Slide Deck Evaluation',
        'Standard Filler Word Detection',
        'Community Support'
      ],
      userCount: userCounts.free,
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      price: 499,
      currency: '₹',
      interval: 'month',
      features: [
        'Unlimited AI Speech Coach',
        'Multimodal Vision Posture & Eye Contact',
        'Full Presentation PPT Deck Audits',
        'Interactive AI Viva & Mock Interviews',
        'Detailed PDF Performance Reports',
        'Priority AI Waterfall Processing'
      ],
      userCount: userCounts.pro,
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Tier',
      price: 1999,
      currency: '₹',
      interval: 'month',
      features: [
        'Everything in Pro Tier',
        'Unlimited Custom AI Prompts & Scenarios',
        'Team Dashboard & Admin Control',
        'Custom Viva Question Bank Integration',
        'Dedicated 24/7 Priority Support'
      ],
      userCount: userCounts.enterprise,
      isPopular: false
    }
  ];

  const totalMRR = (userCounts.pro * 499) + (userCounts.enterprise * 1999);
  const proMRR = userCounts.pro * 499;
  const enterpriseMRR = userCounts.enterprise * 1999;
  const totalSubscribers = userCounts.free + userCounts.pro + userCounts.enterprise;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscriptions — Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage subscription plans, pricing, and active user allocations.</p>
        </div>
        <button 
          onClick={() => { setSelectedPlan(null); setShowEditModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={14} /> Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${plan.isPopular ? 'border-indigo-300 dark:border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-indigo-200 dark:border-slate-800'} p-6 flex flex-col`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-900 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
                <Star size={10} className="fill-current text-amber-400" /> Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{plan.currency}{plan.price}</span>
                <span className="text-[13px] text-slate-500 dark:text-slate-400">/{plan.interval}</span>
              </div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">{plan.userCount} active users</div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-[13px] text-slate-700 dark:text-indigo-300">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-indigo-100 dark:border-slate-800">
              <button
                onClick={() => { setSelectedPlan(plan); setShowEditModal(true); }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-slate-800 text-slate-700 dark:text-indigo-300 rounded-lg text-[13px] font-medium hover:bg-indigo-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit size={14} /> Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Revenue Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-[#F2A93B]" /> Live Revenue Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Calculated MRR</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">₹{totalMRR.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Pro Revenue</div>
            <div className="text-xl font-bold text-[#F2A93B] dark:text-indigo-400 font-mono mt-1">₹{proMRR.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Enterprise Revenue</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">₹{enterpriseMRR.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Platform Users</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{totalSubscribers}</div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedPlan ? `Edit ${selectedPlan.name}` : 'Create New Plan'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan Name</label>
                <input type="text" defaultValue={selectedPlan?.name || ''} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price (₹)</label>
                  <input type="number" defaultValue={selectedPlan?.price || 499} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interval</label>
                  <select className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-[13px] font-semibold transition-colors">Save Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
