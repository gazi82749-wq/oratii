'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Clock, ChevronRight, AlertCircle, X } from 'lucide-react';
import Footer from '@/components/Footer';

const mockTickets = [
  { id: 'TKT-8921', subject: 'Microphone not connecting in PPT Coach', status: 'open', priority: 'high', lastUpdate: '2 hours ago', messages: 3 },
  { id: 'TKT-8804', subject: 'How to cancel subscription', status: 'resolved', priority: 'medium', lastUpdate: '3 days ago', messages: 2 },
  { id: 'TKT-8755', subject: 'Slide analyzer getting stuck on PDF', status: 'in_progress', priority: 'medium', lastUpdate: '1 day ago', messages: 5 },
];

const statusStyles = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-indigo-100 text-slate-700',
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function SupportClient() {
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    alert('Ticket submitted! Our engineering team will review it shortly.');
    setIsCreating(false);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <div className="flex-1 pb-24 relative overflow-hidden">
        {/* Deep ambient glows */}
        <div className="absolute top-10 right-10 w-[600px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-[#F2A93B]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-800 text-[11px] font-extrabold uppercase tracking-widest mb-4 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span> Customer Support
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-2">
              Support Center
            </h1>
            <p className="text-base text-slate-500 font-medium">
              Need help? Open a ticket and our engineering team will assist you immediately.
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-[#F2A93B] text-[#151930] font-black rounded-xl hover:from-amber-300 hover:to-[#e0992b] transition-all shadow-md w-full sm:w-auto justify-center cursor-pointer"
          >
            <Plus size={18} /> New Ticket
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-950">Your Active Tickets</h2>
          </div>
          
          <div className="divide-y divide-indigo-100">
            {mockTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 sm:p-6 hover:bg-indigo-50 transition-colors cursor-pointer group flex flex-col gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{ticket.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${statusStyles[ticket.status as keyof typeof statusStyles]}`}>
                      {statusLabels[ticket.status as keyof typeof statusLabels]}
                    </span>
                    {ticket.priority === 'high' && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 flex items-center gap-1">
                        <AlertCircle size={10} /> High Priority
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={16} /> {ticket.messages}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} /> {ticket.lastUpdate}
                  </div>
                  <ChevronRight size={20} className="text-indigo-300 group-hover:text-slate-900 transition-colors hidden md:block" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Create Ticket Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Create Support Ticket</h2>
              <button 
                onClick={() => setIsCreating(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-slate-500 hover:bg-indigo-200 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                  >
                    <option value="low">Low - Minor issue or question</option>
                    <option value="medium">Medium - Core feature acting weird</option>
                    <option value="high">High - Completely blocked from using app</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Details</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please describe what happened, what you expected, and any steps to reproduce the issue..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none transition-all font-medium"
                    required
                  />
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-indigo-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!subject || !message}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Ticket
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      
      </div>
      <Footer />
    </div>
  );
}
