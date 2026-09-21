'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  X, 
  QrCode, 
  Sparkles, 
  ChevronDown, 
  Copy, 
  Check, 
  ArrowRight, 
  Mic, 
  FileText, 
  MessageSquare, 
  Coins,
  Clock,
  CheckCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ModernBackgroundAnimation from '@/components/ui/ModernBackgroundAnimation';
import Footer from '@/components/Footer';
import ReferralCard from '@/components/ReferralCard';
import { supabase } from '@/lib/supabaseClient';
import { CREDIT_PACKAGES, getUserCredits } from '@/lib/credits';
import { initializePayment } from '@/lib/razorpay';

export default function PricingClient() {
  const router = useRouter();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showAllSachetsModal, setShowAllSachetsModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [adminUpiId, setAdminUpiId] = useState('Oratii@upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getUserCredits(session.user.id).then((credits) => setUserCredits(credits));
      }
    });

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 5000);
      }
    }
  }, []);

  const handlePurchase = async (pack: any) => {
    if (pack.id === 'free_starter') {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signup');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setSelectedPack(pack);
    setIsProcessing(true);

    try {
      await initializePayment(pack.id, pack.name, pack.price, (newCredits) => {
        setUserCredits(newCredits);
        setShowSuccessBanner(true);
        setIsProcessing(false);
        setTimeout(() => setShowSuccessBanner(false), 5000);
      });
    } catch (err) {
      console.error('Razorpay payment error, opening UPI QR modal:', err);
      setIsQRModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const upiAmount = selectedPack?.price || 299;
  const upiString = encodeURIComponent(`upi://pay?pa=${adminUpiId}&pn=Oratii AI&am=${upiAmount}&cu=INR`);

  const mainPackages = CREDIT_PACKAGES.filter(p => ['free_starter', 'sachet_25', 'value_50'].includes(p.id));

  const faqs = [
    {
      q: 'How do Oratii credits work?',
      a: 'Credits are simple: 1 Credit = 1 Speech Audio Analysis, 1 Credit = 1 Presentation Practice Session, and 2 Credits = 1 AI Viva Defense Q&A Session. You only pay for what you actually use.'
    },
    {
      q: 'Do paid credits ever expire?',
      a: 'No! Paid credit packs come with lifetime validity. Your credits never expire, so you can use them whenever you need to prepare for a speech or presentation.'
    },
    {
      q: 'What is included in the Free Trial?',
      a: 'When you sign up, you automatically receive 5 Free Credits with full access to test out Speech Analysis, Presentation Practice, and AI Viva Defense sessions.'
    },
    {
      q: 'How fast are credits added after payment?',
      a: 'Instantly! As soon as your UPI, GPay, Paytm, or Card payment is completed in the Razorpay popup, your credits are added to your account within seconds.'
    },
    {
      q: 'Can I top up more credits anytime?',
      a: 'Yes, you can top up anytime. New credits are added directly to your existing credit balance.'
    }
  ];

  return (
    <ModernBackgroundAnimation variant="global" className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* Subtle Ambient Depth */}
      <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vw] bg-slate-200/30 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[15%] right-[-5%] w-[35vw] h-[35vw] bg-amber-100/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Instant Success Banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-600 text-white text-center py-3 px-4 text-sm font-bold shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Sparkles size={18} className="animate-spin" />
          <span>Payment Successful! Your credits have been updated.</span>
        </div>
      )}

      <div className="flex-1 pb-20 relative">

        {/* Compact Hero Section */}
        <section className="relative pt-10 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto z-10">
          
          {/* Eyebrow Badge */}
          <div className="ui-badge-pill mb-4">
            <Coins size={14} className="text-[#F2A93B]" />
            <span>Pay-As-You-Go • Instant UPI & Card Activation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mb-4 leading-tight">
            Simple credit packs for <span className="text-[#F2A93B]">unmatched confidence.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-5 leading-relaxed font-medium">
            Buy credits once, use them whenever you present. Zero monthly subscriptions, zero hidden charges.
          </p>

          {/* Cost Anchoring Comparison Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 text-xs font-extrabold mb-6 shadow-2xs">
            <span className="text-amber-600">💡</span>
            <span>Human Coaching: <strong>₹3,000 / hr</strong></span>
            <span className="text-amber-400">•</span>
            <span className="text-amber-900">Oratii AI Drills: <strong>From ₹3.96 / drill</strong></span>
          </div>

          {/* User Credit Balance Display */}
          {userCredits !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-800 text-xs font-bold block sm:inline-block ml-0 sm:ml-2">
              <span className="text-slate-500 font-normal">Active Balance:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-amber-50 text-amber-950 font-extrabold text-xs border border-amber-200/80">
                <Coins size={14} className="text-[#F2A93B]" />
                {userCredits} Credits
              </span>
            </div>
          )}
        </section>

        {/* 3 Core Pricing Cards Grid (Visible Above The Fold) */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {mainPackages.map((pack) => {
              const isPopular = pack.popular;
              const isFree = pack.price === 0;

              return (
                <div
                  key={pack.id}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                    isPopular 
                      ? 'ui-card-dark border-2 border-[#F2A93B] shadow-2xl lg:-translate-y-2 hover:-translate-y-2.5 relative overflow-visible mt-4 lg:mt-0' 
                      : 'ui-card hover:-translate-y-1'
                  }`}
                >
                  {isPopular && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 blur-2xl rounded-full pointer-events-none"></div>
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-[#F2A93B] to-orange-500 text-[#0F1426] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-20 whitespace-nowrap shrink-0 max-w-max">
                        <Sparkles size={12} className="shrink-0" />
                        <span className="whitespace-nowrap shrink-0">{pack.badge}</span>
                      </div>
                    </>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-xl font-black tracking-tight ${isPopular ? 'text-white' : 'text-slate-950'}`}>
                        {pack.name}
                      </h3>
                      {!isPopular && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap shrink-0">
                          {pack.badge}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mb-5 leading-relaxed font-medium ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                      {pack.subtitle}
                    </p>

                    <div className={`mb-5 pb-5 border-b ${isPopular ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black tracking-tight ${isPopular ? 'text-white' : 'text-slate-950'}`}>
                          {isFree ? '₹0' : `₹${pack.price}`}
                        </span>
                        <span className={`text-xs font-bold ml-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                          one-time
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                          isPopular ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          <Coins size={13} className="text-[#F2A93B]" />
                          {pack.credits} Credits Included
                        </span>

                        <span className={`text-[11px] font-bold flex items-center gap-1 ${isPopular ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          <Clock size={12} />
                          {pack.validity}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-6">
                      <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                        What You Can Do:
                      </p>
                      
                      {pack.features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 
                            size={16} 
                            className={`shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-emerald-600'}`} 
                          />
                          <span className={`text-xs font-medium leading-normal ${isPopular ? 'text-slate-200' : 'text-slate-700'}`}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pack)}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 group shadow-md cursor-pointer ${
                      isPopular 
                        ? 'bg-gradient-to-r from-amber-400 via-[#F2A93B] to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F1426] shadow-amber-500/20 hover:-translate-y-0.5 active:scale-98' 
                        : isFree
                        ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 hover:-translate-y-0.5 active:scale-98'
                        : 'bg-[#0F1426] text-white hover:bg-[#1A2035] hover:-translate-y-0.5 active:scale-98'
                    }`}
                  >
                    <span>{pack.cta}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Trigger for All Sachets / Bulk Packs */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAllSachetsModal(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 bg-white border border-slate-200/90 px-4 py-2 rounded-xl shadow-2xs transition-all hover:bg-slate-50 cursor-pointer"
            >
              <span>Need smaller ₹49 top-ups or Institute Bulk Packs (₹1,499)?</span>
              <span className="text-amber-600 font-extrabold underline">View All Packs</span>
            </button>
          </div>

          {/* B2B & Institutional Trainer Licensing Showcase */}
          <div className="mt-10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-emerald-400" />
                  B2B & Campus License
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  University Placement Cells & Sales Academies
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Manage student cohorts, assign 20-Day Placement Bootcamps, track filler word reduction metrics across batches, and access institutional volume discounts.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/trainer')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Trainer Dashboard Demo
                </button>
                <button
                  onClick={() => router.push('/support')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Request B2B Quote
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Collapsible Details & Referral Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16 relative z-10">
          <div className="space-y-6">
            {/* Credit Usage Matrix */}
            <div className="ui-card p-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <Mic size={18} className="text-indigo-600 shrink-0" />
                <div className="text-left text-xs font-bold text-slate-900">1 Credit = 1 Speech Audit</div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <FileText size={18} className="text-amber-600 shrink-0" />
                <div className="text-left text-xs font-bold text-slate-900">1 Credit = 1 PPT Audit</div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <MessageSquare size={18} className="text-purple-600 shrink-0" />
                <div className="text-left text-xs font-bold text-slate-900">2 Credits = 1 AI Viva</div>
              </div>
            </div>

            {/* Viral Referral Program Card */}
            <ReferralCard />
          </div>
        </section>

        {/* Satisfaction & Refund Guarantee Banner */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20 relative z-10">
          <div className="ui-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-[#151930] text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-2 border border-emerald-500/30">
                <CheckCircle size={13} />
                <span>100% Risk Free Guarantee</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">7-Day Unused Credit Refund Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
                If you purchase a credit pack and change your mind without using any credits, our support team will issue a 100% full refund within 7 calendar days. No hassle.
              </p>
            </div>
            <button
              onClick={() => router.push('/support')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs whitespace-nowrap transition-all border border-white/15 cursor-pointer shrink-0"
            >
              Learn More
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">Everything you need to know about credits, payments, and instant activation.</p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="ui-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-slate-950 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-900' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
      
      <Footer />

      {/* Manual UPI QR Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsQRModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-indigo-100 text-slate-400 hover:text-slate-600 hover:bg-indigo-200 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <QrCode size={22} className="text-indigo-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">Manual UPI Top-Up</h3>
              <p className="text-slate-500 text-xs mt-1">
                Scan with GPay, PhonePe, Paytm, or BHIM to get <span className="font-bold text-slate-800">{selectedPack?.credits || 50} Credits</span>.
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-2xl flex flex-col items-center justify-center mb-5 border border-indigo-200/80">
              <QRCodeSVG 
                value={decodeURIComponent(upiString)} 
                size={160}
                className="w-40 h-40 rounded-xl bg-white p-2 shadow-sm border border-indigo-100"
              />
              
              <div className="mt-4 flex items-center justify-between w-full bg-white px-3 py-2 rounded-xl border border-indigo-200 text-xs">
                <span className="font-mono text-slate-600 truncate mr-2">{adminUpiId}</span>
                <button 
                  onClick={copyUpiId}
                  className="text-indigo-900 font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5 pb-4 border-b border-indigo-100">
              <span className="text-xs font-semibold text-slate-500">Amount Payable</span>
              <span className="text-2xl font-extrabold text-slate-900 font-heading">₹{upiAmount}</span>
            </div>

            <button 
              onClick={() => {
                setIsQRModalOpen(false);
                router.push('/dashboard/billing?pending=true');
              }}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all bg-indigo-950 hover:bg-slate-900 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle size={18} />
              <span>Payment Completed</span>
            </button>
          </div>
        </div>
      )}

      {/* View All Sachets & Bulk Packs Modal */}
      {showAllSachetsModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAllSachetsModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="ui-badge-pill mb-2">
                <Coins size={14} className="text-[#F2A93B]" />
                <span>All Credit Sachets & Bulk Pools</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">Choose Your Credit Sachet</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Instant activation for UPI, Cards, and NetBanking</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {CREDIT_PACKAGES.map((pack) => (
                <div key={pack.id} className="ui-card p-5 flex flex-col justify-between hover:border-amber-400 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-950 text-base">{pack.name}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {pack.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{pack.subtitle}</p>
                    <div className="text-2xl font-black text-slate-950 mb-3">
                      {pack.price === 0 ? 'Free' : `₹${pack.price}`}
                      <span className="text-xs text-slate-400 font-medium ml-1">({pack.credits} Credits)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAllSachetsModal(false);
                      handlePurchase(pack);
                    }}
                    className="w-full py-2.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {pack.cta}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAllSachetsModal(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </ModernBackgroundAnimation>
  );
}
