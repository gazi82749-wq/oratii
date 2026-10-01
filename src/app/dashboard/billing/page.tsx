'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, Zap, CheckCircle2, Coins, ArrowRight, ShieldCheck, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { getUserCredits } from '@/lib/credits';

export default function BillingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(10);
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<string>('Starter (Free)');
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserBilling() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || '');
          const userCreds = await getUserCredits(session.user.id);
          setCredits(userCreds);

          const { data: profile } = await supabase
            .from('profiles')
            .select('current_plan')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.current_plan) {
            const p = profile.current_plan.toLowerCase();
            if (p === 'pro' || p === 'interview_sprint') setCurrentPlan('Pro Credit Pack (40 Credits)');
            else if (p === 'premium' || p === 'season_pass') setCurrentPlan('Premium Credit Pack (200 Credits)');
            else if (p === 'admin_unlimited' || p === 'admin') setCurrentPlan('Admin Unlimited');
            else setCurrentPlan('Starter (10 Monthly Free Credits)');
          }

          const { data: userPayments } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (userPayments && userPayments.length > 0) {
            const mapped = userPayments.map((p: any) => {
              let amt = p.amount || 149;
              if (amt > 2000) amt = amt / 100;
              return {
                id: p.id || p.razorpay_payment_id || p.payment_id || 'PAY-LIVE',
                date: new Date(p.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
                amount: `₹${amt}`,
                plan: p.plan || (amt === 499 ? 'Premium Pack (200 Cr)' : amt === 149 ? 'Pro Pack (40 Cr)' : 'Credit Pack'),
                status: p.status === 'captured' || p.status === 'completed' ? 'Success' : p.status || 'Success',
              };
            });
            setPayments(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load user billing data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserBilling();
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Billing &amp; Credit Balance</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Track your active AI analysis credits and transaction receipts.</p>
          </div>
          <button 
            onClick={() => router.push('/pricing')}
            className="px-5 py-2.5 bg-[#0F1426] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Zap size={15} className="text-[#F2A93B]" /> Get More Credits
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Credits Card */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Credit Tier</p>
                  <h2 className="text-2xl font-black text-slate-950 mt-1">{currentPlan}</h2>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Pay-As-You-Go Active
                </span>
              </div>
              
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900">Current Available Balance</div>
                  <div className="text-3xl font-black text-amber-950 font-mono mt-0.5 flex items-center gap-2">
                    <Coins size={24} className="text-[#F2A93B]" />
                    {credits} Credits
                  </div>
                </div>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-[#F2A93B] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Top Up <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Account: <strong className="text-slate-800">{userEmail}</strong></span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck size={14} /> 1 Credit = 1 AI Speech Analysis
              </span>
            </div>
          </div>

          {/* Payment Method Info Card */}
          <div className="col-span-1 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Instant Payment Gateway</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                  <CreditCard className="text-indigo-900" size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">UPI &amp; Razorpay</p>
                  <p className="text-xs text-slate-500 font-medium">Zero auto-debit, instant top-up</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Purchased credits never expire. Top up anytime with Google Pay, PhonePe, Paytm, UPI ID, or credit/debit cards.
              </p>
            </div>

            <button 
              onClick={() => router.push('/pricing')}
              className="mt-6 text-indigo-900 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Pricing Tiers →
            </button>
          </div>
        </div>

        {/* Credit Usage Matrix Info */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Coins size={18} className="text-[#F2A93B]" /> Credit Consumption Rate
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-bold text-slate-400 uppercase">AI Speech Coach</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">1 Credit / Session</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Vocal pacing, STT transcript &amp; tone audit</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-bold text-slate-400 uppercase">Presentation Slide Audit</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">1 Credit / Deck</div>
              <div className="text-[11px] text-slate-500 mt-0.5">PDF / PPTX visual slide analysis</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-bold text-slate-400 uppercase">Interactive Viva / Interview</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">2 Credits / Session</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Real-time voice examiner &amp; scorecard</div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
            <History size={18} className="text-indigo-900" /> Payment &amp; Credit Pack Receipts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Credit Pack</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {payments.map((p, i) => (
                  <tr key={p.id || i} className="border-b border-slate-100 last:border-0">
                    <td className="py-3.5 text-slate-900 font-bold">{p.date}</td>
                    <td className="py-3.5 text-slate-900 font-mono font-bold">{p.amount}</td>
                    <td className="py-3.5 text-slate-700 font-medium">{p.plan}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold rounded-md">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No payment receipts yet. Free Starter credits (10/mo) are active on your account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
