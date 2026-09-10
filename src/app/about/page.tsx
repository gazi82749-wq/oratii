import { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Our mission is to help you find your voice. Learn why we built Oratii.',
};

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900">
      
      <div className="flex-1">
      {/* About Hero Section */}
      <section className="relative bg-[#F8FAFC] pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Ambient Depth */}
        <div className="absolute top-[-5%] right-[-5%] w-[40vw] h-[40vw] bg-amber-100/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35vw] h-[35vw] bg-slate-200/30 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="w-full max-w-4xl mx-auto relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-widest mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> Our Mission
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Empowering every <br className="hidden sm:block" />
            <span className="text-[#F2A93B] inline-block mt-2">
              speaker to lead the room.
            </span>
          </h1>

          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm text-left relative mt-4 sm:mt-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-6">Why Oratii?</h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-4 sm:mb-6">
              We built Oratii because public speaking shouldn’t be terrifying. Whether you’re pitching a startup, defending a thesis, or trying to speak up more in executive boardrooms, true confidence comes from objective practice. 
            </p>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-4 sm:mb-6">
              Traditional human coaching is expensive, and rewatching your own raw video recordings can be painful. We created an AI platform that acts as your personal, non-judgmental coach—delivering real-time feedback on pacing, filler words, WPM, slide deck clutter, and viva Q&amp;A defense.
            </p>
            <p className="text-base sm:text-lg text-slate-900 font-bold leading-relaxed">
              Our goal is simple: Help you master your message and find your true voice.
            </p>

            <div className="mt-10 text-right">
               <span className="font-bold text-slate-400 block text-xs tracking-widest uppercase">The Oratii Team</span>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
