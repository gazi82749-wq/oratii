'use client';

import { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, Send } from 'lucide-react';
import type { FeedbackType } from '@/lib/admin/data';

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !message) return;
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-indigo-50">
        <div className="bg-white max-w-md w-full p-10 rounded-3xl border border-indigo-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-500 font-medium mb-8">
            Your feedback helps us make Oratii better for everyone. We appreciate you taking the time to share your thoughts.
          </p>
          <button 
            onClick={() => { setSubmitted(false); setRating(0); setMessage(''); }}
            className="px-6 py-3 bg-indigo-100 text-slate-900 font-bold rounded-xl hover:bg-indigo-200 transition-colors w-full"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 font-sans antialiased text-slate-900 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20">
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-6">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter text-slate-900 mb-3 sm:mb-4">
            We’d love your <span className="text-slate-400">feedback.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            How is Oratii working for you? Let us know what you love or what we can improve.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-indigo-200 shadow-xl shadow-indigo-200/50">
          
          {/* Feedback Type */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">What’s this regarding?</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { id: 'general', label: 'General' },
                { id: 'feature', label: 'Feature Request' },
                { id: 'bug', label: 'Bug Report' },
                { id: 'complaint', label: 'Complaint' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as FeedbackType)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                    type === t.id 
                      ? 'border-slate-900 bg-slate-900 text-white' 
                      : 'border-indigo-200 bg-white text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Rate your experience</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    size={36} 
                    className={`${
                      star <= (hoveredRating || rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'fill-indigo-100 text-indigo-200'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mb-10">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Your message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us everything..."
              rows={5}
              className="w-full p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none transition-all font-medium"
            />
          </div>

          <button 
            type="submit"
            disabled={!rating || !message || isSubmitting}
            className={`w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
              !rating || !message || isSubmitting
                ? 'bg-indigo-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20'
            }`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <><Send size={18} /> Send Feedback</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
