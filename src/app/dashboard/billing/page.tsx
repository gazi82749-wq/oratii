'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function BillingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Mock data for UI until Supabase is fully hooked up
  const [billingData, setBillingData] = useState({
    plan: 'Pro',
    status: 'active',
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    speechCount: 12,
    speechLimit: 'Unlimited',
    pptCount: 5,
    pptLimit: 'Unlimited',
    vivaCount: 8,
    vivaLimit: 20,
    payments: [
      { id: 'pay_123', date: new Date().toLocaleDateString(), amount: '₹299', status: 'Success', plan: 'Pro' }
    ]
  });

  useEffect(() => {
    // In production, fetch from /api/billing/status
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F2A93B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto p-6 space-y-8 flex-1 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Billing & Usage</h1>
            <p className="text-slate-500 mt-1">Manage your subscription and track your API usage.</p>
          </div>
          <button 
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-black flex items-center gap-2 cursor-pointer"
          >
            <Zap size={16} /> Upgrade Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Plan Card */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Current Plan</p>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">{billingData.plan}</h2>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-full flex items-center gap-1">
                  <CheckCircle2 size={14} /> Active
                </span>
              </div>
              <p className="text-slate-600 font-medium">Your subscription renews on <span className="text-slate-900 font-bold">{billingData.renewalDate}</span>.</p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button className="px-4 py-2 border border-indigo-200 font-semibold rounded-lg hover:bg-indigo-50 text-slate-700 cursor-pointer">
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="col-span-1 bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Method</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-8 bg-indigo-100 rounded flex items-center justify-center border border-indigo-200">
                <CreditCard className="text-slate-600" size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Razorpay</p>
                <p className="text-xs text-slate-500">Auto-billing enabled</p>
              </div>
            </div>
            <button className="text-[#1B2140] text-sm font-bold hover:text-[#151930] cursor-pointer">Update Payment Method</button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Current Month Usage</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-700">Speech Analyses</span>
                <span className="text-slate-900">{billingData.speechCount} / {billingData.speechLimit}</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#F2A93B] rounded-full" style={{ width: billingData.speechLimit === 'Unlimited' ? '100%' : `${(billingData.speechCount / (billingData.vivaLimit as number)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-700">PPT Analyses</span>
                <span className="text-slate-900">{billingData.pptCount} / {billingData.pptLimit}</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#F2A93B] rounded-full" style={{ width: billingData.pptLimit === 'Unlimited' ? '100%' : '50%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-700">Viva Sessions</span>
                <span className="text-slate-900">{billingData.vivaCount} / {billingData.vivaLimit}</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(billingData.vivaCount / (billingData.vivaLimit as number)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-indigo-200 text-sm text-slate-500">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Invoice</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {billingData.payments.map((p, i) => (
                  <tr key={i} className="border-b border-indigo-100 last:border-0">
                    <td className="py-4 text-slate-900 font-medium">{p.date}</td>
                    <td className="py-4 text-slate-900">{p.amount}</td>
                    <td className="py-4 text-slate-600">{p.plan}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-[#1B2140] hover:text-[#151930] p-1 cursor-pointer">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
