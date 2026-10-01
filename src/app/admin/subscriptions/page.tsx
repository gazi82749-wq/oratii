'use client';

import { useState, useEffect } from 'react';
import { Check, Edit, Plus, Star, Sparkles, Coins, Clock, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface PlanDefinition {
  id: string;
  name: string;
  price: number;
  credits: number;
  currency: string;
  validity: string;
  badge: string;
  features: string[];
  userCount: number;
  isPopular?: boolean;
  comingSoon?: boolean;
}

export default function SubscriptionsPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition | null>(null);
  const [userCounts, setUserCounts] = useState({ starter: 0, pro: 0, premium: 0, enterprise: 0 });
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
          const counts = { starter: 0, pro: 0, premium: 0, enterprise: 0 };
          json.users.forEach((u: any) => {
            const p = (u.current_plan || 'free').toLowerCase();
            if (p === 'pro' || p === 'interview_sprint') counts.pro++;
            else if (p === 'premium' || p === 'season_pass') counts.premium++;
            else if (p === 'enterprise' || p === 'b2b') counts.enterprise++;
            else counts.starter++;
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
      id: 'free_starter',
      name: 'Starter Pack',
      price: 0,
      credits: 10,
      currency: '₹',
      validity: 'Monthly',
      badge: 'Zero Risk',
      features: [
        '10 Free Credits every month',
        'Full Access to AI Speech Coach',
        'Vocal Pacing & Filler Word Analysis',
        'Instant AI Scorecard & Feedback',
        'Never Expires (Use anytime)'
      ],
      userCount: userCounts.starter,
      isPopular: false,
      comingSoon: false,
    },
    {
      id: 'interview_sprint',
      name: 'Pro Credit Pack',
      price: 149,
      credits: 40,
      currency: '₹',
      validity: 'Never Expires',
      badge: 'Coming Soon',
      features: [
        '40 Total Credits (₹3.72 / credit)',
        'Full Access to AI Speech Coach',
        'Instant UPI Payment Activation',
        'Never Expires (Use anytime)'
      ],
      userCount: userCounts.pro,
      isPopular: true,
      comingSoon: true,
    },
    {
      id: 'season_pass',
      name: 'Premium Credit Pack',
      price: 499,
      credits: 200,
      currency: '₹',
      validity: 'Never Expires',
      badge: 'Coming Soon',
      features: [
        '200 Total Credits (₹2.49 / credit)',
        'Full Access to AI Speech Coach',
        'Save 33% vs standard credit rate',
        'Never Expires (Use anytime)'
      ],
      userCount: userCounts.premium,
      isPopular: false,
      comingSoon: true,
    }
  ];

  const totalGrossRevenue = (userCounts.pro * 149) + (userCounts.premium * 499) + (userCounts.enterprise * 1999);
  const proRevenue = userCounts.pro * 149;
  const premiumRevenue = userCounts.premium * 499;
  const totalSubscribers = userCounts.starter + userCounts.pro + userCounts.premium + userCounts.enterprise;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscriptions & Credit Packs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage pay-as-you-go credit packages, pricing tiers, and user allocations aligned with the live pricing page.</p>
        </div>
        <button 
          onClick={() => { setSelectedPlan(null); setShowEditModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={14} /> Create Credit Pack
        </button>
      </div>

      {/* Credit Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${plan.isPopular ? 'border-amber-400 dark:border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-indigo-200 dark:border-slate-800'} p-6 flex flex-col`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
                <Star size={10} className="fill-current text-slate-950" /> Most Popular
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {plan.badge}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{plan.currency}{plan.price}</span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">one-time</span>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/20">
                  <Coins size={12} className="text-[#F2A93B]" />
                  {plan.credits} Credits Included
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock size={11} /> {plan.validity}
                </span>
              </div>

              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-2 font-semibold">{plan.userCount} active users on this pack</div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Included Features:
              </p>
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
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-slate-800 text-slate-700 dark:text-indigo-300 rounded-lg text-[13px] font-medium hover:bg-indigo-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Edit size={14} /> Edit Pack Tiers
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* B2B Institutional Licensing Showcase */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Building2 size={12} /> B2B &amp; Campus License Manager
            </div>
            <h3 className="text-lg font-bold text-white">University Placement Cells &amp; Corporate Cohorts</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Bulk credit allocations, batch performance dashboards, and institutional volume licenses.
            </p>
          </div>
          <button 
            onClick={() => alert('B2B Institutional Licensing configuration modal ready.')}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
          >
            Manage Institutional Quotes
          </button>
        </div>
      </div>

      {/* Live Revenue Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-[#F2A93B]" /> Credit Pack Revenue Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Gross Revenue</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">₹{totalGrossRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Pro Packs (₹149)</div>
            <div className="text-xl font-bold text-[#F2A93B] dark:text-indigo-400 font-mono mt-1">₹{proRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Premium Packs (₹499)</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">₹{premiumRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Registered Accounts</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{totalSubscribers}</div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedPlan ? `Edit ${selectedPlan.name}` : 'Create New Credit Pack'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pack Name</label>
                <input type="text" defaultValue={selectedPlan?.name || ''} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price (₹)</label>
                  <input type="number" defaultValue={selectedPlan?.price || 149} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Credits Included</label>
                  <input type="number" defaultValue={selectedPlan?.credits || 40} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">Save Credit Pack</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
