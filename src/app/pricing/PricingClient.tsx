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
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { CREDIT_PACKAGES, getUserCredits } from '@/lib/credits';
import { initializePayment } from '@/lib/razorpay';

export default function PricingClient() {
  const router = useRouter();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
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
      const savedUpiId = localStorage.getItem('admin_upi_id');
      if (savedUpiId) setAdminUpiId(savedUpiId);

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

  const faqs = [
    {
      q: 'How do Oratii credits work?',
      a: 'Credits are simple: 1 Credit = 1 Speech Audio Analysis, 1 Credit = 1 PPT Slide Deck Analysis, and 2 Credits = 1 AI Viva Defense Q&A Session. You only pay for what you actually use.'
    },
    {
      q: 'Do paid credits ever expire?',
      a: 'No! Paid credit packs (Value Pack & Pro Power Pack) come with lifetime validity. Your credits never expire, so you can use them whenever you need to prepare for a speech or presentation.'
    },
    {
      q: 'What is included in the Free Trial?',
      a: 'When you sign up, you automatically receive 5 Free Credits with full access to test out Speech Analysis, PPT Slide Audits, and AI Viva Defense sessions.'
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900 overflow-x-hidden relative">
      {/* Background Soft Glow Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-300/20 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-200/20 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>

      {/* Instant Success Banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-600 text-white text-center py-3 px-4 text-sm font-bold shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Sparkles size={18} className="animate-spin" />
          <span>🎉 Payment Successful! Your credits have been updated.</span>
        </div>
      )}

      <div className="flex-1 pb-24 relative">

        {/* Hero Section */}
        <section className="relative pt-12 pb-12 px-4 sm:px-6 text-center max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
            <Coins size={16} className="text-amber-500 animate-pulse" />
            <span>Pay As You Go • No Monthly Subscription</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 mb-6 leading-tight">
            Simple credit packs for <span className="text-[#F2A93B]">unmatched confidence.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            Buy credits once, use them whenever you present. No recurring monthly subscriptions or hidden charges.
          </p>

          {/* User Credit Balance Display */}
          {userCredits !== null && (
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-indigo-200 shadow-md text-slate-800 text-sm font-bold">
              <span className="text-slate-500 font-medium">Your Balance:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-sm border border-amber-300">
                <Coins size={16} className="text-amber-600" />
                {userCredits} Credits
              </span>
            </div>
          )}
        </section>

        {/* Credit Breakdown Bar */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16 relative z-10">
          <div className="bg-white rounded-3xl p-6 border border-indigo-200/90 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center shrink-0">
                <Mic size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Speech Audio Audit</div>
                <div className="text-[11px] text-indigo-700 font-semibold">1 Credit / Audit</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">PPT Slide Analyzer</div>
                <div className="text-[11px] text-blue-700 font-semibold">1 Credit / Deck</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                <MessageSquare size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">AI Viva Defense</div>
                <div className="text-[11px] text-purple-700 font-semibold">2 Credits / Session</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {CREDIT_PACKAGES.map((pack) => {
              const isPopular = pack.popular;
              const isFree = pack.price === 0;

              return (
                <div
                  key={pack.id}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 active-touch-scale ${
                    isPopular 
                      ? 'bg-gradient-to-b from-[#1E1B4B] via-[#151930] to-[#0F172A] text-white border-2 border-[#F2A93B] shadow-2xl lg:-translate-y-2 hover:-translate-y-3 ring-4 ring-[#F2A93B]/20 glow-aura-amber' 
                      : 'mobile-card-vibrant text-slate-900 border border-indigo-200 shadow-md hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-[#F2A93B] text-[#151930] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20 border border-amber-200">
                      <Sparkles size={13} className="animate-spin" />
                      <span>{pack.badge}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-xl sm:text-2xl font-black font-heading tracking-tight ${isPopular ? 'text-white' : 'text-slate-950'}`}>
                        {pack.name}
                      </h3>
                      {!isPopular && (
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-100/90 text-indigo-950 border border-indigo-200">
                          {pack.badge}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mb-6 leading-relaxed font-medium ${isPopular ? 'text-indigo-200' : 'text-slate-600'}`}>
                      {pack.subtitle}
                    </p>

                    <div className={`mb-8 pb-8 border-b ${isPopular ? 'border-indigo-900/60' : 'border-indigo-100'}`}>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl sm:text-5xl font-black tracking-tight font-heading ${isPopular ? 'text-white' : 'text-slate-950'}`}>
                          {isFree ? '₹0' : `₹${pack.price}`}
                        </span>
                        <span className={`text-xs font-extrabold ml-1 ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                          one-time
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                          isPopular ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-indigo-100/90 text-indigo-950 border border-indigo-200'
                        }`}>
                          <Coins size={14} className={isPopular ? 'text-amber-400' : 'text-indigo-700'} />
                          {pack.credits} Credits Included
                        </span>

                        <span className={`text-[11px] font-extrabold flex items-center gap-1 ${isPopular ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          <Clock size={12} />
                          {pack.validity}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className={`text-[11px] font-black uppercase tracking-wider ${isPopular ? 'text-indigo-300' : 'text-slate-600'}`}>
                        What’s Included:
                      </p>
                      
                      {pack.features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 
                            size={18} 
                            className={`shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-emerald-600'}`} 
                          />
                          <span className={`text-sm font-semibold leading-tight ${isPopular ? 'text-indigo-100' : 'text-slate-800'}`}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pack)}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-2xl text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 group shadow-md active-touch-scale ${
                      isPopular 
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-[#F2A93B] text-[#151930] hover:scale-[1.02] font-black shadow-lg shadow-amber-500/20' 
                        : isFree
                        ? 'bg-indigo-100 text-indigo-950 hover:bg-indigo-200 border border-indigo-300 hover:scale-[1.02]'
                        : 'bg-[#1B2140] text-white hover:bg-slate-900 hover:scale-[1.02]'
                    }`}
                  >
                    <span>{pack.cta}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm">Everything you need to know about credits, payments, and instant activation.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-indigo-200/90 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-indigo-50/60 transition-colors"
                  >
                    <span className="text-base leading-snug">{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-900' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-indigo-100 pt-3">
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
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all bg-indigo-950 hover:bg-slate-900 text-white shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              <span>Payment Completed</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
