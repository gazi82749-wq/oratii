import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { Mail, MapPin, Phone, MessageSquare, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Oratii AI support & compliance team. Official contact email, customer support, and business inquiry form.',
  openGraph: {
    title: 'Contact Us | Oratii AI Speech Coach',
    description: 'Reach out to the Oratii AI team for customer support, billing inquiries, enterprise partnerships, or technical help.',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900 w-full">
      <div className="flex-1 w-full max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 relative">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <MessageSquare size={14} className="text-[#0F1426]" /> Official Customer Support &amp; Contact
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
            Have questions about your AI speech analysis, credit packages, billing, or enterprise team batches? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Left Column: Direct Contact Info Cards */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center mb-3">
                <Mail size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">Customer Support Email</h3>
              <p className="text-xs text-slate-500 mb-3">Response time: Within 24 business hours</p>
              <a href="mailto:support@oratii.in" className="text-sm font-bold text-indigo-700 hover:underline block truncate">
                support@oratii.in
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">Privacy &amp; Compliance</h3>
              <p className="text-xs text-slate-500 mb-3">Data deletion &amp; DPDP compliance</p>
              <a href="mailto:support@oratii.in" className="text-sm font-bold text-emerald-700 hover:underline block truncate">
                support@oratii.in
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">Support Hours</h3>
              <p className="text-xs text-slate-600 font-medium">Monday – Saturday</p>
              <p className="text-xs text-slate-500">9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* Legal Links Quick Navigation */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-600">
          <p className="font-bold text-slate-800 mb-2">Need immediate policy documents?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="font-bold text-indigo-700 hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="font-bold text-indigo-700 hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/refund-policy" className="font-bold text-indigo-700 hover:underline">Cancellation &amp; Refund Policy</Link>
            <span>•</span>
            <Link href="/security" className="font-bold text-indigo-700 hover:underline">Security &amp; Ethics</Link>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
