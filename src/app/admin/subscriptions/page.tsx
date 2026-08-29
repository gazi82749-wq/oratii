'use client';

import { useState } from 'react';
import { Check, Edit, Trash2, Plus, Star, Sparkles } from 'lucide-react';
import { subscriptionPlans } from '@/lib/admin/data';

export default function SubscriptionsPage() {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscriptions — Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage subscription plans and pricing.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-900 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm">
          <Plus size={14} /> Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${plan.isPopular ? 'border-indigo-300 dark:border-indigo-900 shadow-lg shadow-indigo-500/10' : 'border-indigo-200 dark:border-slate-800'} p-6 flex flex-col`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-900 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <Star size={10} /> Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">${plan.price}</span>
                <span className="text-[13px] text-slate-500 dark:text-slate-400">/{plan.interval}</span>
              </div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">{plan.userCount} active subscribers</div>
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
                onClick={() => setShowEditModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-slate-800 text-slate-700 dark:text-indigo-300 rounded-lg text-[13px] font-medium hover:bg-indigo-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit size={14} /> Edit
              </button>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-[#F2A93B]" /> Revenue Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Total MRR</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">$19,780</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Pro Revenue</div>
            <div className="text-xl font-bold text-[#F2A93B] dark:text-indigo-500 font-mono mt-1">$5,928</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Enterprise Revenue</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">$2,842</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Subscribers</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">370</div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan Name</label>
                <input type="text" defaultValue="Pro" className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price ($)</label>
                  <input type="number" defaultValue={19} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
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
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-indigo-900 hover:bg-indigo-900 text-white rounded-lg text-[13px] font-semibold transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
